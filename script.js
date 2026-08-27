/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO CON ZOOM Y PAN
   ===================================================================== */
let canvas, ctx;

// Rango cartesiano base por defecto (Escala 1.0)
const RANGO_BASE = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

// Rango dinámico actualizable por zoom o redimensionamiento
let RANGO = { ...RANGO_BASE };

/* =====================================================================
   CONTROL DE NAVEGACIÓN PORTADA / APLICACIÓN
   ===================================================================== */
function entrarAlEntorno() {
  const portada = document.getElementById('seccion-portada');
  const app = document.getElementById('seccion-aplicacion');
  
  if (portada) portada.classList.add('oculto');
  if (app) app.classList.remove('oculto');
  
  setTimeout(() => {
    redimensionarCanvas();
    conmutarPanel();
    renderizarMatematicasGlobal();
  }, 50);
}

function volverAPortada() {
  const portada = document.getElementById('seccion-portada');
  const app = document.getElementById('seccion-aplicacion');
  
  if (app) app.classList.add('oculto');
  if (portada) portada.classList.remove('oculto');
}

/* =====================================================================
   AJUSTE DE RESOLUCIÓN Y REDIMENSIONAMIENTO RESPONSIVO DEL CANVAS
   ===================================================================== */
function redimensionarCanvas() {
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = (rect.width * (460 / 700)) * dpr;

  if (ctx) {
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  actualizarGrafica();
}

/* =====================================================================
   INICIALIZACIÓN Y EVENTOS DE INTERACCIÓN
   ===================================================================== */
window.addEventListener('load', () => {
  canvas = document.getElementById('planoCartesiano');
  if (!canvas || !canvas.getContext) {
    const box = document.querySelector('.grafica-box-global');
    if (box) {
      box.innerHTML = '<p style="color:#b91c1c;padding:1rem;">⚠ Su navegador no soporta Canvas HTML5. Actualice su navegador.</p>';
    }
    return;
  }
  ctx = canvas.getContext('2d');
  
  window.addEventListener('resize', redimensionarCanvas);

  document.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('input', () => {
      actualizarGrafica();
    });
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    cambiarZoom(factor);
  }, { passive: false });

  renderizarMatematicasGlobal();
});

function renderizarMatematicasGlobal() {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });
  } else {
    setTimeout(renderizarMatematicasGlobal, 150);
  }
}

/* =====================================================================
   SISTEMA DE ZOOM INTERACTIVO
   ===================================================================== */
function cambiarZoom(factor) {
  const rangoX = (RANGO.maxX - RANGO.minX) * factor;
  if (rangoX < 2 || rangoX > 200) return;

  const centroX = (RANGO.minX + RANGO.maxX) / 2;
  const centroY = (RANGO.minY + RANGO.maxY) / 2;

  const semiAncho = (RANGO.maxX - RANGO.minX) * factor / 2;
  const semiAlto = (RANGO.maxY - RANGO.minY) * factor / 2;

  RANGO.minX = centroX - semiAncho;
  RANGO.maxX = centroX + semiAncho;
  RANGO.minY = centroY - semiAlto;
  RANGO.maxY = centroY + semiAlto;

  actualizarIndicadorZoom();
  actualizarGrafica();
}

function resetearZoom() {
  RANGO = { ...RANGO_BASE };
  actualizarIndicadorZoom();
  actualizarGrafica();
}

function actualizarIndicadorZoom() {
  const escala = (RANGO_BASE.maxX - RANGO_BASE.minX) / (RANGO.maxX - RANGO.minX);
  const ind = document.getElementById('indicador-zoom');
  if (ind) ind.textContent = `Escala: ${escala.toFixed(1)}x`;
}

/* =====================================================================
   CONMUTACIÓN DE PANELES Y REFLEJO DE SELECCIÓN
   ===================================================================== */
function conmutarPanel() {
  const tipo = document.getElementById('tipo-algebra').value;
  const paneles = [
    'lineal', 'fraccionaria', 'cuadratica', 
    'sistema', 'polinomica', 'cuartica', 'quintica', 'absoluto'
  ];

  paneles.forEach(p => {
    const el = document.getElementById(`panel-${p}`);
    if (el) el.classList.add('oculto');
  });

  const activo = document.getElementById(`panel-${tipo}`);
  if (activo) activo.classList.remove('oculto');

  switch (tipo) {
    case 'lineal': resolverLineal(); break;
    case 'fraccionaria': resolverFraccionaria(); break;
    case 'cuadratica': calcularEcuacion(); break;
    case 'sistema': resolverSistema(); break;
    case 'polinomica': resolverPolinomica(); break;
    case 'cuartica': resolverCuartica(); break;
    case 'quintica': resolverQuintica(); break;
    case 'absoluto': resolverAbsoluto(); break;
  }
}

/* =====================================================================
   MOTOR GRÁFICO DEL PLANO CARTESIANO EN CANVAS HTML5
   ===================================================================== */
function xAObjetoCanvas(x, ancho) {
  return ((x - RANGO.minX) / (RANGO.maxX - RANGO.minX)) * ancho;
}

function yAObjetoCanvas(y, alto) {
  return alto - (((y - RANGO.minY) / (RANGO.maxY - RANGO.minY)) * alto);
}

function dibujarEjesYRed(ancho, alto) {
  ctx.clearRect(0, 0, ancho, alto);

  // Cuadrícula secundaria
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  const pasoX = calcularPasoOptimo(RANGO.maxX - RANGO.minX);
  const pasoY = calcularPasoOptimo(RANGO.maxY - RANGO.minY);

  const inicioX = Math.ceil(RANGO.minX / pasoX) * pasoX;
  for (let x = inicioX; x <= RANGO.maxX; x += pasoX) {
    const cx = xAObjetoCanvas(x, ancho);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, alto);
    ctx.stroke();
  }

  const inicioY = Math.ceil(RANGO.minY / pasoY) * pasoY;
  for (let y = inicioY; y <= RANGO.maxY; y += pasoY) {
    const cy = yAObjetoCanvas(y, alto);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(ancho, cy);
    ctx.stroke();
  }

  // Ejes Principales X e Y
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2;

  const ejeX = yAObjetoCanvas(0, alto);
  const ejeY = xAObjetoCanvas(0, ancho);

  // Eje X
  ctx.beginPath();
  ctx.moveTo(0, ejeX);
  ctx.lineTo(ancho, ejeX);
  ctx.stroke();

  // Eje Y
  ctx.beginPath();
  ctx.moveTo(ejeY, 0);
  ctx.lineTo(ejeY, alto);
  ctx.stroke();

  // Marcas de graduación y números
  ctx.fillStyle = '#475569';
  ctx.font = '11px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let x = inicioX; x <= RANGO.maxX; x += pasoX) {
    if (Math.abs(x) < 1e-6) continue;
    const cx = xAObjetoCanvas(x, ancho);
    ctx.fillText(x.toString(), cx, Math.min(Math.max(ejeX + 4, 2), alto - 15));
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let y = inicioY; y <= RANGO.maxY; y += pasoY) {
    if (Math.abs(y) < 1e-6) continue;
    const cy = yAObjetoCanvas(y, alto);
    ctx.fillText(y.toString(), Math.min(Math.max(ejeY - 6, 25), ancho - 5), cy);
  }
}

function calcularPasoOptimo(rango) {
  const rawPaso = rango / 10;
  const magnitud = Math.pow(10, Math.floor(Math.log10(rawPaso)));
  const residual = rawPaso / magnitud;

  if (residual < 1.5) return magnitud;
  if (residual < 3.5) return 2 * magnitud;
  if (residual < 7.5) return 5 * magnitud;
  return 10 * magnitud;
}

function dibujarCurva(evaluarFn, color = '#2563eb', grosor = 2.5, esDiscontinua = false) {
  const rect = canvas.getBoundingClientRect();
  const ancho = rect.width;
  const alto = rect.height;

  ctx.strokeStyle = color;
  ctx.lineWidth = grosor;
  ctx.setLineDash(esDiscontinua ? [5, 5] : []);

  ctx.beginPath();
  let dibujando = false;
  const pasos = ancho * 2;

  for (let i = 0; i <= pasos; i++) {
    const px = (i / pasos) * ancho;
    const x = RANGO.minX + (i / pasos) * (RANGO.maxX - RANGO.minX);
    const y = evaluarFn(x);

    if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e4) {
      dibujando = false;
      continue;
    }

    const py = yAObjetoCanvas(y, alto);

    if (!dibujando) {
      ctx.moveTo(px, py);
      dibujando = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function dibujarPuntoDestacado(x, y, color = '#ef4444', etiqueta = '') {
  const rect = canvas.getBoundingClientRect();
  const cx = xAObjetoCanvas(x, rect.width);
  const cy = yAObjetoCanvas(y, rect.height);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (etiqueta) {
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillText(etiqueta, cx + 8, cy - 8);
  }
}

function actualizarGrafica() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const ancho = rect.width;
  const alto = rect.height;

  dibujarEjesYRed(ancho, alto);

  const tipo = document.getElementById('tipo-algebra').value;

  if (tipo === 'lineal') {
    const a = parseFloat(document.getElementById('lin-a').value) || 0;
    const b = parseFloat(document.getElementById('lin-b').value) || 0;
    dibujarCurva(x => a * x + b, '#2563eb');
    if (a !== 0) {
      const raiz = -b / a;
      dibujarPuntoDestacado(raiz, 0, '#ef4444', `x = ${raiz.toFixed(2)}`);
    }
  } else if (tipo === 'fraccionaria') {
    const a = parseFloat(document.getElementById('frac-a').value) || 0;
    const b = parseFloat(document.getElementById('frac-b').value) || 0;
    const c = parseFloat(document.getElementById('frac-c').value) || 0;

    // Asíntota vertical en x = -b
    const av = -b;
    const cxAv = xAObjetoCanvas(av, ancho);
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cxAv, 0);
    ctx.lineTo(cxAv, alto);
    ctx.stroke();
    ctx.setLineDash([]);

    dibujarCurva(x => (Math.abs(x - av) < 1e-3) ? NaN : (a / (x + b)) + c, '#2563eb');
  } else if (tipo === 'cuadratica') {
    const a = parseFloat(document.getElementById('coef-a').value) || 0;
    const b = parseFloat(document.getElementById('coef-b').value) || 0;
    const c = parseFloat(document.getElementById('coef-c').value) || 0;

    dibujarCurva(x => a * x * x + b * x + c, '#2563eb');

    if (a !== 0) {
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        dibujarPuntoDestacado(x1, 0, '#ef4444', `x1 = ${x1.toFixed(2)}`);
        if (Math.abs(disc) > 1e-6) {
          dibujarPuntoDestacado(x2, 0, '#ef4444', `x2 = ${x2.toFixed(2)}`);
        }
      }
      const xv = -b / (2 * a);
      const yv = a * xv * xv + b * xv + c;
      dibujarPuntoDestacado(xv, yv, '#10b981', `Vér. (${xv.toFixed(2)}, ${yv.toFixed(2)})`);
    }
  } else if (tipo === 'sistema') {
    const a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
    const b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
    const c1 = parseFloat(document.getElementById('sys-c1').value) || 0;

    const a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
    const b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
    const c2 = parseFloat(document.getElementById('sys-c2').value) || 0;

    if (b1 !== 0) dibujarCurva(x => (c1 - a1 * x) / b1, '#2563eb');
    if (b2 !== 0) dibujarCurva(x => (c2 - a2 * x) / b2, '#10b981');

    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) > 1e-6) {
      const xSol = (c1 * b2 - c2 * b1) / det;
      const ySol = (a1 * c2 - a2 * c1) / det;
      dibujarPuntoDestacado(xSol, ySol, '#ef4444', `S(${xSol.toFixed(2)}, ${ySol.toFixed(2)})`);
    }
  } else if (tipo === 'polinomica') {
    const a = parseFloat(document.getElementById('poly-a').value) || 0;
    const b = parseFloat(document.getElementById('poly-b').value) || 0;
    const c = parseFloat(document.getElementById('poly-c').value) || 0;
    const d = parseFloat(document.getElementById('poly-d').value) || 0;
    dibujarCurva(x => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d, '#2563eb');
  } else if (tipo === 'cuartica') {
    const a = parseFloat(document.getElementById('quart-a').value) || 0;
    const b = parseFloat(document.getElementById('quart-b').value) || 0;
    const c = parseFloat(document.getElementById('quart-c').value) || 0;
    const d = parseFloat(document.getElementById('quart-d').value) || 0;
    const e = parseFloat(document.getElementById('quart-e').value) || 0;
    dibujarCurva(x => a * Math.pow(x, 4) + b * Math.pow(x, 3) + c * Math.pow(x, 2) + d * x + e, '#2563eb');
  } else if (tipo === 'quintica') {
    const a = parseFloat(document.getElementById('quint-a').value) || 0;
    const b = parseFloat(document.getElementById('quint-b').value) || 0;
    const c = parseFloat(document.getElementById('quint-c').value) || 0;
    const d = parseFloat(document.getElementById('quint-d').value) || 0;
    const e = parseFloat(document.getElementById('quint-e').value) || 0;
    const f = parseFloat(document.getElementById('quint-f').value) || 0;
    dibujarCurva(x => a * Math.pow(x, 5) + b * Math.pow(x, 4) + c * Math.pow(x, 3) + d * Math.pow(x, 2) + e * x + f, '#2563eb');
  } else if (tipo === 'absoluto') {
    const a = parseFloat(document.getElementById('abs-a').value) || 0;
    const b = parseFloat(document.getElementById('abs-b').value) || 0;
    const c = parseFloat(document.getElementById('abs-c').value) || 0;
    dibujarCurva(x => Math.abs(a * x + b) - c, '#2563eb');
  }
}

/* =====================================================================
   FUNCIONES DE RESOLUCIÓN ANALÍTICA Y PROCEDIMIENTO PASO A PASO
   ===================================================================== */

// 1. Resolver Ecuación Lineal
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const resDiv = document.getElementById('resultado');

  if (a === 0) {
    resDiv.innerHTML = b === 0 
      ? `<p>Identidad trivial: $$0 = 0$$. Admite infinitas soluciones reales.</p>`
      : `<p class="resultado-final">Inconsistencia: $$${b} = 0$$. La ecuación no posee solución real.</p>`;
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  const x = -b / a;
  let html = `
    <p><strong>Paso 1: Identificación de términos.</strong></p>
    <p>Ecuación planteada: $$${a}x + (${b}) = 0$$</p>
    <p><strong>Paso 2: Aplicación del transposición de términos.</strong></p>
    <p>Despejamos el término independiente: $$${a}x = ${-b}$$</p>
    <p><strong>Paso 3: División por el coeficiente principal ($a = ${a}$).</strong></p>
    <p>$$x = \\frac{${-b}}{${a}}$$</p>
    <div class="resultado-final">
      Solución Exacta: $$x = ${x.toFixed(4)}$$
    </div>
  `;
  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 2. Resolver Ecuación Fraccionaria
function resolverFraccionaria() {
  const a = parseFloat(document.getElementById('frac-a').value) || 0;
  const b = parseFloat(document.getElementById('frac-b').value) || 0;
  const c = parseFloat(document.getElementById('frac-c').value) || 0;
  const resDiv = document.getElementById('resultado');

  let html = `<p><strong>Paso 1: Análisis de Restricciones del Dominio.</strong></p>`;
  html += `<p>El denominador debe ser distinto de cero: $$x + (${b}) \\neq 0 \\implies x \\neq ${-b}$$</p>`;

  if (c === 0) {
    html += `<p class="resultado-final">Si $$c = 0$$, la ecuación sólo se satisface si $$a = 0$$.</p>`;
  } else {
    const x = -b - (a / c);
    html += `
      <p><strong>Paso 2: Transposición y reducción algebraica.</strong></p>
      <p>$$\\frac{${a}}{x + (${b})} = ${-c}$$</p>
      <p>$$x + (${b}) = \\frac{${a}}{${-c}} = ${(-a/c).toFixed(4)}$$</p>
      <p>$$x = ${(-a/c).toFixed(4)} - (${b})$$</p>
      <div class="resultado-final">
        Solución: $$x = ${x.toFixed(4)}$$ ${Math.abs(x - (-b)) < 1e-6 ? '(Inválida por restricción de dominio)' : ''}
      </div>
    `;
  }
  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 3. Resolver Ecuación Cuadrática
function calcularEcuacion() {
  const a = parseFloat(document.getElementById('coef-a').value) || 0;
  const b = parseFloat(document.getElementById('coef-b').value) || 0;
  const c = parseFloat(document.getElementById('coef-c').value) || 0;
  const resDiv = document.getElementById('resultado');

  if (a === 0) {
    resolverLineal();
    return;
  }

  const delta = b * b - 4 * a * c;
  let html = `
    <p><strong>Paso 1: Cálculo del Discriminante ($\\Delta$).</strong></p>
    <p>$$\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${delta}$$</p>
  `;

  if (delta > 0) {
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    html += `
      <p><strong>Paso 2: Aplicación de la Formula General (Bhaskara).</strong></p>
      <p>Como $\\Delta > 0$, existen dos raíces reales y distintas:</p>
      <p>$$x_1 = \\frac{-(${b}) + \\sqrt{${delta}}}{2(${a})} = ${x1.toFixed(4)}$$</p>
      <p>$$x_2 = \\frac{-(${b}) - \\sqrt{${delta}}}{2(${a})} = ${x2.toFixed(4)}$$</p>
      <div class="resultado-final">
        Conjunto Solución: $$\\mathcal{S} = \\{${x1.toFixed(4)}, ${x2.toFixed(4)}\\}$$
      </div>
    `;
  } else if (delta === 0) {
    const x = -b / (2 * a);
    html += `
      <p><strong>Paso 2: Raíz Doble Real.</strong></p>
      <p>Como $\\Delta = 0$, existe una única solución real doble:</p>
      <p>$$x_1 = x_2 = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$$</p>
      <div class="resultado-final">
        Conjunto Solución: $$\\mathcal{S} = \\{${x.toFixed(4)}\\}$$
      </div>
    `;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-delta) / (2 * a)).toFixed(4);
    html += `
      <p><strong>Paso 2: Raíces Complejas Conjugadas.</strong></p>
      <p>Como $\\Delta < 0$, las soluciones pertenecen al campo complejo $\\mathbb{C}$:</p>
      <div class="resultado-final">
        Conjunto Solución: $$x = ${real} \\pm ${imag}i$$
      </div>
    `;
  }
  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 4. Resolver Sistema Lineal 2x2
function resolverSistema() {
  const a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
  const b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
  const c1 = parseFloat(document.getElementById('sys-c1').value) || 0;

  const a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
  const b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
  const c2 = parseFloat(document.getElementById('sys-c2').value) || 0;

  const resDiv = document.getElementById('resultado');

  const det = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  let html = `
    <p><strong>Paso 1: Cálculo del Determinante del Sistema ($\\Delta_S$).</strong></p>
    <p>$$\\Delta_S = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${b1})(${a2}) = ${det}$$</p>
  `;

  if (Math.abs(det) < 1e-6) {
    if (Math.abs(detX) < 1e-6 && Math.abs(detY) < 1e-6) {
      html += `<div class="resultado-final">Sistema Compatible Indeterminado (Infinitas Soluciones).</div>`;
    } else {
      html += `<div class="resultado-final">Sistema Incompatible (Sin Solución). Rectas paralelas.</div>`;
    }
  } else {
    const x = detX / det;
    const y = detY / det;
    html += `
      <p><strong>Paso 2: Aplicación de la Regla de Cramer.</strong></p>
      <p>$$\\Delta_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = ${detX}, \\quad \\Delta_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = ${detY}$$</p>
      <p>$$x = \\frac{\\Delta_x}{\\Delta_S} = \\frac{${detX}}{${det}} = ${x.toFixed(4)}$$</p>
      <p>$$y = \\frac{\\Delta_y}{\\Delta_S} = \\frac{${detY}}{${det}} = ${y.toFixed(4)}$$</p>
      <div class="resultado-final">
        Punto de Intersección: $$S(x, y) = (${x.toFixed(4)}, ${y.toFixed(4)})$$
      </div>
    `;
  }
  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// Auxiliar: División Sintética de Ruffini
function evaluarRuffini(coefs, raiz) {
  const resultado = [coefs[0]];
  for (let i = 1; i < coefs.length; i++) {
    resultado.push(resultado[i - 1] * raiz + coefs[i]);
  }
  return resultado;
}

function generarTablaRuffiniHTML(coefs, raiz, filaPaso) {
  let html = `<div class="tabla-ruffini-container"><table class="tabla-ruffini"><tr><td></td>`;
  coefs.forEach(c => html += `<td>${c}</td>`);
  html += `</tr><tr><td class="col-raiz">${raiz}</td>`;
  
  for (let i = 0; i < coefs.length; i++) {
    if (i === 0) html += `<td>-</td>`;
    else html += `<td>${filaPaso[i - 1] * raiz}</td>`;
  }
  html += `</tr><tr><td></td>`;
  
  filaPaso.forEach((res, idx) => {
    const esResiduo = idx === filaPaso.length - 1;
    html += `<td class="${esResiduo ? 'residuo-cero' : ''}">${res}</td>`;
  });
  html += `</tr></table></div>`;
  return html;
}

// 5. Resolver Ecuación Cúbica
function resolverPolinomica() {
  const a = parseFloat(document.getElementById('poly-a').value) || 0;
  const b = parseFloat(document.getElementById('poly-b').value) || 0;
  const c = parseFloat(document.getElementById('poly-c').value) || 0;
  const d = parseFloat(document.getElementById('poly-d').value) || 0;
  const resDiv = document.getElementById('resultado');

  if (a === 0) {
    resDiv.innerHTML = '<p>El coeficiente $a$ debe ser distinto de cero para una ecuación cúbica.</p>';
    return;
  }

  let html = `<p><strong>Paso 1: Aplicación del Teorema de la Raíz Racional y Ruffini.</strong></p>`;
  const coefs = [a, b, c, d];
  let raizEncontrada = null;
  let reducidos = [];

  for (let r = -20; r <= 20; r++) {
    if (r === 0 && d !== 0) continue;
    const evaluacion = a * Math.pow(r, 3) + b * Math.pow(r, 2) + c * r + d;
    if (Math.abs(evaluacion) < 1e-5) {
      raizEncontrada = r;
      reducidos = evaluarRuffini(coefs, r);
      break;
    }
  }

  if (raizEncontrada !== null) {
    html += `<p>Raíz exacta identificada: $$x_1 = ${raizEncontrada}$$</p>`;
    html += generarTablaRuffiniHTML(coefs, raizEncontrada, reducidos);

    const a2 = reducidos[0];
    const b2 = reducidos[1];
    const c2 = reducidos[2];

    html += `<p><strong>Paso 2: Ecuación Cuadrática Reducida.</strong></p>`;
    html += `<p>$$${a2}x^2 + (${b2})x + (${c2}) = 0$$</p>`;

    const delta = b2 * b2 - 4 * a2 * c2;
    if (delta >= 0) {
      const x2 = (-b2 + Math.sqrt(delta)) / (2 * a2);
      const x3 = (-b2 - Math.sqrt(delta)) / (2 * a2);
      html += `
        <div class="resultado-final">
          Raíces Reales: $$x_1 = ${raizEncontrada}, \\quad x_2 = ${x2.toFixed(4)}, \\quad x_3 = ${x3.toFixed(4)}$$
        </div>
      `;
    } else {
      const real = (-b2 / (2 * a2)).toFixed(4);
      const imag = (Math.sqrt(-delta) / (2 * a2)).toFixed(4);
      html += `
        <div class="resultado-final">
          Raíces: $$x_1 = ${raizEncontrada}, \\quad x_{2,3} = ${real} \\pm ${imag}i$$
        </div>
      `;
    }
  } else {
    html += `<p class="resultado-final">No se encontraron raíces enteras/racionales inmediatas mediante reducción de Ruffini.</p>`;
  }

  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 6. Resolver Ecuación Cuártica
function resolverCuartica() {
  const a = parseFloat(document.getElementById('quart-a').value) || 0;
  const b = parseFloat(document.getElementById('quart-b').value) || 0;
  const c = parseFloat(document.getElementById('quart-c').value) || 0;
  const d = parseFloat(document.getElementById('quart-d').value) || 0;
  const e = parseFloat(document.getElementById('quart-e').value) || 0;
  const resDiv = document.getElementById('resultado');

  const coefs = [a, b, c, d, e];
  let html = `<p><strong>Paso 1: Búsqueda sistemática de raíces para polinomio cuártico.</strong></p>`;

  let r1 = null, reducidos1 = [];
  for (let r = -20; r <= 20; r++) {
    const ev = a * Math.pow(r, 4) + b * Math.pow(r, 3) + c * Math.pow(r, 2) + d * r + e;
    if (Math.abs(ev) < 1e-5) {
      r1 = r;
      reducidos1 = evaluarRuffini(coefs, r);
      break;
    }
  }

  if (r1 !== null) {
    html += `<p>Primera Raíz Identificada: $$x_1 = ${r1}$$</p>`;
    html += generarTablaRuffiniHTML(coefs, r1, reducidos1);

    const coefs3 = reducidos1.slice(0, 4);
    let r2 = null, reducidos2 = [];
    for (let r = -20; r <= 20; r++) {
      const ev = coefs3[0] * Math.pow(r, 3) + coefs3[1] * Math.pow(r, 2) + coefs3[2] * r + coefs3[3];
      if (Math.abs(ev) < 1e-5) {
        r2 = r;
        reducidos2 = evaluarRuffini(coefs3, r);
        break;
      }
    }

    if (r2 !== null) {
      html += `<p>Segunda Raíz Identificada: $$x_2 = ${r2}$$</p>`;
      html += generarTablaRuffiniHTML(coefs3, r2, reducidos2);

      const a2 = reducidos2[0], b2 = reducidos2[1], c2 = reducidos2[2];
      const delta = b2 * b2 - 4 * a2 * c2;

      if (delta >= 0) {
        const x3 = (-b2 + Math.sqrt(delta)) / (2 * a2);
        const x4 = (-b2 - Math.sqrt(delta)) / (2 * a2);
        html += `<div class="resultado-final">Raíces Reales: $$x_1 = ${r1}, \\; x_2 = ${r2}, \\; x_3 = ${x3.toFixed(4)}, \\; x_4 = ${x4.toFixed(4)}$$</div>`;
      } else {
        const real = (-b2 / (2 * a2)).toFixed(4);
        const imag = (Math.sqrt(-delta) / (2 * a2)).toFixed(4);
        html += `<div class="resultado-final">Raíces: $$x_1 = ${r1}, \\; x_2 = ${r2}, \\; x_{3,4} = ${real} \\pm ${imag}i$$</div>`;
      }
    } else {
      html += `<div class="resultado-final">Primera raíz: $$x_1 = ${r1}$$. Restante factor de grado 3 analizable numéricamente.</div>`;
    }
  } else {
    html += `<div class="resultado-final">No se encontraron raíces racionales por método de Ruffini rápido.</div>`;
  }

  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 7. Resolver Ecuación Quíntica
function resolverQuintica() {
  const a = parseFloat(document.getElementById('quint-a').value) || 0;
  const b = parseFloat(document.getElementById('quint-b').value) || 0;
  const c = parseFloat(document.getElementById('quint-c').value) || 0;
  const d = parseFloat(document.getElementById('quint-d').value) || 0;
  const e = parseFloat(document.getElementById('quint-e').value) || 0;
  const f = parseFloat(document.getElementById('quint-f').value) || 0;
  const resDiv = document.getElementById('resultado');

  const coefs = [a, b, c, d, e, f];
  let html = `<p><strong>Análisis de Polinomio de Grado 5 (Teorema de Abel-Ruffini).</strong></p>`;

  let r1 = null, reducidos = [];
  for (let r = -20; r <= 20; r++) {
    const ev = a * Math.pow(r, 5) + b * Math.pow(r, 4) + c * Math.pow(r, 3) + d * Math.pow(r, 2) + e * r + f;
    if (Math.abs(ev) < 1e-5) {
      r1 = r;
      reducidos = evaluarRuffini(coefs, r);
      break;
    }
  }

  if (r1 !== null) {
    html += `<p>Raíz real identificada por División Sintética: $$x_1 = ${r1}$$</p>`;
    html += generarTablaRuffiniHTML(coefs, r1, reducidos);
    html += `<div class="resultado-final">Raíz exacta obtenida: $$x_1 = ${r1}$$. Polinomio reducido a grado 4.</div>`;
  } else {
    html += `<div class="resultado-final">No se detectaron raíces enteras en el rango de búsqueda sintética.</div>`;
  }

  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

// 8. Resolver Ecuación con Valor Absoluto
function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const resDiv = document.getElementById('resultado');

  if (a === 0) {
    resDiv.innerHTML = '<p>El coeficiente $a$ debe ser distinto de cero.</p>';
    return;
  }

  let html = `<p><strong>Paso 1: Verificación del término independiente ($c = ${c}$).</strong></p>`;

  if (c < 0) {
    html += `<div class="resultado-final">Inconsistencia: Un valor absoluto jamás puede ser negativo. Conjunto Solución: $$\\mathcal{S} = \\emptyset$$</div>`;
  } else if (c === 0) {
    const x = -b / a;
    html += `
      <p>$$${a}x + (${b}) = 0 \\implies x = ${x.toFixed(4)}$$</p>
      <div class="resultado-final">Solución Única: $$x = ${x.toFixed(4)}$$</div>
    `;
  } else {
    const x1 = (c - b) / a;
    const x2 = (-c - b) / a;
    html += `
      <p><strong>Caso Positivo:</strong> $$${a}x + (${b}) = ${c} \\implies x_1 = ${x1.toFixed(4)}$$</p>
      <p><strong>Caso Negativo:</strong> $$${a}x + (${b}) = ${-c} \\implies x_2 = ${x2.toFixed(4)}$$</p>
      <div class="resultado-final">
        Conjunto Solución: $$\\mathcal{S} = \\{${x1.toFixed(4)}, ${x2.toFixed(4)}\\}$$
      </div>
    `;
  }

  resDiv.innerHTML = html;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}