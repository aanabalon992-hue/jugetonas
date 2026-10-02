// ============================================================
// JUGETONAS - Función de pagos con Mercado Pago (Supabase Edge Function)
// Nombre de la función: pagos
// Secretos necesarios (se cargan en Supabase, NUNCA en este archivo):
//   MP_ACCESS_TOKEN  -> Access Token de tu aplicación de Mercado Pago
//   SITE_URL         -> https://aanabalon992-hue.github.io/jugetonas/
// ============================================================
const MP = "https://api.mercadopago.com";
const SB_URL = Deno.env.get("SUPABASE_URL");
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MP_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
const SITE = Deno.env.get("SITE_URL") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function sb(path, opts = {}) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SRK,
      Authorization: `Bearer ${SRK}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

// El cliente solo manda QUÉ productos y su nombre.
// Los precios se calculan acá, con los datos de tu tienda, para que nadie pueda cambiarlos.
async function crear(body) {
  const nombre = String(body.nombre || "").trim().slice(0, 60);
  const ids = Array.isArray(body.ids) ? body.ids.slice(0, 50) : [];
  if (!nombre || ids.length === 0) return json({ error: "Datos incompletos" }, 400);

  const r = await sb("config?id=eq.1&select=data");
  const filas = await r.json();
  const cfg = filas[0] && filas[0].data;
  if (!cfg || !cfg.permisosActivos) return json({ error: "La tienda está cerrada" }, 400);

  const markup = Number(cfg.markup) || 0;
  const cuenta = {};
  ids.forEach((i) => { cuenta[i] = (cuenta[i] || 0) + 1; });

  const items = [];
  const detalles = [];
  let total = 0;
  for (const [id, cant] of Object.entries(cuenta)) {
    const p = (cfg.productos || []).find((x) => String(x.id) === String(id));
    if (!p) return json({ error: "Un producto ya no existe" }, 400);
    const precio = Math.round(Number(p.precioBase) * (1 + markup / 100) * 100) / 100;
    items.push({
      id: String(p.id),
      title: String(p.nombre).slice(0, 100),
      quantity: cant,
      unit_price: precio,
      currency_id: "ARS",
    });
    for (let k = 0; k < cant; k++) detalles.push({ nombre: p.nombre, precio });
    total += precio * cant;
  }
  total = Math.round(total * 100) / 100;

  const id = Date.now();
  const venta = {
    id,
    fecha: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
    cliente: nombre,
    productos: items.map((i) => `${i.title} x${i.quantity}`).join(", "),
    total,
    metodoPago: "Mercado Pago (tarjeta/cuenta)",
    estado: "Pendiente",
    detalles,
  };
  const ins = await sb("ventas", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ id, data: venta }),
  });
  if (!ins.ok) return json({ error: "No se pudo registrar la venta" }, 500);

  const pref = await fetch(`${MP}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      external_reference: String(id),
      notification_url: `${SB_URL}/functions/v1/pagos?webhook=1`,
      back_urls: {
        success: `${SITE}?pago=ok`,
        pending: `${SITE}?pago=pendiente`,
        failure: `${SITE}?pago=error`,
      },
      auto_return: "approved",
      statement_descriptor: "JUGETONAS",
    }),
  });
  const data = await pref.json();
  if (!pref.ok || !data.init_point) return json({ error: "Mercado Pago no pudo crear el pago" }, 502);
  return json({ init_point: data.init_point, venta_id: id });
}

// Mercado Pago avisa acá cuando se paga. No confiamos en el aviso:
// consultamos el pago directamente a Mercado Pago con tu clave secreta.
async function webhook(url, req) {
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  let tipo = url.searchParams.get("type") || url.searchParams.get("topic");
  if (req.method === "POST") {
    try {
      const b = await req.json();
      if (b && b.data && b.data.id) paymentId = b.data.id;
      if (b && b.type) tipo = b.type;
    } catch (e) {}
  }
  if (!paymentId || (tipo && tipo !== "payment")) return new Response("ok", { status: 200 });

  const pr = await fetch(`${MP}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  });
  if (!pr.ok) return new Response("ignorado", { status: 200 });
  const pago = await pr.json();
  const ventaId = pago.external_reference;
  if (!ventaId) return new Response("ok", { status: 200 });

  const r = await sb(`ventas?id=eq.${encodeURIComponent(ventaId)}&select=data`);
  const filas = await r.json();
  if (!filas.length) return new Response("ok", { status: 200 });
  const venta = filas[0].data;

  if (pago.status === "approved" && Number(pago.transaction_amount) + 0.01 >= Number(venta.total)) {
    venta.estado = "Pagado";
    venta.pagoId = pago.id;
    venta.medioPago = pago.payment_type_id;
    await sb(`ventas?id=eq.${encodeURIComponent(ventaId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ data: venta }),
    });
  }
  return new Response("ok", { status: 200 });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  try {
    if (url.searchParams.get("webhook")) return await webhook(url, req);
    return await crear(await req.json());
  } catch (e) {
    return json({ error: "Error interno" }, 500);
  }
});
