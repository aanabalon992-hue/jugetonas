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
