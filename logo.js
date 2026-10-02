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
