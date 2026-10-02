// ============================================
// NUBE - JUGETONAS
// Guarda productos, logo y textos en el servidor para que
// todos los visitantes vean lo mismo, y registra las ventas
// de los clientes para que las veas en tu panel.
// Necesita config-nube.js y script.js (se cargan antes).
// ============================================
const NUBE_ACTIVA = !!(NUBE_CONFIG.url && NUBE_CONFIG.anonKey && NUBE_CONFIG.adminEmail);
let NUBE_TOKEN = null;     // sesión del administrador (solo en memoria)
let NUBE_VACIA = false;    // true si el servidor todavía no tiene datos
const CLAVES_NUBE = ['productos', 'markup', 'logo', 'logoImg', 'logoAltura', 'textos', 'contacto', 'colores', 'fondo', 'permisosActivos'];

function nubeHeaders(conToken, extra) {
    const h = { apikey: NUBE_CONFIG.anonKey, 'Content-Type': 'application/json' };
    if (conToken && NUBE_TOKEN) h.Authorization = 'Bearer ' + NUBE_TOKEN;
    return Object.assign(h, extra || {});
}

// ---------- LEER LO QUE CARGÓ EL ADMIN ----------
async function cargarDesdeNube() {
    if (!NUBE_ACTIVA) return;
    try {
        const r = await fetch(NUBE_CONFIG.url + '/rest/v1/config?id=eq.1&select=data', { headers: nubeHeaders(false) });
        if (!r.ok) throw new Error(r.status);
        const filas = await r.json();
        NUBE_VACIA = filas.length === 0;
        if (!NUBE_VACIA) {
            const d = filas[0].data || {};
            CLAVES_NUBE.forEach(k => { if (d[k] !== undefined) estado[k] = d[k]; });
        }
        refrescarTodo();
        aplicarFondoAlSitio();
    } catch (e) {
        console.warn('No se pudo cargar desde el servidor', e);
    }
}

// ---------- GUARDAR (solo el administrador) ----------
let _tSubida = null;
function subirConfig() {
    clearTimeout(_tSubida);
    _tSubida = setTimeout(subirConfigYa, 500);
}

async function subirConfigYa() {
    if (!NUBE_ACTIVA || !NUBE_TOKEN) return;
    const data = {};
    CLAVES_NUBE.forEach(k => { data[k] = estado[k]; });
    try {
        const r = await fetch(NUBE_CONFIG.url + '/rest/v1/config?on_conflict=id', {
            method: 'POST',
            headers: nubeHeaders(true, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
            body: JSON.stringify({ id: 1, data: data, updated_at: new Date().toISOString() })
        });
        if (r.status === 401 || r.status === 403) mostrarNotificacion('⚠️ Tu sesión venció. Cerrá el panel y volvé a entrar.');
        else if (!r.ok) mostrarNotificacion('⚠️ No se pudo guardar en el servidor');
        else NUBE_VACIA = false;
    } catch (e) {
        mostrarNotificacion('⚠️ Sin conexión: no se guardó en el servidor');
    }
}

const _guardarLocal = window.guardarDatos;
window.guardarDatos = function() {
    const ok = _guardarLocal();
    if (NUBE_ACTIVA && NUBE_TOKEN) { subirConfig(); return true; }
    return ok;
};

// ---------- LOGIN DEL ADMINISTRADOR ----------
const _verificarLocal = window.verificarContraseña;
window.verificarContraseña = async function() {
    if (!NUBE_ACTIVA) return _verificarLocal();
    const input = document.getElementById('password-input');
    try {
        const r = await fetch(NUBE_CONFIG.url + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: { apikey: NUBE_CONFIG.anonKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: NUBE_CONFIG.adminEmail, password: input.value })
        });
        if (!r.ok) {
            alert('❌ Contraseña incorrecta');
            input.value = '';
            input.focus();
            return;
        }
        const j = await r.json();
        NUBE_TOKEN = j.access_token;
        estado.adminLogueado = true;
        cerrarLogin();
        abrirAdmin();
        if (NUBE_VACIA) subirConfigYa();
    } catch (e) {
        alert('No se pudo conectar. Revisá tu internet.');
    }
};

const _abrirAdminLocal = window.abrirAdmin;
window.abrirAdmin = function() {
    _abrirAdminLocal();
    if (NUBE_ACTIVA && NUBE_TOKEN) cargarVentasNube();
};

const _cerrarAdminLocal = window.cerrarAdmin;
window.cerrarAdmin = function() {
    _cerrarAdminLocal();
    NUBE_TOKEN = null;
};

// ---------- VENTAS ----------
async function cargarVentasNube() {
    if (!NUBE_ACTIVA || !NUBE_TOKEN) return;
    try {
        const r = await fetch(NUBE_CONFIG.url + '/rest/v1/ventas?select=id,data&order=id.asc', { headers: nubeHeaders(true) });
        if (!r.ok) throw new Error(r.status);
        const filas = await r.json();
        estado.ventas = filas.map(f => Object.assign({}, f.data, { id: f.id }));
        actualizarTablaVentas();
        mostrarNotificacion('🔄 Ventas actualizadas (' + estado.ventas.length + ')');
    } catch (e) {
        mostrarNotificacion('⚠️ No se pudieron cargar las ventas del servidor');
    }
}

async function enviarVentaNube(venta) {
    try {
        const r = await fetch(NUBE_CONFIG.url + '/rest/v1/ventas', {
            method: 'POST',
            headers: nubeHeaders(false, { Prefer: 'return=minimal' }),
            body: JSON.stringify({ id: venta.id, data: venta })
        });
        if (!r.ok) throw new Error(r.status);
    } catch (e) {
        // Si falla (sin internet), la guardamos y reintentamos la próxima vez
        const cola = JSON.parse(localStorage.getItem('jugetonas-cola') || '[]');
        cola.push(venta);
        try { localStorage.setItem('jugetonas-cola', JSON.stringify(cola)); } catch (err) {}
    }
}

async function reenviarCola() {
    if (!NUBE_ACTIVA) return;
    let cola = [];
    try { cola = JSON.parse(localStorage.getItem('jugetonas-cola') || '[]'); } catch (e) {}
    if (!cola.length) return;
    localStorage.removeItem('jugetonas-cola');
    for (const v of cola) await enviarVentaNube(v);
}

const _registrarVentaLocal = window.registrarVenta;
window.registrarVenta = function(metodo) {
    const antes = estado.ventas.length;
    _registrarVentaLocal(metodo);
    if (NUBE_ACTIVA && estado.ventas.length > antes) {
        enviarVentaNube(estado.ventas[estado.ventas.length - 1]);
    }
};

window.marcarPagado = async function(id) {
    const v = estado.ventas.find(x => x.id === id);
    if (!v || !confirm('¿Confirmás que ya recibiste el pago?')) return;
    v.estado = 'Pagado';
    guardarDatos();
    actualizarTablaVentas();
    if (NUBE_ACTIVA && NUBE_TOKEN) {
        try {
            const r = await fetch(NUBE_CONFIG.url + '/rest/v1/ventas?id=eq.' + id, {
                method: 'PATCH',
                headers: nubeHeaders(true, { Prefer: 'return=minimal' }),
                body: JSON.stringify({ data: v })
            });
            if (!r.ok) throw new Error(r.status);
        } catch (e) {
            mostrarNotificacion('⚠️ No se pudo guardar el pago en el servidor');
        }
    }
};

// ---------- PAGO AUTOMÁTICO CON MERCADO PAGO ----------
// Se activa agregando  pagosAutomaticos: true  en config-nube.js
const _pagarTarjetaManual = window.pagarConTarjeta;
window.pagarConTarjeta = async function() {
    if (!NUBE_ACTIVA || !NUBE_CONFIG.pagosAutomaticos) return _pagarTarjetaManual();
    if (estado.carrito.length === 0) { alert('El carrito está vacío'); return; }
    const nombre = prompt('¿Nombre o apodo para el pedido?', '');
    if (!nombre || !nombre.trim()) return;
    mostrarNotificacion('⏳ Abriendo Mercado Pago...');
    try {
        const r = await fetch(NUBE_CONFIG.url + '/functions/v1/pagos', {
            method: 'POST',
            headers: { apikey: NUBE_CONFIG.anonKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre.trim(), ids: estado.carrito.map(p => p.id) })
        });
        const j = await r.json();
        if (!r.ok || !j.init_point) throw new Error(j.error || r.status);
        window.location.href = j.init_point;
    } catch (e) {
        alert('No se pudo iniciar el pago: ' + e.message + '\nProbá de nuevo o elegí otra forma de pago.');
    }
};

// Cuando el cliente vuelve de Mercado Pago
function revisarRetornoPago() {
    const p = new URLSearchParams(location.search).get('pago');
    if (!p) return;
    history.replaceState(null, '', location.pathname);
    if (p === 'ok') {
        estado.carrito = [];
        guardarDatos();
        actualizarContadorCarrito();
        mostrarAnimacionCompra();
        mostrarNotificacion('✅ ¡Pago recibido! Gracias por tu compra');
    } else if (p === 'pendiente') {
        mostrarNotificacion('⏳ Tu pago está pendiente de acreditación');
    } else {
        mostrarNotificacion('❌ El pago no se completó. Podés intentar de nuevo');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    revisarRetornoPago();
    cargarDesdeNube();
    reenviarCola();
});
