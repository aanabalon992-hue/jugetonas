const CONTRASEÑA_ADMIN = "tomas27";

let estado = {
    adminLogueado: false,
    productos: [],
    carrito: [],
    ventas: [],
    permisosActivos: false,
    markup: 0,
    textos: {
        tienda: 'JUGETONAS',
        titulo: 'JUGETONAS',
        subtitulo: 'Tu tienda online de confianza. Discreto, seguro y de calidad.',
        boton: 'Explorar',
        tituloProductos: 'Nuestros Productos',
        tituloContacto: '¡Contáctanos!',
        textoContacto: '¿Preguntas? Estamos aquí para ayudarte.',
        footer: '© 2024 JUGETONAS | Mayores de 18+'
    },
    logo: "💋",
    logoImg: null,
    contacto: {
        whatsapp: "2996373515",
        mercadopago: "tomas.112504mp",
        linkPago: ""
    },
    colores: {
        principal: "#ff1493",
        secundario: "#00ffff"
    },
    fondo: {
        tipo: "degradado",
        color1: "#0a0a0a",
        color2: "#2a0a3e",
        imagen: null,
        opacidad: 50
    }
};

// INICIAR AL CARGAR
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    aplicarColoresAlSitio();
    aplicarFondoAlSitio();
    aplicarTextos();
    actualizarLogo();
    cargarProductos();
    actualizarContadorCarrito();
    mostrarMantenimiento();
    inicializarAsistente();
});

// ALMACENAMIENTO LOCAL
function guardarDatos() {
    try {
        localStorage.setItem('jugetonas-estado', JSON.stringify(estado));
        localStorage.setItem('jugetonas-carrito', JSON.stringify(estado.carrito));
        localStorage.setItem('jugetonas-ventas', JSON.stringify(estado.ventas));
        return true;
    } catch (err) {
        mostrarNotificacion('⚠️ No hay espacio para guardar. Usá imágenes más livianas.');
        return false;
    }
}

function cargarDatos() {
    const estadoGuardado = localStorage.getItem('jugetonas-estado');
    const carritoGuardado = localStorage.getItem('jugetonas-carrito');
    const ventasGuardadas = localStorage.getItem('jugetonas-ventas');
    
    if (estadoGuardado) {
        estado = { ...estado, ...JSON.parse(estadoGuardado) };
    }
    if (carritoGuardado) {
        estado.carrito = JSON.parse(carritoGuardado);
    }
    if (ventasGuardadas) {
        estado.ventas = JSON.parse(ventasGuardadas);
    }
}

// ASISTENTE DE IA
function inicializarAsistente() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="mensaje-asistente">
            ¡Hola! Puedo hacer cambios por vos. Escribime por ejemplo:<br><br>
            • <b>título Mi Tienda Sexy</b><br>
            • <b>subtítulo Envíos discretos</b><br>
            • <b>nombre tienda Jugetonas Neuquén</b><br>
            • <b>precio Vibrador 15000</b><br>
            • <b>color principal #ff0066</b><br>
            • <b>markup 20</b><br>
            • <b>abrir tienda</b> / <b>cerrar tienda</b><br>
            • <b>borrar producto Vibrador</b><br><br>
            También podés preguntarme dónde cambiar algo.
        </div>
    `;
}

function toggleAsistente() {
    const chat = document.getElementById('chat-asistente');
    chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
}

function enviarMensajeAsistente() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.toLowerCase().trim();
    const original = input.value.trim();
    
    if (!mensaje) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // Mensaje del usuario
    const msgUsuario = document.createElement('div');
    msgUsuario.className = 'mensaje-usuario';
    msgUsuario.textContent = input.value;
    chatMessages.appendChild(msgUsuario);
    
    input.value = '';
    
    // Respuesta del asistente
    setTimeout(() => {
        const msgAsistente = document.createElement('div');
        msgAsistente.className = 'mensaje-asistente';
        
        const respCmd = ejecutarComando(original);
        if (respCmd) {
            msgAsistente.innerHTML = respCmd;
        } else if (mensaje.includes('producto')) {
            msgAsistente.innerHTML = `
                ✅ Para agregar un producto:<br>
                1. Ve a la tab "Productos"<br>
                2. Rellena el formulario<br>
                3. Elige emoji o foto<br>
                4. Selecciona animación<br>
                5. Click en "Agregar"<br>
                <br>¿Necesitas ayuda con algo más?
            `;
        } else if (mensaje.includes('precio')) {
            msgAsistente.innerHTML = `
                💰 Para cambiar precios:<br>
                1. Ve a "Config"<br>
                2. Usa "Porcentaje Markup"<br>
                3. Ej: 20% aumenta todos 20%<br>
                4. Click en "Aplicar Markup"<br>
                <br>Esto afecta TODOS los productos
            `;
        } else if (mensaje.includes('color')) {
            msgAsistente.innerHTML = `
                🎨 Para cambiar colores:<br>
                1. Ve a "Diseño"<br>
                2. Elige "Color Principal" (neón)<br>
                3. Elige "Color Secundario"<br>
                4. Sube un logo (extrae colores automáticos)<br>
                5. Click en "Aplicar Colores"<br>
                <br>¡El sitio se actualiza al instante!
            `;
        } else if (mensaje.includes('venta') || mensaje.includes('vender')) {
            msgAsistente.innerHTML = `
                📊 Panel de Ventas:<br>
                ✅ Ve a "Ventas"<br>
                ✅ Ver estadísticas totales<br>
                ✅ Ver historial completo<br>
                ✅ Filtrar por cliente o método<br>
                ✅ Descargar como CSV<br>
                <br>¡Toda la info de tus clientes!
            `;
        } else if (mensaje.includes('permiso') || mensaje.includes('bloquear')) {
            msgAsistente.innerHTML = `
                🔐 Control de Permisos:<br>
                ✅ Ve a "Permisos"<br>
                ✅ Toggle ON = Tienda abierta<br>
                ❌ Toggle OFF = Mantenimiento<br>
                <br>Cuando está OFF, visitantes ven "En mantenimiento"
            `;
        } else {
            msgAsistente.innerHTML = `
                😊 No entendí bien. Prueba:<br>
                <br>
                🔧 "producto"<br>
                💰 "precio"<br>
                🎨 "color"<br>
                📊 "ventas"<br>
                🔐 "permiso"<br>
                <br>¿Algo más?
            `;
        }
        
        chatMessages.appendChild(msgAsistente);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 300);
}

// LOGIN
function abrirLogin() {
    document.getElementById('login-overlay').classList.add('active');
    document.getElementById('password-input').focus();
}

function cerrarLogin() {
    document.getElementById('login-overlay').classList.remove('active');
    document.getElementById('password-input').value = '';
}

function verificarContraseña() {
    const password = document.getElementById('password-input').value;
    if (password === CONTRASEÑA_ADMIN) {
        estado.adminLogueado = true;
        cerrarLogin();
        abrirAdmin();
    } else {
        alert('❌ Contraseña incorrecta');
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.getElementById('password-input') === document.activeElement) {
        verificarContraseña();
    }
    if (e.key === 'Enter' && document.getElementById('chat-input') === document.activeElement) {
        enviarMensajeAsistente();
    }
});

// PANEL ADMIN
function abrirAdmin() {
    document.getElementById('admin-panel').classList.add('active');
    actualizarListaProductos();
    actualizarEstadoPermiso();
    actualizarTablaVentas();
    actualizarContactos();
    cargarFormTextos();
    document.getElementById('asistente-flotante').classList.add('visible');
}

function cerrarAdmin() {
    document.getElementById('admin-panel').classList.remove('active');
    estado.adminLogueado = false;
    document.getElementById('asistente-flotante').classList.remove('visible');
    document.getElementById('chat-asistente').style.display = 'none';
}

function mostrarTab(tabId) {
    // Todas las secciones están visibles en una sola página: el botón te lleva a la que elijas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
    const sec = document.getElementById(tabId);
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// PRODUCTOS
function comprimirImagen(file, max, cb) {
    const reader = new FileReader();
    reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
            const esc = Math.min(1, max / Math.max(img.width, img.height));
            const cv = document.createElement('canvas');
            cv.width = Math.round(img.width * esc);
            cv.height = Math.round(img.height * esc);
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            cb(cv.toDataURL('image/webp', 0.85));
        };
        img.onerror = function() { alert('No se pudo leer esa foto. Probá con otra (JPG o PNG).'); };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function agregarProductoAdmin() {
    const nombre = document.getElementById('prod-nombre').value.trim();
    const precio = parseFloat(String(document.getElementById('prod-precio').value).replace(',', '.'));
    const desc = document.getElementById('prod-desc').value.trim();
    const emoji = document.getElementById('prod-emoji').value.trim();
    const animacion = document.getElementById('prod-animacion').value;
    const tipoImagen = document.querySelector('input[name="tipo-imagen"]:checked').value;
    const archivo = document.getElementById('prod-foto').files[0];

    if (!nombre) { alert('Escribí el nombre del producto'); document.getElementById('prod-nombre').focus(); return; }
    if (!(precio > 0)) { alert('Escribí un precio válido (mayor a 0)'); document.getElementById('prod-precio').focus(); return; }
    if (tipoImagen === 'foto' && !archivo) { alert('Elegí una foto, o cambiá a "Usar Emoji"'); return; }

    const producto = {
        id: Date.now(),
        nombre,
        precioBase: precio,
        emoji: emoji || '💜',
        descripcion: desc,
        foto: null,
        tipoImagen,
        animacion,
        stars: '⭐⭐⭐⭐⭐'
    };

    const guardar = function() {
        estado.productos.push(producto);
        if (!guardarDatos()) {
            estado.productos.pop();
            alert('No se pudo guardar: la foto es muy pesada o no hay espacio en el navegador. Probá con una foto más chica.');
            return;
        }
        actualizarListaProductos();
        cargarProductos();
        limpiarFormularioProducto();
        mostrarNotificacion('✅ Producto agregado: ' + nombre);
        document.getElementById('lista-productos-admin').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (tipoImagen === 'foto') {
        comprimirImagen(archivo, 800, function(dataUrl) { producto.foto = dataUrl; guardar(); });
    } else {
        guardar();
    }
}

function limpiarFormularioProducto() {
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-precio').value = '';
    document.getElementById('prod-desc').value = '';
    document.getElementById('prod-emoji').value = '💜';
    document.getElementById('prod-foto').value = '';
    document.getElementById('preview-foto').innerHTML = '';
    document.querySelector('input[name="tipo-imagen"][value="emoji"]').checked = true;
    document.getElementById('upload-foto-div').style.display = 'none';
}

function actualizarListaProductos() {
    const lista = document.getElementById('lista-productos-admin');
    
    if (estado.productos.length === 0) {
        lista.innerHTML = '<p style="color: #b0b0b0;">No hay productos aún</p>';
        return;
    }
    
    lista.innerHTML = estado.productos.map(prod => `
        <div class="producto-admin-card">
            <div class="producto-admin-miniatura-fila">${prod.tipoImagen === 'foto' && prod.foto ? `<img class="admin-miniatura" src="${prod.foto}">` : `<span style="font-size:3rem;margin-right:1rem;">${prod.emoji}</span>`}<div class="producto-admin-info">
                <h4>${prod.nombre}</h4>
                <p>$${prod.precioBase.toFixed(2)} | ${prod.animacion}</p>
                <p>${prod.descripcion.substring(0, 30)}...</p>
            </div></div>
            <div><button class="btn-admin" onclick="editarProducto(${prod.id})">✏️ Editar</button> <button class="btn-eliminar" onclick="eliminarProducto(${prod.id})">🗑️ Eliminar</button></div>
        </div>
    `).join('');
}

function eliminarProducto(id) {
    if (confirm('¿Eliminar este producto?')) {
        estado.productos = estado.productos.filter(p => p.id !== id);
        guardarDatos();
        actualizarListaProductos();
        cargarProductos();
        mostrarNotificacion('✅ Producto eliminado');
    }
}

// Mostrar/ocultar carga de foto
document.addEventListener('change', function(e) {
    if (e.target.name === 'tipo-imagen') {
        const fotoDiv = document.getElementById('upload-foto-div');
        fotoDiv.style.display = e.target.value === 'foto' ? 'block' : 'none';
    }
    
    if (e.target.id === 'prod-foto') {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview-foto');
                preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
            };
            reader.readAsDataURL(file);
        }
    }
    
    if (e.target.name === 'tipo-fondo') {
        const degradado = document.getElementById('opciones-degradado');
        const imagen = document.getElementById('opciones-imagen');
        if (e.target.value === 'degradado') {
            degradado.style.display = 'block';
            imagen.style.display = 'none';
        } else {
            degradado.style.display = 'none';
            imagen.style.display = 'block';
        }
    }
    
    if (e.target.id === 'fondo-imagen') {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview-fondo');
                preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
            };
            reader.readAsDataURL(file);
        }
    }
    
    if (e.target.id === 'config-logo-img') {
        const file = e.target.files[0];
        if (file) {
            procesarLogoArchivo(file, false);
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('preview-logo');
                preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
            };
            reader.readAsDataURL(file);
        }
    }
});

// PERMISOS
function cambiarPermiso() {
    estado.permisosActivos = document.getElementById('permiso-visitantes').checked;
    guardarDatos();
    actualizarEstadoPermiso();
    mostrarMantenimiento();
    mostrarNotificacion(estado.permisosActivos ? '✅ Tienda abierta' : '❌ Tienda bloqueada');
}

function actualizarEstadoPermiso() {
    const toggle = document.getElementById('permiso-visitantes');
    const estado_txt = document.getElementById('estado-permiso');
    toggle.checked = estado.permisosActivos;
    estado_txt.textContent = estado.permisosActivos ? '✅ ABIERTO' : '❌ BLOQUEADO';
}

function mostrarMantenimiento() {
    const overlay = document.getElementById('mantenimiento-overlay');
    if (!estado.permisosActivos) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// CONFIGURACIÓN
function guardarContacto() {
    estado.contacto.whatsapp = document.getElementById('config-whatsapp').value || estado.contacto.whatsapp;
    estado.contacto.mercadopago = document.getElementById('config-mercadopago').value || estado.contacto.mercadopago;
    estado.contacto.linkPago = document.getElementById('config-linkpago').value.trim();
    guardarDatos();
    actualizarContactos();
    mostrarNotificacion('✅ Contacto actualizado');
}

function cambiarMarkup() {
    const markup = parseFloat(document.getElementById('config-markup').value) || 0;
    estado.markup = markup;
    guardarDatos();
    cargarProductos();
    
    const info = document.getElementById('markup-info');
    if (markup > 0) {
        info.textContent = `📈 +${markup}% en todos los precios`;
    } else if (markup < 0) {
        info.textContent = `📉 ${markup}% de descuento`;
    } else {
        info.textContent = 'Sin cambios en precios';
    }
    mostrarNotificacion(`✅ Markup ${markup}% aplicado`);
}

// Busca los colores que más se destacan en la imagen (ignora blancos, negros y grises)

function cambiarColores() {
    estado.colores.principal = document.getElementById('color-principal').value;
    estado.colores.secundario = document.getElementById('color-secundario').value;
    guardarDatos();
    aplicarColoresAlSitio();
    mostrarNotificacion('✅ Colores aplicados');
}

function cambiarFondo() {
    const tipoFondo = document.querySelector('input[name="tipo-fondo"]:checked').value;
    estado.fondo.tipo = tipoFondo;
    
    if (tipoFondo === 'degradado') {
        estado.fondo.color1 = document.getElementById('fondo-color1').value;
        estado.fondo.color2 = document.getElementById('fondo-color2').value;
    } else {
        const fondoImg = document.getElementById('fondo-imagen');
        if (fondoImg.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                estado.fondo.imagen = e.target.result;
                estado.fondo.opacidad = document.getElementById('fondo-opacidad').value;
                guardarDatos();
                aplicarFondoAlSitio();
                mostrarNotificacion('✅ Fondo aplicado');
            };
            reader.readAsDataURL(fondoImg.files[0]);
            return;
        }
    }
    
    guardarDatos();
    aplicarFondoAlSitio();
    mostrarNotificacion('✅ Fondo aplicado');
}

// APLICAR ESTILOS
function aplicarColoresAlSitio() {
    document.documentElement.style.setProperty('--color-principal', estado.colores.principal);
    document.documentElement.style.setProperty('--color-secundario', estado.colores.secundario);
}

function aplicarFondoAlSitio() {
    const root = document.documentElement;
    document.body.style.opacity = '';
    if (estado.fondo.tipo === 'imagen' && estado.fondo.imagen) {
        const velo = 1 - (estado.fondo.opacidad / 100);
        document.body.style.backgroundImage = `linear-gradient(rgba(10,10,10,${velo}), rgba(10,10,10,${velo})), url('${estado.fondo.imagen}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        root.style.setProperty('--color-fondo-1', estado.fondo.color1);
        root.style.setProperty('--color-fondo-2', estado.fondo.color2);
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
    }
}

// CARRITO
function cargarProductos() {
    const grid = document.getElementById('grid-productos');
    const sinProductos = document.getElementById('sin-productos');
    
    if (estado.productos.length === 0) {
        grid.innerHTML = '';
        sinProductos.style.display = 'block';
        return;
    }
    
    sinProductos.style.display = 'none';
    grid.innerHTML = estado.productos.map(prod => {
        const precioFinal = prod.precioBase * (1 + estado.markup / 100);
        const imagen = prod.tipoImagen === 'foto' && prod.foto ? 
            `<div style="margin-bottom:1rem;"><img class="producto-foto" src="${prod.foto}" onclick="verImagen(this.src)" title="Tocá para ampliar"></div>` :
            `<div class="producto-imagen ${prod.animacion}">${prod.emoji}</div>`;
        
        return `
            <div class="producto">
                ${imagen}
                <h3>${prod.nombre}</h3>
                <div class="precio">$${precioFinal.toFixed(2)}</div>
                <p class="descripcion">${prod.descripcion}</p>
                <div class="stars">${prod.stars}</div>
                <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">🛒 Agregar al carrito</button>
            </div>
        `;
    }).join('');
}

function agregarAlCarrito(id) {
    const producto = estado.productos.find(p => p.id === id);
    if (!producto) return;
    
    const precioFinal = producto.precioBase * (1 + estado.markup / 100);
    estado.carrito.push({
        ...producto,
        precioFinal,
        carritoId: Date.now()
    });
    
    guardarDatos();
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

function actualizarContadorCarrito() {
    document.getElementById('carrito-count').textContent = estado.carrito.length;
}

function mostrarCarrito() {
    const modal = document.getElementById('carrito-modal');
    const itemsDiv = document.getElementById('carrito-items');
    
    if (estado.carrito.length === 0) {
        itemsDiv.innerHTML = '<p style="color: #b0b0b0;">Carrito vacío</p>';
    } else {
        itemsDiv.innerHTML = estado.carrito.map((item, idx) => `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <h4>${item.emoji} ${item.nombre}</h4>
                    <p>${item.descripcion.substring(0, 30)}...</p>
                </div>
                <span class="carrito-item-precio">$${item.precioFinal.toFixed(2)}</span>
                <button class="btn-eliminar-carrito" onclick="eliminarDelCarrito(${idx})">Quitar</button>
            </div>
        `).join('');
    }
    
    const total = estado.carrito.reduce((sum, item) => sum + item.precioFinal, 0);
    document.getElementById('total-precio').textContent = total.toFixed(2);
    
    modal.classList.add('active');
}

function cerrarCarrito() {
    document.getElementById('carrito-modal').classList.remove('active');
}

function eliminarDelCarrito(idx) {
    estado.carrito.splice(idx, 1);
    guardarDatos();
    actualizarContadorCarrito();
    mostrarCarrito();
}

// PAGO
function irAPago() {
    if (estado.carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    if (!estado.permisosActivos) {
        alert('La tienda está en mantenimiento');
        cerrarCarrito();
        return;
    }
    
    cerrarCarrito();
    document.getElementById('pago-modal').classList.add('active');
    
    const total = estado.carrito.reduce((sum, item) => sum + item.precioFinal, 0);
    document.getElementById('total-pago').textContent = total.toFixed(2);
    document.getElementById('total-tarjeta').textContent = total.toFixed(2);
    document.getElementById('alias-mp').textContent = estado.contacto.mercadopago;
}

function cerrarPago() {
    document.getElementById('pago-modal').classList.remove('active');
}

function copiarAlias() {
    const alias = estado.contacto.mercadopago;
    navigator.clipboard.writeText(alias);
    mostrarNotificacion('✅ Alias copiado al portapapeles');
}

function seleccionarMetodoPago(metodo) {
    cerrarPago();
    
    if (metodo === 'mercadopago') {
        registrarVenta('Mercado Pago Transferencia');
    } else if (metodo === 'whatsapp') {
        irAWhatsApp();
    }
}

function pagarConTarjeta() {
    const link = estado.contacto.linkPago;
    if (!link) {
        alert('El pago con tarjeta todavía no está configurado. Elegí transferencia o WhatsApp.');
        return;
    }
    cerrarPago();
    window.open(link, '_blank');
    registrarVenta('Tarjeta (Mercado Pago)');
}

// REGISTRO DE VENTAS

function irAWhatsApp() {
    if (estado.carrito.length === 0) return;
    
    const total = estado.carrito.reduce((sum, item) => sum + item.precioFinal, 0);
    const detalles = estado.carrito
        .map(p => `${p.emoji} ${p.nombre} - $${p.precioFinal.toFixed(2)}`)
        .join('%0A');
    
    const mensaje = `Hola! Quiero confirmar mi compra:%0A%0A${detalles}%0A%0A*Total: $${total.toFixed(2)}*`;
    const url = `https://wa.me/54${estado.contacto.whatsapp}?text=${mensaje}`;
    
    // Registrar venta
    registrarVenta('WhatsApp');
    
    window.open(url, '_blank');
}

function mostrarNotificacion(msg) {
    const notif = document.createElement('div');
    notif.className = 'notificacion';
    notif.textContent = msg;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// ACTUALIZACIONES CONTACTOS
function actualizarContactos() {
    document.getElementById('config-whatsapp').value = estado.contacto.whatsapp;
    document.getElementById('config-mercadopago').value = estado.contacto.mercadopago;
    document.getElementById('config-linkpago').value = estado.contacto.linkPago || '';
}

// VENTAS - PANEL

// ZOOM DE IMAGEN
function verImagen(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('active');
}
function cerrarImagen() {
    document.getElementById('lightbox').classList.remove('active');
}

// ===== EDITAR TEXTOS DEL SITIO =====
function esc(t) {
    return String(t).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function aplicarTextos() {
    const t = estado.textos;
    const q = sel => document.querySelector(sel);
    q('.titulo-hero').textContent = t.titulo;
    q('.hero-content p').textContent = t.subtitulo;
    q('.hero-content .btn').textContent = t.boton;
    q('.productos h2').textContent = t.tituloProductos;
    q('.contacto-content h2').textContent = t.tituloContacto;
    q('.contacto-content p').textContent = t.textoContacto;
    q('footer p').innerHTML = esc(t.footer) + ' | <a href="#" style="color: #00ffff;">Política de Privacidad</a>';
    document.title = t.tienda + ' - Sex Shop Online';
    actualizarLogo();
}

function cargarFormTextos() {
    const t = estado.textos;
    const set = (id, v) => { document.getElementById(id).value = v; };
    set('ed-tienda', t.tienda); set('ed-emoji', estado.logo);
    set('ed-titulo', t.titulo); set('ed-subtitulo', t.subtitulo);
    set('ed-boton', t.boton); set('ed-tprod', t.tituloProductos);
    set('ed-tcont', t.tituloContacto); set('ed-xcont', t.textoContacto);
    set('ed-footer', t.footer);
    if (estado.logoImg) document.getElementById('preview-logo').innerHTML = `<img src="${estado.logoImg}" alt="logo">`;
    document.getElementById('logo-tamano').value = estado.logoAltura || 100;
}

function guardarTextos() {
    const g = id => document.getElementById(id).value.trim();
    estado.textos = {
        tienda: g('ed-tienda') || 'JUGETONAS',
        titulo: g('ed-titulo'), subtitulo: g('ed-subtitulo'), boton: g('ed-boton'),
        tituloProductos: g('ed-tprod'), tituloContacto: g('ed-tcont'),
        textoContacto: g('ed-xcont'), footer: g('ed-footer')
    };
    estado.logo = g('ed-emoji') || '💋';
    guardarDatos();
    aplicarTextos();
    mostrarNotificacion('✅ Sitio actualizado');
}

function editarProducto(id) {
    const p = estado.productos.find(x => x.id === id);
    if (!p) return;
    const nombre = prompt('Nombre del producto:', p.nombre);
    if (nombre === null) return;
    const precio = prompt('Precio base:', p.precioBase);
    if (precio === null) return;
    const desc = prompt('Descripción:', p.descripcion);
    if (desc === null) return;
    const emoji = prompt('Emoji (si no tiene foto):', p.emoji);
    if (emoji === null) return;
    const pr = parseFloat(String(precio).replace(',', '.'));
    if (!nombre.trim() || !(pr > 0)) { alert('Nombre o precio inválido'); return; }
    p.nombre = nombre.trim(); p.precioBase = pr; p.descripcion = desc; p.emoji = emoji || p.emoji;
    guardarDatos();
    actualizarListaProductos();
    cargarProductos();
    mostrarNotificacion('✅ Producto actualizado');
}

// ===== ASISTENTE: COMANDOS QUE HACEN CAMBIOS =====
function refrescarTodo() {
    aplicarTextos(); actualizarLogo(); cargarProductos(); actualizarListaProductos();
    aplicarColoresAlSitio(); mostrarMantenimiento(); actualizarEstadoPermiso(); cargarFormTextos();
}

function ejecutarComando(t) {
    // Solo funciona con el panel de admin abierto
    if (!document.getElementById('admin-panel').classList.contains('active')) return null;
    let m;
    const textoCampo = (campo, etiqueta, valor) => {
        estado.textos[campo] = valor.trim();
        guardarDatos(); refrescarTodo();
        return `✅ ${etiqueta} cambiado a: <b>${esc(valor.trim())}</b>`;
    };
    if ((m = t.match(/^(?:cambiar\s+)?subt[ií]tulo(?:\s+(?:a|por))?\s*[:\-]?\s*(.+)$/i))) return textoCampo('subtitulo', 'Subtítulo', m[1]);
    if ((m = t.match(/^(?:cambiar\s+)?t[ií]tulo(?:\s+(?:a|por))?\s*[:\-]?\s*(.+)$/i))) return textoCampo('titulo', 'Título', m[1]);
    if ((m = t.match(/^(?:cambiar\s+)?nombre(?:\s+de\s+la)?\s+tienda(?:\s+(?:a|por))?\s*[:\-]?\s*(.+)$/i))) return textoCampo('tienda', 'Nombre de la tienda', m[1]);
    if ((m = t.match(/^color\s+(principal|secundario)\s+(#[0-9a-f]{6})$/i))) {
        estado.colores[m[1].toLowerCase()] = m[2];
        guardarDatos(); aplicarColoresAlSitio();
        return `🎨 Color ${m[1].toLowerCase()} cambiado a <b>${m[2]}</b>`;
    }
    if (/^abrir\s+tienda$/i.test(t)) { estado.permisosActivos = true; guardarDatos(); refrescarTodo(); return '✅ Tienda <b>abierta</b> para visitantes'; }
    if (/^cerrar\s+tienda$/i.test(t)) { estado.permisosActivos = false; guardarDatos(); refrescarTodo(); return '🔒 Tienda <b>cerrada</b> (mantenimiento)'; }
    if ((m = t.match(/^markup\s+(-?\d+(?:[.,]\d+)?)/i))) {
        estado.markup = parseFloat(m[1].replace(',', '.'));
        guardarDatos(); cargarProductos();
        return `📈 Markup en <b>${estado.markup}%</b>`;
    }
    if ((m = t.match(/^precio\s+(?:de\s+)?(.+?)\s+(?:a\s+)?\$?(\d+(?:[.,]\d+)?)$/i))) {
        const p = estado.productos.find(x => x.nombre.toLowerCase().includes(m[1].toLowerCase()));
        if (!p) return `No encontré ningún producto llamado "${esc(m[1])}".`;
        p.precioBase = parseFloat(m[2].replace(',', '.'));
        guardarDatos(); cargarProductos(); actualizarListaProductos();
        return `💰 Precio de <b>${esc(p.nombre)}</b> cambiado a <b>$${p.precioBase}</b>`;
    }
    if ((m = t.match(/^(?:borrar|eliminar)\s+producto\s+(.+)$/i))) {
        const p = estado.productos.find(x => x.nombre.toLowerCase().includes(m[1].toLowerCase()));
        if (!p) return `No encontré ningún producto llamado "${esc(m[1])}".`;
        if (!confirm('¿Borrar "' + p.nombre + '"?')) return 'Cancelado, no borré nada.';
        estado.productos = estado.productos.filter(x => x.id !== p.id);
        guardarDatos(); cargarProductos(); actualizarListaProductos();
        return `🗑️ Producto <b>${esc(p.nombre)}</b> eliminado`;
    }
    return null;
}
