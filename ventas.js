// ============================================
// VENTAS - JUGETONAS
// Registro de ventas, estados, estadísticas y CSV.
// Necesita script.js (se carga antes).
// ============================================

function registrarVenta(metodoPago) {
    // Queda PENDIENTE hasta que el admin confirme que el dinero llegó
    if (estado.carrito.length === 0) return;
    
    const total = estado.carrito.reduce((sum, item) => sum + item.precioFinal, 0);
    const productos = estado.carrito.map(p => `${p.nombre} x1`).join(', ');
    
    // Pedir nombre del cliente
    const nombreCliente = prompt('¿Nombre o apodo del cliente?', 'Cliente');
    if (!nombreCliente) return;
    
    const venta = {
        id: Date.now(),
        fecha: new Date().toLocaleString('es-AR'),
        cliente: nombreCliente,
        productos,
        total: parseFloat(total.toFixed(2)),
        metodoPago,
        estado: 'Pendiente',
        detalles: estado.carrito.map(p => ({
            nombre: p.nombre,
            precio: p.precioFinal
        }))
    };
    
    estado.ventas.push(venta);
    guardarDatos();
    
    // Limpiar carrito y mostrar animación
    estado.carrito = [];
    actualizarContadorCarrito();
    guardarDatos();
    
    mostrarAnimacionCompra();
}

function mostrarAnimacionCompra() {
    const animacion = document.getElementById('animacion-compra');
    animacion.classList.add('active');
    
    setTimeout(() => {
        animacion.classList.remove('active');
    }, 3500);
}

function marcarPagado(id) {
    const v = estado.ventas.find(x => x.id === id);
    if (v && confirm('¿Confirmás que ya recibiste el pago?')) {
        v.estado = 'Pagado';
        guardarDatos();
        actualizarTablaVentas();
    }
}

function actualizarTablaVentas() {
    const tbody = document.getElementById('tbody-ventas');
    
    if (estado.ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #b0b0b0;">No hay ventas registradas</td></tr>`;
    } else {
        tbody.innerHTML = estado.ventas.map(venta => `
            <tr>
                <td>${venta.fecha}</td>
                <td><strong>${venta.cliente}</strong></td>
                <td>${venta.productos.substring(0, 40)}...</td>
                <td style="color: var(--color-secundario); font-weight: bold;">$${venta.total.toFixed(2)}</td>
                <td>${venta.metodoPago}</td>
                <td><span class="${venta.estado === 'Pagado' ? 'estado-pagado' : 'estado-pendiente'}">${venta.estado}</span></td>
                <td>${venta.estado === 'Pagado' ? '✔' : `<button class="btn-admin" onclick="marcarPagado(${venta.id})">Marcar pagado</button>`}</td>
            </tr>
        `).join('');
    }
    
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const totalVentas = estado.ventas.length;
    const ingresoTotal = estado.ventas.reduce((sum, v) => sum + v.total, 0);
    
    document.getElementById('total-ventas-cantidad').textContent = totalVentas;
    document.getElementById('total-ventas-dinero').textContent = `$${ingresoTotal.toFixed(2)}`;
    
    if (totalVentas > 0) {
        const productos = {};
        estado.ventas.forEach(venta => {
            venta.detalles.forEach(prod => {
                productos[prod.nombre] = (productos[prod.nombre] || 0) + 1;
            });
        });
        
        const top = Object.keys(productos).reduce((a, b) => 
            productos[a] > productos[b] ? a : b
        );
        
        document.getElementById('producto-top').textContent = `${top} (${productos[top]}x)`;
    } else {
        document.getElementById('producto-top').textContent = '-';
    }
}

function filtrarVentas() {
    const filtro = document.getElementById('filtro-ventas').value.toLowerCase();
    const tbody = document.getElementById('tbody-ventas');
    
    const ventasFiltradas = estado.ventas.filter(venta => 
        venta.cliente.toLowerCase().includes(filtro) ||
        venta.metodoPago.toLowerCase().includes(filtro) ||
        venta.productos.toLowerCase().includes(filtro)
    );
    
    if (ventasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #b0b0b0;">Sin resultados</td></tr>`;
        return;
    }
    
    tbody.innerHTML = ventasFiltradas.map(venta => `
        <tr>
            <td>${venta.fecha}</td>
            <td><strong>${venta.cliente}</strong></td>
            <td>${venta.productos.substring(0, 40)}...</td>
            <td style="color: var(--color-secundario); font-weight: bold;">$${venta.total.toFixed(2)}</td>
            <td>${venta.metodoPago}</td>
            <td><span class="${venta.estado === 'Pagado' ? 'estado-pagado' : 'estado-pendiente'}">${venta.estado}</span></td>
                <td>${venta.estado === 'Pagado' ? '✔' : `<button class="btn-admin" onclick="marcarPagado(${venta.id})">Marcar pagado</button>`}</td>
        </tr>
    `).join('');
}

function descargarVentas() {
    let csv = 'Fecha,Cliente,Productos,Total,Método Pago,Estado\n';
    
    estado.ventas.forEach(venta => {
        csv += `"${venta.fecha}","${venta.cliente}","${venta.productos}","$${venta.total.toFixed(2)}","${venta.metodoPago}","${venta.estado}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `JUGETONAS-Ventas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ============================================
// CONFIGURACIÓN DEL SERVIDOR (Supabase)
// Pegá acá los datos de TU proyecto.
// Los encontrás en Supabase → Project Settings → API
// Mientras estén vacíos, el sitio funciona igual que antes
// (guarda todo solo en el navegador).
// ============================================
const NUBE_CONFIG = {
    url: "",         // Ej: https://abcdefgh.supabase.co
    anonKey: "",     // La clave "anon public" o "publishable". NUNCA la "service_role"
    adminEmail: ""   // El email del administrador que creás en Supabase
};

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JUGETONAS - Sex Shop Online</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <!-- ANIMACIÓN DE ENTRADA -->
    <div class="loading-screen" id="loading-screen">
        <div class="loader-container">
            <div class="loader"></div>
            <p class="loader-text">JUGETONAS</p>
            <div class="loader-bars">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
        </div>
    </div>

    <!-- ASISTENTE DE IA -->
    <div class="asistente-flotante" id="asistente-flotante">
        <button class="btn-asistente" onclick="toggleAsistente()">🤖</button>
        <div class="chat-asistente" id="chat-asistente" style="display: none;">
            <div class="chat-header">
                <h3>Asistente Admin</h3>
                <button onclick="toggleAsistente()" class="btn-cerrar-chat">✕</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Pregunta qué cambiar..." class="chat-input">
                <button onclick="enviarMensajeAsistente()" class="btn-enviar">Enviar</button>
            </div>
        </div>
    </div>

    <!-- BOTÓN ADMIN -->
    <button class="btn-admin-flotante" onclick="abrirLogin()" title="Panel de Administrador">⚙️ ADMIN</button>

    <!-- LOGIN ADMIN -->
    <div class="login-overlay" id="login-overlay">
        <div class="login-container">
            <div class="logo-login">🔐 ADMIN JUGETONAS</div>
            <input type="password" id="password-input" placeholder="Ingresa contraseña" class="login-input">
            <button onclick="verificarContraseña()" class="btn-login">Entrar</button>
            <button onclick="cerrarLogin()" class="btn-cerrar-login">Cancelar</button>
        </div>
    </div>

    <!-- PANEL ADMIN -->
    <div class="admin-panel" id="admin-panel">

        <div class="admin-tabs">
            <button class="tab-btn tab-destacado active" onclick="mostrarTab('tab-logo')">🖼️ LOGO</button>
            <button class="tab-btn tab-destacado tab-destacado2" onclick="mostrarTab('tab-productos')">📦 PRODUCTOS</button>
            <button class="tab-btn" onclick="mostrarTab('tab-editar')">✏️ Editar Sitio</button>
            <button class="tab-btn" onclick="mostrarTab('tab-permisos')">🔐 Permisos</button>
            <button class="tab-btn" onclick="mostrarTab('tab-config')">⚙️ Config</button>
            <button class="tab-btn" onclick="mostrarTab('tab-diseño')">🎨 Diseño</button>
            <button class="tab-btn tab-destacado" onclick="mostrarTab('tab-ventas')">📊 VENTAS</button>
            <button class="tab-btn btn-cerrar-tab" onclick="cerrarAdmin()">✕ Cerrar panel</button>
        </div>

        <!-- TAB PRODUCTOS -->
        <div id="tab-productos" class="admin-tab">
            <h2>📦 Productos de la Tienda</h2>
            <p class="info-texto" style="font-size:1.05rem;">Agregá productos con foto o emoji, elegí su animación, y editá o borrá los que ya tenés.</p>
            <div class="form-producto">
                <input type="text" id="prod-nombre" placeholder="Nombre del producto" class="admin-input">
                <input type="text" inputmode="decimal" id="prod-precio" placeholder="Precio base (ej: 1500 o 1500,50)" class="admin-input">
                <div class="opciones-producto">
                    <label><input type="radio" name="tipo-imagen" value="emoji" checked> Usar Emoji</label>
                    <label><input type="radio" name="tipo-imagen" value="foto"> Subir Foto</label>
                </div>
                <input type="text" id="prod-emoji" placeholder="Emoji" value="💜" class="admin-input">
                <div class="upload-foto" style="display: none;" id="upload-foto-div">
                    <label>📸 Subir Foto:</label>
                    <input type="file" id="prod-foto" accept="image/*" class="admin-input">
                    <div id="preview-foto" class="preview-foto"></div>
                </div>
                <textarea id="prod-desc" placeholder="Descripción" class="admin-input"></textarea>
                
                <div class="opciones-animacion">
                    <label>Animación del producto:</label>
                    <select id="prod-animacion" class="admin-input">
                        <option value="bounce-fuego">Bounce Fuego</option>
                        <option value="spin-rotacion">Spin Rotación</option>
                        <option value="pulse-latido">Pulse Latido</option>
                        <option value="swing-columpio">Swing Columpio</option>
                        <option value="shake-vibración">Shake Vibración</option>
                        <option value="glow-brillo">Glow Brillo</option>
                    </select>
                </div>

                <button onclick="agregarProductoAdmin()" class="btn-admin">➕ Agregar</button>
            </div>
            <h3>Productos Registrados</h3>
            <div id="lista-productos-admin" class="lista-productos-admin"></div>
        </div>

        <!-- TAB PERMISOS -->
        <div id="tab-permisos" class="admin-tab">
            <h2>Control de Permisos</h2>
            <div class="permiso-box">
                <h3>Permitir compras a visitantes</h3>
                <div class="toggle-permiso">
                    <label class="switch">
                        <input type="checkbox" id="permiso-visitantes" onchange="cambiarPermiso()">
                        <span class="slider"></span>
                    </label>
                    <span id="estado-permiso" class="estado-texto">❌ BLOQUEADO</span>
                </div>
                <p class="permiso-info">✅ ACTIVADO = Visitantes pueden comprar</p>
                <p class="permiso-info">❌ BLOQUEADO = Sitio en mantenimiento</p>
            </div>
        </div>

        <!-- TAB CONFIGURACIÓN -->
        <div id="tab-config" class="admin-tab">
            <h2>Configuración</h2>
            
            <div class="config-section">
                <h3>Contacto</h3>
                <input type="text" id="config-whatsapp" placeholder="WhatsApp" value="2996373515" class="admin-input">
                <input type="text" id="config-mercadopago" placeholder="Alias MP" value="tomas.112504mp" class="admin-input">
                <input type="text" id="config-linkpago" placeholder="Link de pago de Mercado Pago (https://...)" class="admin-input">
                <p class="info-texto">Creá el link en Mercado Pago → Cobrar → Link de pago. Es lo que usan los clientes para pagar con tarjeta.</p>
                <button onclick="guardarContacto()" class="btn-admin">Guardar</button>
            </div>

            <div class="config-section">
                <h3>Porcentaje Markup (%)</h3>
                <p class="info-texto">Aumenta automáticamente precios</p>
                <input type="number" id="config-markup" placeholder="Ej: 20" min="0" max="500" step="0.1" class="admin-input">
                <button onclick="cambiarMarkup()" class="btn-admin">Aplicar Markup</button>
                <p id="markup-info" class="markup-info"></p>
            </div>
        </div>

        <!-- TAB DISEÑO -->
        <div id="tab-diseño" class="admin-tab">
            <h2>Diseño y Personalización</h2>
            
            <div class="config-section">
                <h3>🎨 Personalizar Colores</h3>
                <label>Color Principal (Neón):</label>
                <input type="color" id="color-principal" value="#ff1493" class="admin-input color-picker">
                <label>Color Secundario (Neón):</label>
                <input type="color" id="color-secundario" value="#00ffff" class="admin-input color-picker">
                <button onclick="cambiarColores()" class="btn-admin">Aplicar Colores</button>
            </div>

            <div class="config-section">
                <h3>🖼️ Personalizar Fondo</h3>
                <div class="opciones-fondo">
                    <label><input type="radio" name="tipo-fondo" value="degradado" checked> Degradado</label>
                    <label><input type="radio" name="tipo-fondo" value="imagen"> Imagen</label>
                </div>
                
                <div id="opciones-degradado" class="opciones-fondo-config">
                    <label>Color 1:</label>
                    <input type="color" id="fondo-color1" value="#0a0a0a" class="admin-input color-picker">
                    <label>Color 2:</label>
                    <input type="color" id="fondo-color2" value="#2a0a3e" class="admin-input color-picker">
                </div>

                <div id="opciones-imagen" class="opciones-fondo-config" style="display: none;">
                    <label>Subir imagen de fondo:</label>
                    <input type="file" id="fondo-imagen" accept="image/*" class="admin-input">
                    <label>Opacidad (0-100):</label>
                    <input type="number" id="fondo-opacidad" min="0" max="100" value="50" class="admin-input">
                    <div id="preview-fondo" class="preview-foto"></div>
                </div>

                <button onclick="cambiarFondo()" class="btn-admin">Aplicar Fondo</button>
            </div>
        </div>

        <!-- TAB LOGO -->
        <div id="tab-logo" class="admin-tab active">
            <h2>🖼️ Cambiar el Logo de la Tienda</h2>
            <p class="info-texto" style="font-size:1.05rem;">1) Elegí tu imagen &nbsp;→&nbsp; 2) Se pone sola en el sitio &nbsp;→&nbsp; 3) Ajustá el tamaño si querés.</p>
            <div class="config-section">
                <h3>📸 Logo de la Tienda</h3>
                <p class="info-texto">Sube una imagen y los colores del sitio se ajustarán automáticamente</p>
                <input type="file" id="config-logo-img" accept="image/*" class="admin-input">
                <label style="display:flex; gap:.5rem; align-items:center; cursor:pointer;"><input type="checkbox" id="logo-adaptar" checked> Adaptar los colores y el fondo del sitio a este logo</label>
                <div id="preview-logo" class="preview-foto"></div>
                <label>Tamaño del logo en el sitio:</label>
                <input type="range" id="logo-tamano" min="30" max="250" value="100" oninput="cambiarTamanoLogo(this.value)" style="width:100%; margin-bottom:1rem;">
                <button onclick="cambiarLogo()" class="btn-admin">🎨 Adaptar colores al logo</button>
                <button onclick="quitarLogo()" class="btn-admin" style="background:#c91432; color:#fff;">Quitar Logo</button>
                <p id="color-info" class="markup-info"></p>
            </div>

            
        </div>

        <!-- TAB EDITAR SITIO -->
        <div id="tab-editar" class="admin-tab">
            <h2>✏️ Editar textos del sitio</h2>
            <div class="config-section">
                <label>Nombre de la tienda (junto al logo):</label>
                <input type="text" id="ed-tienda" class="admin-input">
                <label>Emoji del logo (si no hay imagen):</label>
                <input type="text" id="ed-emoji" class="admin-input">
                <label>Título principal:</label>
                <input type="text" id="ed-titulo" class="admin-input">
                <label>Subtítulo:</label>
                <input type="text" id="ed-subtitulo" class="admin-input">
                <label>Texto del botón principal:</label>
                <input type="text" id="ed-boton" class="admin-input">
                <label>Título de la sección productos:</label>
                <input type="text" id="ed-tprod" class="admin-input">
                <label>Título de contacto:</label>
                <input type="text" id="ed-tcont" class="admin-input">
                <label>Texto de contacto:</label>
                <input type="text" id="ed-xcont" class="admin-input">
                <label>Texto del pie de página:</label>
                <input type="text" id="ed-footer" class="admin-input">
                <button onclick="guardarTextos()" class="btn-admin">💾 Guardar cambios</button>
            </div>
            <p class="info-texto">Para editar un producto (nombre, precio, descripción) andá a 📦 Productos y tocá ✏️ Editar.</p>
        </div>

        <!-- TAB VENTAS -->
        <div id="tab-ventas" class="admin-tab">
            <h2>📊 Historial de Ventas</h2>
            <div class="ventas-info">
                <div class="stat-box">
                    <h3>Total Ventas</h3>
                    <p id="total-ventas-cantidad" class="stat-numero">0</p>
                </div>
                <div class="stat-box">
                    <h3>Ingresos Totales</h3>
                    <p id="total-ventas-dinero" class="stat-numero">$0</p>
                </div>
                <div class="stat-box">
                    <h3>Producto Más Vendido</h3>
                    <p id="producto-top" class="stat-numero">-</p>
                </div>
            </div>

            <div class="ventas-filtros">
                <input type="text" id="filtro-ventas" placeholder="Buscar por nombre o método de pago..." class="admin-input">
                <button onclick="filtrarVentas()" class="btn-admin">Filtrar</button>
                <button onclick="if(typeof cargarVentasNube==='function') cargarVentasNube()" class="btn-admin">🔄 Actualizar</button>
                <button onclick="descargarVentas()" class="btn-admin">📥 Descargar CSV</button>
            </div>

            <div class="tabla-ventas">
                <table id="tabla-ventas">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Nombre Cliente</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Método Pago</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-ventas">
                        <tr>
                            <td colspan="7" style="text-align: center; color: #b0b0b0;">No hay ventas registradas</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- HEADER -->
    <header>
        <nav>
            <div class="logo" id="logo-header">
                <img id="logo-img" src="" style="display: none; object-fit: contain; max-width: 220px;">
                <span id="logo-texto">💋 JUGETONAS</span>
            </div>
            <ul>
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#productos">Productos</a></li>
                <li><a href="#contacto">Contacto</a></li>
                <li><a href="#" class="carrito-icon" onclick="mostrarCarrito(); return false;">🛒 (<span id="carrito-count">0</span>)</a></li>
            </ul>
        </nav>
    </header>

    <!-- HERO -->
    <section class="hero" id="inicio">
        <div class="hero-content">
            <h1 class="titulo-hero">JUGETONAS</h1>
            <p>Tu tienda online de confianza. Discreto, seguro y de calidad.</p>
            <button class="btn" onclick="document.getElementById('productos').scrollIntoView({behavior: 'smooth'})">Explorar</button>
        </div>
    </section>

    <!-- MANTENIMIENTO -->
    <div class="mantenimiento-overlay" id="mantenimiento-overlay">
        <div class="mantenimiento-box">
            <h2>🔧 Sitio en Mantenimiento</h2>
            <p>Estamos preparando sorpresas para ti.</p>
            <p>📞 <a href="tel:+5492996373515">+54 9 2996373515</a></p>
        </div>
    </div>

    <!-- PRODUCTOS -->
    <section class="productos" id="productos">
        <h2>Nuestros Productos</h2>
        <div class="grid-productos" id="grid-productos"></div>
        <div id="sin-productos" class="sin-productos">
            <p>No hay productos disponibles aún.</p>
        </div>
    </section>

    <!-- CONTACTO -->
    <section class="contacto" id="contacto">
        <div class="contacto-content">
            <h2>¡Contáctanos!</h2>
            <p>¿Preguntas? Estamos aquí para ayudarte.</p>
            <div class="contacto-botones">
                <a href="tel:+5492996373515" class="btn-contacto">📞 Llamar</a>
                <a href="https://wa.me/5492996373515" target="_blank" class="btn-contacto">💬 WhatsApp</a>
            </div>
        </div>
    </section>

    <!-- CARRITO -->
    <div class="modal" id="carrito-modal">
        <div class="modal-content">
            <span class="close" onclick="cerrarCarrito()">&times;</span>
            <h2>Tu Carrito</h2>
            <div id="carrito-items"></div>
            <div class="carrito-total">
                <h3>Total: $<span id="total-precio">0</span></h3>
            </div>
            <button class="btn" onclick="irAPago()" style="width: 100%; margin-top: 1rem;">💳 Ir a Pagar</button>
        </div>
    </div>

    <!-- PAGO -->
    <div class="modal" id="pago-modal">
        <div class="modal-content">
            <span class="close" onclick="cerrarPago()">&times;</span>
            <h2>💳 Forma de Pago</h2>
            
            <div class="pago-opciones">
                <div class="opcion-pago">
                    <h3>💰 Mercado Pago</h3>
                    <p>Transfiere a través de tu alias:</p>
                    <div class="alias-box">
                        <span id="alias-mp">tomas.112504mp</span>
                        <button onclick="copiarAlias()" class="btn-copiar">Copiar</button>
                    </div>
                    <p class="info-pago">Total: $<span id="total-pago">0</span></p>
                    <button class="btn" onclick="seleccionarMetodoPago('mercadopago')" style="width: 100%; margin-top: 1rem;">✅ Seleccionar</button>
                </div>

                <div class="opcion-pago">
                    <h3>🏦 Tarjeta de Débito</h3>
                    <p>Se paga en la página segura de Mercado Pago (acepta débito de cualquier banco)</p>
                    <p class="info-pago">Total: $<span id="total-tarjeta">0</span></p>
                    <button class="btn" onclick="pagarConTarjeta()" style="width: 100%;">💳 Pagar con tarjeta</button>
                </div>

                <div class="opcion-pago">
                    <h3>📱 WhatsApp</h3>
                    <p>Confirma tu compra por aquí</p>
                    <button class="btn" onclick="seleccionarMetodoPago('whatsapp')" style="width: 100%;">📲 Enviar por WhatsApp</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ANIMACIÓN COMPRA -->
    <div class="animacion-compra" id="animacion-compra">
        <div class="aji-container">
            <div class="aji">🌶️</div>
            <div class="aji">🔥</div>
            <div class="aji">🌶️</div>
            <div class="aji">🔥</div>
        </div>
        <div class="mensaje-compra">¡COMPRA CONFIRMADA! 🎉</div>
    </div>

    <div class="lightbox" id="lightbox" onclick="cerrarImagen()"><img id="lightbox-img" src="" alt="Producto"></div>

    <!-- FOOTER -->
    <footer>
        <p>&copy; 2024 JUGETONAS | Mayores de 18+ | <a href="#" style="color: #00ffff;">Política de Privacidad</a></p>
    </footer>

    <script src="config-nube.js"></script>
    <script src="script.js"></script>
    <script src="logo.js"></script>
    <script src="ventas.js"></script>
    <script src="nube.js"></script>
</body>
</html>

// ============================================
// LOGO - JUGETONAS
// Cambiar logo, tamaño y adaptar colores a la imagen.
// Necesita script.js (se carga antes).
// ============================================

function cambiarLogo() {
    // Botón "Adaptar colores al logo": usa el logo actual o el archivo elegido
    const f = document.getElementById('config-logo-img').files[0];
    if (f) { procesarLogoArchivo(f, true); return; }
    if (!estado.logoImg) { alert('Primero elegí una imagen de logo'); return; }
    const img = new Image();
    img.onload = function() {
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        cv.getContext('2d').drawImage(img, 0, 0);
        adaptarColoresAlLogo(cv);
    };
    img.src = estado.logoImg;
}

function procesarLogoArchivo(file, forzarColores) {
    const reader = new FileReader();
    reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
            const max = 500;
            const esc = Math.min(1, max / Math.max(img.width, img.height));
            const cv = document.createElement('canvas');
            cv.width = Math.round(img.width * esc);
            cv.height = Math.round(img.height * esc);
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            estado.logoImg = cv.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
            actualizarLogo();
            document.getElementById('preview-logo').innerHTML = `<img src="${estado.logoImg}" alt="logo">`;
            if (forzarColores || document.getElementById('logo-adaptar').checked) adaptarColoresAlLogo(cv);
            guardarDatos();
            mostrarNotificacion('✅ Logo cambiado');
        };
        img.onerror = function() { alert('No se pudo leer esa imagen. Probá con PNG o JPG.'); };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
        const d = mx - mn;
        s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
        if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (mx === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    return [h, s, l];
}

function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function paletaDesdePixeles(data) {
    const cubos = {};
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const [h, sat, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        if (sat < 0.25 || l > 0.92 || l < 0.08) continue;
        const k = Math.floor(h / 20) % 18;
        const c = cubos[k] || (cubos[k] = { peso: 0, n: 0, h: 0, s: 0 });
        c.peso += sat; c.n++; c.h += h; c.s += sat;
    }
    const lista = Object.values(cubos).sort((a, b) => b.peso - a.peso);
    if (lista.length === 0) return null;
    const p = lista[0], hp = p.h / p.n, sp = p.s / p.n;
    let hs = (hp + 180) % 360, ss = 0.9;
    for (const c of lista.slice(1)) {
        const hc = c.h / c.n;
        const dif = Math.min(Math.abs(hc - hp), 360 - Math.abs(hc - hp));
        if (dif >= 40) { hs = hc; ss = c.s / c.n; break; }
    }
    return {
        principal: hslToHex(hp, Math.max(sp, 0.75), 0.55),
        secundario: hslToHex(hs, Math.max(ss, 0.75), 0.55),
        fondo1: hslToHex(hp, 0.35, 0.05),
        fondo2: hslToHex(hp, 0.5, 0.14)
    };
}

function adaptarColoresAlLogo(canvas) {
    const pq = document.createElement('canvas');
    pq.width = pq.height = 64;
    const ctx = pq.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 64, 64);
    const pal = paletaDesdePixeles(ctx.getImageData(0, 0, 64, 64).data);
    const info = document.getElementById('color-info');
    if (!pal) {
        info.textContent = 'Ese logo no tiene colores marcados (es blanco, negro o gris). Elegí los colores a mano en 🎨 Diseño.';
        return;
    }
    estado.colores.principal = pal.principal;
    estado.colores.secundario = pal.secundario;
    estado.fondo.tipo = 'degradado';
    estado.fondo.color1 = pal.fondo1;
    estado.fondo.color2 = pal.fondo2;
    guardarDatos();
    aplicarColoresAlSitio();
    aplicarFondoAlSitio();
    document.getElementById('color-principal').value = pal.principal;
    document.getElementById('color-secundario').value = pal.secundario;
    document.getElementById('fondo-color1').value = pal.fondo1;
    document.getElementById('fondo-color2').value = pal.fondo2;
    info.innerHTML = `🎨 Colores tomados del logo: <span style="background:${pal.principal};padding:2px 14px;border-radius:4px;">&nbsp;</span> <span style="background:${pal.secundario};padding:2px 14px;border-radius:4px;">&nbsp;</span> (el fondo también se ajustó)`;
}

function cambiarTamanoLogo(v) {
    estado.logoAltura = parseInt(v);
    guardarDatos();
    actualizarLogo();
}

function quitarLogo() {
    estado.logoImg = null;
    guardarDatos();
    actualizarLogo();
    document.getElementById('preview-logo').innerHTML = '';
    mostrarNotificacion('✅ Logo quitado');
}

function actualizarLogo() {
    const logoTexto = document.getElementById('logo-texto');
    const logoImg = document.getElementById('logo-img');
    
    if (estado.logoImg) {
        logoImg.src = estado.logoImg;
        logoImg.style.height = (estado.logoAltura || 100) + 'px';
        logoImg.style.display = 'inline';
        logoTexto.style.display = 'none';
    } else {
        logoImg.style.display = 'none';
        logoTexto.style.display = 'inline';
        logoTexto.textContent = estado.logo + ' ' + estado.textos.tienda;
    }
}

function extraerColorDominante(imagenUrl, callback) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 10, 10);
        const imageData = ctx.getImageData(0, 0, 10, 10);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        
        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));
        
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        callback(hex);
    };
    img.src = imagenUrl;
}

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

document.addEventListener('DOMContentLoaded', function() {
    cargarDesdeNube();
    reenviarCola();
});

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

/* VARIABLES CSS */
:root {
    --color-principal: #ff1493;
    --color-secundario: #00ffff;
    --color-fondo-1: #0a0a0a;
    --color-fondo-2: #2a0a3e;
    --color-texto: #ffffff;
    --color-borde: #ff1493;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
    color: var(--color-texto);
    background-attachment: fixed;
}

/* ANIMACIÓN DE ENTRADA */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeOutLoader 0.5s ease-in-out 2s forwards;
}

.loader-container {
    text-align: center;
}

.loader {
    width: 80px;
    height: 80px;
    border: 4px solid var(--color-secundario);
    border-top: 4px solid var(--color-principal);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loader-text {
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    letter-spacing: 3px;
}

.loader-bars {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.bar {
    width: 4px;
    height: 30px;
    background: var(--color-principal);
    border-radius: 2px;
    animation: bounce 0.6s ease-in-out infinite;
}

.bar:nth-child(2) { animation-delay: 0.1s; }
.bar:nth-child(3) { animation-delay: 0.2s; }
.bar:nth-child(4) { animation-delay: 0.3s; }

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

@keyframes fadeOutLoader {
    0% { opacity: 1; visibility: visible; }
    100% { opacity: 0; visibility: hidden; }
}

/* ASISTENTE FLOTANTE */
.asistente-flotante {
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 998;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.btn-asistente {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-principal), var(--color-secundario));
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);
    transition: transform 0.3s, box-shadow 0.3s;
}

.btn-asistente:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
}

.chat-asistente {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    background: rgba(10, 10, 10, 0.95);
    border: 2px solid var(--color-principal);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 30px rgba(255, 20, 147, 0.4);
    z-index: 999;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.chat-header {
    padding: 1rem;
    border-bottom: 2px solid var(--color-principal);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 20, 147, 0.1);
}

.chat-header h3 {
    color: var(--color-principal);
    font-size: 1rem;
}

.btn-cerrar-chat {
    background: none;
    border: none;
    color: var(--color-principal);
    font-size: 1.5rem;
    cursor: pointer;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.mensaje-usuario {
    align-self: flex-end;
    background: var(--color-principal);
    color: #000;
    padding: 0.8rem 1rem;
    border-radius: 12px 0 12px 12px;
    max-width: 80%;
}

.mensaje-asistente {
    align-self: flex-start;
    background: rgba(0, 255, 255, 0.2);
    color: var(--color-secundario);
    padding: 0.8rem 1rem;
    border-radius: 0 12px 12px 12px;
    max-width: 80%;
    border-left: 3px solid var(--color-secundario);
}

.chat-input-area {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 2px solid var(--color-principal);
}

.chat-input {
    flex: 1;
    background: rgba(255, 20, 147, 0.1);
    border: 1px solid var(--color-secundario);
    color: var(--color-texto);
    padding: 0.5rem;
    border-radius: 5px;
    font-size: 0.9rem;
}

.chat-input::placeholder {
    color: #888;
}

.btn-enviar {
    background: var(--color-principal);
    color: #000;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

/* LOGIN */
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.login-overlay.active {
    display: flex;
}

.login-container {
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
    border: 2px solid var(--color-principal);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 0 40px rgba(255, 20, 147, 0.5);
    animation: slideUp 0.4s ease-out;
}

.logo-login {
    font-size: 1.8rem;
    font-weight: bold;
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1.5rem;
}

.login-input {
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 1rem;
    background: rgba(255, 20, 147, 0.1);
    border: 1px solid var(--color-secundario);
    color: var(--color-texto);
    border-radius: 5px;
    font-size: 1rem;
}

.login-input::placeholder {
    color: #888;
}

.btn-login, .btn-cerrar-login {
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 0.5rem;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
}

.btn-login {
    background: var(--color-principal);
    color: #000;
}

.btn-cerrar-login {
    background: transparent;
    border: 1px solid var(--color-secundario);
    color: var(--color-secundario);
}

/* BOTÓN ADMIN FLOTANTE */
.btn-admin-flotante {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-principal), var(--color-secundario));
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);
    transition: transform 0.3s;
    z-index: 995;
}

.btn-admin-flotante:hover {
    transform: scale(1.1);
}

/* PANEL ADMIN */
.admin-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
    display: none;
    flex-direction: column;
    z-index: 10001;
    overflow: auto;
}

.admin-panel.active {
    display: flex;
}

.admin-header {
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    color: #000;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.admin-header h1 {
    font-size: 1.5rem;
}

.btn-cerrar-admin {
    background: #000;
    color: var(--color-principal);
    border: 2px solid var(--color-principal);
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.admin-tabs {
    display: flex;
    gap: 0;
    background: rgba(0, 0, 0, 0.3);
    padding: 0;
    overflow-x: auto;
    border-bottom: 2px solid var(--color-principal);
}

.tab-btn {
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--color-texto);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
    white-space: nowrap;
}

.tab-btn:hover {
    background: rgba(255, 20, 147, 0.2);
}

.tab-btn.active {
    color: var(--color-principal);
    border-bottom-color: var(--color-principal);
    background: rgba(255, 20, 147, 0.1);
}

.admin-tab {
    display: none;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.admin-tab.active {
    display: block;
}

.admin-tab h2 {
    color: var(--color-principal);
    margin-bottom: 1.5rem;
}

.admin-tab h3 {
    color: var(--color-secundario);
    margin: 1.5rem 0 0.8rem;
}

.form-producto, .config-section {
    background: rgba(255, 20, 147, 0.1);
    border: 1px solid var(--color-principal);
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
}

.admin-input {
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 1rem;
    background: rgba(255, 20, 147, 0.05);
    border: 1px solid var(--color-secundario);
    color: var(--color-texto);
    border-radius: 5px;
    font-size: 0.95rem;
}

.admin-input::placeholder {
    color: #888;
}

.admin-input option {
    background: var(--color-fondo-1);
    color: var(--color-texto);
}

.color-picker {
    cursor: pointer;
    height: 50px;
}

.opciones-producto, .opciones-fondo {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.opciones-producto label, .opciones-fondo label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.opciones-producto input[type="radio"], .opciones-fondo input[type="radio"] {
    cursor: pointer;
}

.upload-foto {
    background: rgba(0, 255, 255, 0.1);
    padding: 1rem;
    border: 1px dashed var(--color-secundario);
    border-radius: 8px;
    margin-bottom: 1rem;
}

.preview-foto {
    max-width: 200px;
    max-height: 200px;
    margin-top: 1rem;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--color-principal);
}

.preview-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.opciones-animacion {
    margin-bottom: 1rem;
}

.opciones-animacion label {
    color: var(--color-secundario);
    display: block;
    margin-bottom: 0.5rem;
}

.btn-admin {
    background: var(--color-principal);
    color: #000;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin-right: 0.5rem;
    transition: all 0.3s;
}

.btn-admin:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 20, 147, 0.5);
}

.lista-productos-admin {
    display: grid;
    gap: 1rem;
}

.producto-admin-card {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid var(--color-secundario);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.producto-admin-info {
    flex: 1;
}

.producto-admin-info h4 {
    color: var(--color-principal);
    margin-bottom: 0.3rem;
}

.producto-admin-info p {
    font-size: 0.85rem;
    color: #b0b0b0;
}

.btn-eliminar {
    background: #c91432;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
}

.btn-eliminar:hover {
    background: #a01027;
}

/* TOGGLE SWITCH */
.switch {
    display: inline-block;
    width: 60px;
    height: 30px;
    margin-right: 1rem;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #444;
    transition: 0.3s;
    border-radius: 30px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--color-principal);
}

input:checked + .slider:before {
    transform: translateX(30px);
}

.permiso-box {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid var(--color-secundario);
    padding: 1.5rem;
    border-radius: 10px;
}

.toggle-permiso {
    display: flex;
    align-items: center;
    margin: 1rem 0;
}

.estado-texto {
    font-weight: bold;
    font-size: 1.1rem;
}

.permiso-info {
    margin: 0.5rem 0;
    color: #b0b0b0;
    font-size: 0.9rem;
}

.config-section {
    background: rgba(255, 20, 147, 0.1);
    border: 1px solid var(--color-principal);
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
}

.info-texto {
    color: #b0b0b0;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.markup-info {
    color: var(--color-secundario);
    margin-top: 0.5rem;
    font-weight: bold;
}

.opciones-fondo-config {
    background: rgba(0, 255, 255, 0.05);
    padding: 1rem;
    border: 1px dashed var(--color-secundario);
    border-radius: 8px;
    margin-bottom: 1rem;
}

/* VENTAS */
.ventas-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-box {
    background: rgba(0, 255, 255, 0.15);
    border: 2px solid var(--color-secundario);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
}

.stat-box h3 {
    color: var(--color-secundario);
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.stat-numero {
    font-size: 2rem !important;
    color: var(--color-principal);
    font-weight: bold;
}

.ventas-filtros {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.ventas-filtros input {
    flex: 1;
}

.tabla-ventas {
    overflow-x: auto;
    background: rgba(255, 20, 147, 0.05);
    border: 1px solid var(--color-principal);
    border-radius: 8px;
    padding: 0;
}

.tabla-ventas table {
    width: 100%;
    border-collapse: collapse;
}

.tabla-ventas thead {
    background: linear-gradient(90deg, rgba(255, 20, 147, 0.3), rgba(0, 255, 255, 0.2));
}

.tabla-ventas th {
    color: var(--color-principal);
    padding: 1rem;
    text-align: left;
    border-bottom: 2px solid var(--color-principal);
    font-weight: bold;
}

.tabla-ventas td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(255, 20, 147, 0.2);
    color: #d0d0d0;
}

.tabla-ventas tr:hover {
    background: rgba(255, 20, 147, 0.1);
}

.estado-pagado {
    color: #4ade80;
    font-weight: bold;
}

.estado-pendiente {
    color: #fbbf24;
    font-weight: bold;
}

.estado-cancelado {
    color: #f87171;
    font-weight: bold;
}

/* HEADER */
header {
    background: linear-gradient(90deg, rgba(10, 10, 10, 0.95), rgba(42, 10, 62, 0.95));
    border-bottom: 3px solid var(--color-principal);
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    z-index: 100;
}

header nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
}

.logo #logo-texto {
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
}

header nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
    align-items: center;
}

header nav a {
    color: var(--color-texto);
    text-decoration: none;
    transition: color 0.3s;
    position: relative;
}

header nav a:hover {
    color: var(--color-principal);
}

header nav a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--color-principal);
    transition: width 0.3s;
}

header nav a:hover::after {
    width: 100%;
}

.carrito-icon {
    background: rgba(255, 20, 147, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
}

/* HERO */
.hero {
    text-align: center;
    padding: 8rem 2rem;
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
}

.hero-content {
    animation: slideUp 1s ease-out 2.5s both;
}

.titulo-hero {
    font-size: 4rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 4px;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    color: #d0d0d0;
}

.btn {
    background: linear-gradient(135deg, var(--color-principal), var(--color-secundario));
    color: #000;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    transition: transform 0.3s;
}

.btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* MANTENIMIENTO */
.mantenimiento-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 5000;
}

.mantenimiento-overlay.active {
    display: flex;
}

.mantenimiento-box {
    text-align: center;
    background: rgba(255, 20, 147, 0.1);
    border: 3px solid var(--color-principal);
    padding: 3rem;
    border-radius: 15px;
    animation: pulse 2s infinite;
}

.mantenimiento-box h2 {
    color: var(--color-principal);
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.mantenimiento-box p {
    font-size: 1.1rem;
    color: #d0d0d0;
    margin-bottom: 1.5rem;
}

.mantenimiento-box a {
    color: var(--color-secundario);
    text-decoration: none;
    font-weight: bold;
    font-size: 1.3rem;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 20, 147, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6); }
}

/* PRODUCTOS */
.productos {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.productos h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.grid-productos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.producto {
    background: rgba(255, 20, 147, 0.1);
    border: 2px solid var(--color-principal);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
}

.producto:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(255, 20, 147, 0.4);
}

.producto-foto {
    width: 100%;
    height: auto;
    max-height: 420px;
    object-fit: contain;
    background: rgba(0,0,0,0.35);
    border-radius: 10px;
    display: block;
    cursor: zoom-in;
    transition: transform 0.3s;
}

.producto-foto:hover { transform: scale(1.03); }

.lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.92);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    cursor: zoom-out;
}
.lightbox.active { display: flex; }
.lightbox img {
    max-width: 95vw;
    max-height: 92vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 0 40px var(--color-principal);
}

.producto-imagen {
    font-size: 8rem;
    line-height: 1.1;
    display: block;
    margin-bottom: 1rem;
}

.producto-imagen.bounce-fuego {
    animation: bounce-fuego 0.8s ease-in-out infinite;
}

@keyframes bounce-fuego {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
}

.producto-imagen.spin-rotacion {
    animation: spin-rotacion 1s linear infinite;
}

@keyframes spin-rotacion {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.producto-imagen.pulse-latido {
    animation: pulse-latido 0.8s ease-in-out infinite;
}

@keyframes pulse-latido {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

.producto-imagen.swing-columpio {
    animation: swing-columpio 1s ease-in-out infinite;
}

@keyframes swing-columpio {
    0%, 100% { transform: rotateZ(0deg); }
    50% { transform: rotateZ(10deg); }
}

.producto-imagen.shake-vibración {
    animation: shake-vibración 0.5s ease-in-out infinite;
}

@keyframes shake-vibración {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.producto-imagen.glow-brillo {
    animation: glow-brillo 1.5s ease-in-out infinite;
}

@keyframes glow-brillo {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px var(--color-principal)); }
    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px var(--color-principal)); }
}

.producto h3 {
    color: var(--color-principal);
    margin-bottom: 0.5rem;
}

.producto .precio {
    color: var(--color-secundario);
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.producto .descripcion {
    color: #b0b0b0;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    min-height: 40px;
}

.producto .stars {
    color: #fbbf24;
    margin-bottom: 1rem;
}

.btn-agregar {
    background: var(--color-principal);
    color: #000;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
    transition: all 0.3s;
}

.btn-agregar:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 20, 147, 0.6);
}

.sin-productos {
    text-align: center;
    padding: 2rem;
    color: #b0b0b0;
    font-size: 1.1rem;
}

/* CONTACTO */
.contacto {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, rgba(42, 10, 62, 0.7), rgba(10, 10, 10, 0.7));
    border-top: 3px solid var(--color-principal);
}

.contacto h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--color-principal);
}

.contacto p {
    color: #d0d0d0;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.contacto-botones {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-contacto {
    background: linear-gradient(135deg, var(--color-principal), var(--color-secundario));
    color: #000;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.3s;
}

.btn-contacto:hover {
    transform: scale(1.1);
}

/* MODALES */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: linear-gradient(135deg, var(--color-fondo-1), var(--color-fondo-2));
    border: 2px solid var(--color-principal);
    padding: 2rem;
    border-radius: 15px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease-out;
    position: relative;
}

.close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    font-size: 2rem;
    color: var(--color-principal);
    cursor: pointer;
    transition: color 0.3s;
}

.close:hover {
    color: var(--color-secundario);
}

.modal h2 {
    color: var(--color-principal);
    margin-bottom: 1.5rem;
}

/* CARRITO */
#carrito-items {
    margin-bottom: 1.5rem;
}

.carrito-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 0.8rem;
    border-left: 3px solid var(--color-secundario);
}

.carrito-item-info {
    flex: 1;
}

.carrito-item-info h4 {
    color: var(--color-principal);
    margin-bottom: 0.3rem;
}

.carrito-item-info p {
    color: #b0b0b0;
    font-size: 0.9rem;
}

.carrito-item-precio {
    color: var(--color-secundario);
    font-weight: bold;
    margin-right: 1rem;
}

.btn-eliminar-carrito {
    background: #c91432;
    color: #fff;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
}

.carrito-total {
    background: rgba(255, 20, 147, 0.2);
    padding: 1rem;
    border-radius: 5px;
    text-align: right;
}

.carrito-total h3 {
    color: var(--color-secundario);
}

/* PAGO */
.pago-opciones {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.opcion-pago {
    background: rgba(0, 255, 255, 0.1);
    border: 2px solid var(--color-secundario);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
}

.opcion-pago h3 {
    color: var(--color-principal);
    margin-bottom: 1rem;
}

.opcion-pago p {
    color: #b0b0b0;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.alias-box {
    background: rgba(255, 20, 147, 0.2);
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.alias-box span {
    color: var(--color-principal);
    font-weight: bold;
    font-size: 1.1rem;
    font-family: monospace;
}

.btn-copiar {
    background: var(--color-secundario);
    color: #000;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.85rem;
}

.info-pago {
    color: var(--color-secundario);
    font-weight: bold;
    font-size: 1rem;
}

/* FORMULARIO TARJETA */
.form-tarjeta {
    background: rgba(0, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid var(--color-secundario);
}

.form-tarjeta .admin-input {
    margin-bottom: 1rem;
}

/* ANIMACIÓN COMPRA */
.animacion-compra {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    flex-direction: column;
}

.animacion-compra.active {
    display: flex;
    animation: fadeIn 0.3s ease-out;
}

.aji-container {
    position: relative;
    width: 200px;
    height: 200px;
    margin-bottom: 2rem;
}

.aji {
    position: absolute;
    font-size: 3rem;
    animation: flotarYdesaparecer 3s ease-out infinite;
}

.aji:nth-child(1) { left: 20%; animation-delay: 0s; }
.aji:nth-child(2) { left: 40%; animation-delay: 0.3s; }
.aji:nth-child(3) { left: 60%; animation-delay: 0.6s; }
.aji:nth-child(4) { left: 80%; animation-delay: 0.9s; }

@keyframes flotarYdesaparecer {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-300px) scale(0.5); opacity: 0; }
}

.mensaje-compra {
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(90deg, var(--color-principal), var(--color-secundario));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: bounce 1s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* NOTIFICACIONES */
.notificacion {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--color-principal);
    color: #000;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    font-weight: bold;
    box-shadow: 0 0 20px rgba(255, 20, 147, 0.6);
    animation: slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s forwards;
    z-index: 3000;
}

@keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
}

/* FOOTER */
footer {
    text-align: center;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.7);
    border-top: 2px solid var(--color-principal);
    color: #b0b0b0;
}

footer a {
    color: var(--color-secundario);
    text-decoration: none;
}

footer a:hover {
    text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .titulo-hero {
        font-size: 2rem;
    }

    header nav {
        flex-direction: column;
        gap: 1rem;
    }

    header nav ul {
        flex-direction: column;
        gap: 1rem;
    }

    .admin-tabs {
        flex-wrap: wrap;
    }

    .tab-btn {
        padding: 0.8rem 1rem;
        font-size: 0.85rem;
    }

    .admin-panel {
        width: 100%;
    }

    .pago-opciones {
        grid-template-columns: 1fr;
    }

    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }

    .chat-asistente {
        width: 90%;
        height: 400px;
        bottom: 80px;
        right: 5%;
    }

    .grid-productos {
        grid-template-columns: 1fr;
    }

    .tabla-ventas {
        font-size: 0.85rem;
    }

    .tabla-ventas th, .tabla-ventas td {
        padding: 0.6rem;
    }
}

.logo img { height: 60px; width: auto; }

.admin-tabs { flex-wrap: wrap; }
.asistente-flotante { display: none; }
.asistente-flotante.visible { display: flex; z-index: 10002; }
.chat-asistente { z-index: 10003; }
.admin-tab label { display: block; color: var(--color-secundario); margin-bottom: 0.3rem; }

.tab-destacado { background: linear-gradient(90deg, var(--color-principal), var(--color-secundario)) !important; color: #000 !important; font-weight: bold; animation: pulse 2s infinite; }
#tab-logo .preview-foto { max-width: 340px; max-height: 260px; min-height: 80px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; margin: 1rem 0; }
#tab-logo .preview-foto img { object-fit: contain; }
#tab-logo input[type="file"] { border: 3px dashed var(--color-principal); padding: 1.5rem; font-size: 1.1rem; cursor: pointer; background: rgba(255,20,147,0.1); }
#tab-logo .btn-admin { font-size: 1.05rem; padding: 1rem 1.6rem; }
.logo img { height: 80px; }

.tab-destacado2 { background: linear-gradient(90deg, var(--color-secundario), var(--color-principal)) !important; }
#tab-productos input[type="file"] { border: 3px dashed var(--color-secundario); padding: 1.2rem; font-size: 1.05rem; cursor: pointer; background: rgba(0,255,255,0.08); }
#tab-productos .preview-foto { max-width: 300px; max-height: 300px; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
#tab-productos .preview-foto img { object-fit: contain; }
#tab-productos .btn-admin { font-size: 1.05rem; padding: 0.9rem 1.5rem; }
.admin-miniatura { width: 70px; height: 70px; object-fit: contain; background: rgba(0,0,0,0.4); border-radius: 8px; margin-right: 1rem; }
.producto-admin-card { gap: 0.5rem; flex-wrap: wrap; }
.producto-admin-miniatura-fila { display:flex; align-items:center; flex:1; }

.btn-admin-flotante { width: auto !important; height: 60px; padding: 0 1.4rem; border-radius: 30px !important; font-size: 1.1rem !important; font-weight: bold; color: #000; letter-spacing: 1px; }
.tab-btn { font-size: 1.05rem; padding: 1.1rem 1.6rem; }
.logo img { height: 100px; }
.logo #logo-texto { font-size: 2rem; }
header { padding: 1.2rem 2rem; }

/* PANEL ADMIN: TODAS LAS SECCIONES VISIBLES EN UNA SOLA PÁGINA */
.admin-tab { display: block !important; border-top: 4px solid var(--color-principal); margin-top: 1.5rem; scroll-margin-top: 110px; }
.admin-tabs { position: sticky; top: 0; z-index: 20; background: rgba(10,10,10,0.97); }

/* ===== ORDEN Y PROLIJIDAD ===== */
.notificacion { z-index: 30000 !important; top: 1rem; bottom: auto !important; right: 1rem; }
.tab-destacado { animation: none !important; }
.admin-header h1 { font-size: 1.3rem; }
.admin-tabs { justify-content: center; gap: 0.3rem; padding: 0.4rem; }
.tab-btn { font-size: 0.95rem; padding: 0.7rem 1.1rem; border-radius: 8px; border-bottom: none; }
.tab-btn.active { outline: 2px solid var(--color-principal); }
.admin-tab { padding: 1.5rem; margin: 1.2rem auto 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-top: 4px solid var(--color-principal); border-radius: 12px; width: min(1000px, 94%); }
.admin-tab h2 { font-size: 1.4rem; margin-bottom: 1rem; }
.admin-tab h3 { font-size: 1.05rem; margin: 1rem 0 0.6rem; }
.admin-tab label { font-size: 0.9rem; margin: 0.4rem 0 0.2rem; }
.admin-input { margin-bottom: 0.8rem; }
.form-producto, .config-section { padding: 1.2rem; margin-bottom: 1.2rem; }
.btn-admin { margin: 0.3rem 0.4rem 0.3rem 0; font-size: 1rem; padding: 0.8rem 1.4rem; }
.producto-admin-card { padding: 0.8rem 1rem; }
.lista-productos-admin { gap: 0.7rem; }
@media (min-width: 900px) {
    .form-producto { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.2rem; }
    .form-producto > .opciones-producto, .form-producto > .upload-foto, .form-producto > textarea, .form-producto > .opciones-animacion, .form-producto > button { grid-column: 1 / -1; }
}
@media (max-width: 768px) {
    .admin-tab { padding: 1rem; width: 96%; }
    .btn-admin-flotante { height: 52px; font-size: 1rem !important; }
}

.btn-cerrar-tab { background: #222 !important; color: #fff !important; border: 1px solid #666 !important; margin-left: auto; }
.admin-tab { scroll-margin-top: 80px; }

/* Interruptor de permisos: el óvalo rojo se estiraba por todo el panel */
.switch { position: relative !important; display: inline-block; width: 60px; height: 30px; flex-shrink: 0; overflow: hidden; border-radius: 30px; }
.switch .slider { position: absolute; inset: 0; }

/* El botón ADMIN tiene que verse también cuando el sitio está en mantenimiento */
.btn-admin-flotante { z-index: 6000 !important; }
