/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO CON ZOOM Y PAN
   ===================================================================== */
let canvas, ctx;

// Rango cartesiano base por defecto (Escala 1.0)
const RANGO_BASE = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

// Rango dinámico actualizable por zoom o redimensionamiento
let RANGO = { ...RANGO_BASE };

/* =====================================================================
   CONTROL DE NAVEGACIÓN: PORTADA / APLICACIÓN
   ===================================================================== */
function entrarAlEntorno() {
  const portada = document.getElementById('seccion-portada');
  const app = document.getElementById('seccion-aplicacion');
  
  if (portada) portada.classList.add('oculto');
  if (app) app.classList.remove('oculto');
  
  // Garantizar el ajuste perfecto del canvas e inicializar renderizado
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
    inp.addEventListener('input', actualizarGrafica);
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
  const selector = document.getElementById('tipo-algebra');
  if (!selector) return;
  const sel = selector.value.toLowerCase();

  document.querySelectorAll('.panel-contenido').forEach(p => p.classList.add('oculto'));

  // Objeto de mapa corregido con comas adecuadas
  const mapa = {
    lineal: 'panel-lineal',
    fraccionaria: 'panel-fraccionaria',
    cuadratica: 'panel-cuadratica',
    sistema: 'panel-sistema',
    absoluto: 'panel-absoluto',
    polinomica: 'panel-polinomica',
    cuartica: 'panel-cuartica',
    quintica: 'panel-quintica',
    sextica: 'panel-sextica'
  };

  if (mapa[sel]) {
    const panelActivo = document.getElementById(mapa[sel]);
    if (panelActivo) panelActivo.classList.remove('oculto');
  }

  actualizarLeyenda(sel);

  const res = document.getElementById('resultado');
  if (res) {
    res.innerHTML = 'Seleccione una ecuación y presione <strong>Resolver</strong> para mostrar los cálculos paso a paso.';
  }

  actualizarGrafica();
  renderizarMatematicasGlobal();
}

function actualizarLeyenda(tipo) {
  const leyenda = document.getElementById('leyenda');
  if (!leyenda) return;
  if (tipo === 'sistema') {
    leyenda.innerHTML = '<span class="leyenda-item"><span class="leyenda-color" style="background:#2563eb;"></span> Ecuación 1</span> <span class="leyenda-item"><span class="leyenda-color" style="background:#10b981;"></span> Ecuación 2</span>';
  } else if (tipo === 'fraccionaria') {
    leyenda.innerHTML = '<span class="leyenda-item"><span class="leyenda-color" style="background:#ef4444;"></span> Gráfica f(x)</span> <span class="leyenda-item"><span class="leyenda-color" style="border: 1px dashed #94a3b8; background:transparent; width:16px; height:0; border-top-width:2px;"></span> Asíntota Vertical</span>';
  } else {
    leyenda.innerHTML = '<span class="leyenda-item"><span class="leyenda-color" style="background:#ef4444;"></span> Gráfica f(x)</span>';
  }
}

/* =====================================================================
   MOTOR GRÁFICO (CANVAS API CON ADAPTABILIDAD DINÁMICA DE PASO)
   ===================================================================== */
function obtenerDimensionesEfectivas() {
  const rect = canvas.getBoundingClientRect();
  return {
    ancho: rect.width || 700,
    alto: (rect.width ? rect.width * (460 / 700) : 460)
  };
}

function dibujarPlano() {
  if (!ctx || !canvas) return;
  
  const { ancho, alto } = obtenerDimensionesEfectivas();
  ctx.clearRect(0, 0, ancho, alto);

  const scaleX = ancho / (RANGO.maxX - RANGO.minX);
  const scaleY = alto / (RANGO.maxY - RANGO.minY);
  const centroX = -RANGO.minX * scaleX;
  const centroY = RANGO.maxY * scaleY;

  const rangoTotalX = RANGO.maxX - RANGO.minX;
  let paso = 1;
  if (rangoTotalX > 40) paso = 5;
  if (rangoTotalX > 100) paso = 10;
  if (rangoTotalX < 8) paso = 0.5;

  // 1. Cuadrícula secundaria
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;

  const inicioX = Math.floor(RANGO.minX / paso) * paso;
  for (let i = inicioX; i <= RANGO.maxX; i += paso) {
    let x = (i - RANGO.minX) * scaleX;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke();
  }

  const inicioY = Math.floor(RANGO.minY / paso) * paso;
  for (let i = inicioY; i <= RANGO.maxY; i += paso) {
    let y = (RANGO.maxY - i) * scaleY;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke();
  }

  // 2. Ejes principales
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, centroY); ctx.lineTo(ancho, centroY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(centroX, 0); ctx.lineTo(centroX, alto); ctx.stroke();

  // 3. Puntas de flecha
  const tamFlecha = 8;
  ctx.fillStyle = '#64748b';

  // Flecha Eje X Positivo
  ctx.beginPath();
  ctx.moveTo(ancho, centroY);
  ctx.lineTo(ancho - tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(ancho - tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje X Negativo
  ctx.beginPath();
  ctx.moveTo(0, centroY);
  ctx.lineTo(tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje Y Positivo
  ctx.beginPath();
  ctx.moveTo(centroX, 0);
  ctx.lineTo(centroX - tamFlecha / 2, tamFlecha);
  ctx.lineTo(centroX + tamFlecha / 2, tamFlecha);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje Y Negativo
  ctx.beginPath();
  ctx.moveTo(centroX, alto);
  ctx.lineTo(centroX - tamFlecha / 2, alto - tamFlecha);
  ctx.lineTo(centroX + tamFlecha / 2, alto - tamFlecha);
  ctx.closePath();
  ctx.fill();

  // 4. Marcas y graduación numérica de los ejes
  ctx.fillStyle = '#475569';
  ctx.font = '11px sans-serif';

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  for (let i = inicioX; i <= RANGO.maxX; i += paso) {
    if (Math.abs(i) < 0.0001) continue;
    let x = (i - RANGO.minX) * scaleX;
    ctx.beginPath(); ctx.moveTo(x, centroY - 4); ctx.lineTo(x, centroY + 4); ctx.stroke();
    ctx.fillText(Number(i.toFixed(2)), x - 6, centroY + 6);
  }

  ctx.textBaseline = 'middle';
  for (let i = inicioY; i <= RANGO.maxY; i += paso) {
    if (Math.abs(i) < 0.0001) continue;
    let y = (RANGO.maxY - i) * scaleY;
    ctx.beginPath(); ctx.moveTo(centroX - 4, y); ctx.lineTo(centroX + 4, y); ctx.stroke();
    ctx.fillText(Number(i.toFixed(2)), centroX + 8, y);
  }

  // 5. Etiquetado de los extremos
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#1e3a8a';

  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('x', ancho - 14, centroY - 15);

  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('-x', 14, centroY - 15);

  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('y', centroX + 12, 12);

  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('-y', centroX + 12, alto - 12);
}

function graficarFuncion(funcion, color, asintotaX = null) {
  if (!ctx || !canvas) return;
  const { ancho, alto } = obtenerDimensionesEfectivas();

  const scaleX = ancho / (RANGO.maxX - RANGO.minX);
  const scaleY = alto / (RANGO.maxY - RANGO.minY);

  if (asintotaX !== null && asintotaX >= RANGO.minX && asintotaX <= RANGO.maxX) {
    let xAsin = (asintotaX - RANGO.minX) * scaleX;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(xAsin, 0);
    ctx.lineTo(xAsin, alto);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  let iniciado = false;
  for (let px = 0; px <= ancho; px++) {
    let mathX = RANGO.minX + (px / scaleX);
    
    if (asintotaX !== null && Math.abs(mathX - asintotaX) < (1 / scaleX)) {
      iniciado = false;
      continue;
    }

    let mathY = funcion(mathX);
    
    if (isNaN(mathY) || !isFinite(mathY)) {
      iniciado = false;
      continue;
    }

    let py = (RANGO.maxY - mathY) * scaleY;

    if (!iniciado) {
      ctx.moveTo(px, py);
      iniciado = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}

function actualizarGrafica() {
  dibujarPlano();
  const selector = document.getElementById('tipo-algebra');
  if (!selector) return;
  const sel = selector.value.toLowerCase();

  if (sel === 'lineal') {
    let a = parseFloat(document.getElementById('lin-a').value) || 0;
    let b = parseFloat(document.getElementById('lin-b').value) || 0;
    graficarFuncion((x) => a * x + b, '#ef4444');
  } 
  else if (sel === 'fraccionaria') {
    let a = parseFloat(document.getElementById('frac-a').value) || 0;
    let b = parseFloat(document.getElementById('frac-b').value) || 0;
    let c = parseFloat(document.getElementById('frac-c').value) || 0;
    let asintota = -b;
    graficarFuncion((x) => (a / (x + b)) + c, '#ef4444', asintota);
  }
  else if (sel === 'cuadratica') {
    let a = parseFloat(document.getElementById('coef-a').value) || 0;
    let b = parseFloat(document.getElementById('coef-b').value) || 0;
    let c = parseFloat(document.getElementById('coef-c').value) || 0;
    graficarFuncion((x) => a * x * x + b * x + c, '#ef4444');
  }
  else if (sel === 'sistema') {
    let a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
    let b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
    let c1 = parseFloat(document.getElementById('sys-c1').value) || 0;
    let a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
    let b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
    let c2 = parseFloat(document.getElementById('sys-c2').value) || 0;

    if (b1 !== 0) graficarFuncion((x) => (c1 - a1 * x) / b1, '#2563eb');
    if (b2 !== 0) graficarFuncion((x) => (c2 - a2 * x) / b2, '#10b981');
  }
  else if (sel === 'absoluto') {
    let a = parseFloat(document.getElementById('abs-a').value) || 0;
    let b = parseFloat(document.getElementById('abs-b').value) || 0;
    let c = parseFloat(document.getElementById('abs-c').value) || 0;
    graficarFuncion((x) => Math.abs(a * x + b) - c, '#ef4444');
  }
  else if (sel === 'polinomica') {
    let a = parseFloat(document.getElementById('poly-a').value) || 0;
    let b = parseFloat(document.getElementById('poly-b').value) || 0;
    let c = parseFloat(document.getElementById('poly-c').value) || 0;
    let d = parseFloat(document.getElementById('poly-d').value) || 0;
    graficarFuncion((x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d, '#ef4444');
  }
  else if (sel === 'cuartica') {
    let a = parseFloat(document.getElementById('quart-a').value) || 0;
    let b = parseFloat(document.getElementById('quart-b').value) || 0;
    let c = parseFloat(document.getElementById('quart-c').value) || 0;
    let d = parseFloat(document.getElementById('quart-d').value) || 0;
    let e = parseFloat(document.getElementById('quart-e').value) || 0;
    graficarFuncion((x) => a * Math.pow(x, 4) + b * Math.pow(x, 3) + c * Math.pow(x, 2) + d * x + e, '#ef4444');
  }
  else if (sel === 'quintica') {
    let a = parseFloat(document.getElementById('quint-a').value) || 0;
    let b = parseFloat(document.getElementById('quint-b').value) || 0;
    let c = parseFloat(document.getElementById('quint-c').value) || 0;
    let d = parseFloat(document.getElementById('quint-d').value) || 0;
    let e = parseFloat(document.getElementById('quint-e').value) || 0;
    let f = parseFloat(document.getElementById('quint-f').value) || 0;
    graficarFuncion((x) => a * Math.pow(x, 5) + b * Math.pow(x, 4) + c * Math.pow(x, 3) + d * Math.pow(x, 2) + e * x + f, '#ef4444');
  }
  else if (sel === 'sextica') {
    let a = parseFloat(document.getElementById('sext-a').value) || 0;
    let b = parseFloat(document.getElementById('sext-b').value) || 0;
    let c = parseFloat(document.getElementById('sext-c').value) || 0;
    let d = parseFloat(document.getElementById('sext-d').value) || 0;
    let e = parseFloat(document.getElementById('sext-e').value) || 0;
    let f = parseFloat(document.getElementById('sext-f').value) || 0;
    let g = parseFloat(document.getElementById('sext-g').value) || 0;

    graficarFuncion((x) => 
      a * Math.pow(x, 6) + 
      b * Math.pow(x, 5) + 
      c * Math.pow(x, 4) + 
      d * Math.pow(x, 3) + 
      e * Math.pow(x, 2) + 
      f * x + g, 
      '#ef4444'
    );
  }
}

/* =====================================================================
   LÓGICA MATEMÁTICA PASO A PASO
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error matemático: Si $$a = 0$$, la expresión degenera y no constituye una ecuación lineal válida.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let x = -b / a;
  res.innerHTML = `<div><strong>Explicación:</strong> Para resolver la ecuación lineal $${a}x + (${b}) = 0$, se aísla el término con la incógnita y luego se despeja $x$.</div>
  <div><strong>Paso 1: Planteamiento de la ecuación original</strong> $${a}x + (${b}) = 0$</div>
  <div><strong>Paso 2: Transposición del término independiente</strong> $${a}x = ${-b}$</div>
  <div><strong>Paso 3: Despeje formal dividiendo para $a$ ($$a = ${a} \\neq 0$$)</strong> $$x = \\frac{${-b}}{${a}}$$</div>
  <div class="resultado-final"><strong>Resultado Formateado:</strong> $$x = ${x.toFixed(4)}$$</div>`;
  renderizarMatematicasGlobal();
}

function resolverFraccionaria() {
  const a = parseFloat(document.getElementById('frac-a').value) || 0;
  const b = parseFloat(document.getElementById('frac-b').value) || 0;
  const c = parseFloat(document.getElementById('frac-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El numerador $$a$$ no puede ser cero en una ecuación fraccionaria racional.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let restriccion = -b;
  let pasos = `<div><strong>Explicación Analítica:</strong> Las ecuaciones fraccionarias exigen validar el dominio de definición para evitar indeterminaciones por división para cero.</div>`;
  pasos += `<div><strong>Paso 1: Identificación de la Restricción de Dominio (Asíntota Vertical):</strong></div>`;
  pasos += `<div>El denominador $x + (${b}) \\neq 0 \\implies x \\neq ${restriccion}$</div>`;

  if (c === 0) {
    pasos += `<div><strong>Paso 2: Análisis del Numerador:</strong></div>`;
    pasos += `<div>Dado que $c = 0$, la ecuación se reduce a $\\frac{${a}}{x + (${b})} = 0$, la cual no posee solución en $\\mathbb{R}$ pues $${a} \\neq 0$.</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución: $\\mathcal{S} = \\emptyset$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let numPaso2 = -a / c;
  let x = numPaso2 - b;

  pasos += `<div><strong>Paso 2: Transposición del Término Independiente $c$:</strong></div>`;
  pasos += `<div>$\\frac{${a}}{x + (${b})} = ${-c}$</div>`;
  pasos += `<div><strong>Paso 3: Multiplicación por el Denominador e Inversión:</strong></div>`;
  pasos += `<div>$${a} = ${-c} \\cdot (x + (${b})) \\implies x + (${b}) = ${numPaso2.toFixed(4)}$</div>`;
  pasos += `<div><strong>Paso 4: Despeje Final de $x$:</strong></div>`;
  pasos += `<div>$x = ${numPaso2.toFixed(4)} - (${b}) = ${x.toFixed(4)}$</div>`;

  if (Math.abs(x - restriccion) < 1e-5) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">La solución obtenida ($x = ${x.toFixed(4)}$) coincide con la restricción de dominio ($x \\neq ${restriccion}$). Por ende, la ecuación no tiene solución real validada ($\\mathcal{S} = \\emptyset$).</div>`;
  } else {
    pasos += `<div class="resultado-final"><strong>Solución Validada:</strong> $$x = ${x.toFixed(4)}$$</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverCuadratica() {
  const a = parseFloat(document.getElementById('coef-a').value) || 0;
  const b = parseFloat(document.getElementById('coef-b').value) || 0;
  const c = parseFloat(document.getElementById('coef-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente principal $a$ no puede ser cero en una ecuación cuadrática.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  const disc = b * b - 4 * a * c;
  let html = `<div><strong>Paso 1: Cálculo del Discriminante ($\Delta$):</strong></div>`;
  html += `<div>$$\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${disc.toFixed(4)}$$</div>`;

  if (disc > 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    html += `<div><strong>Paso 2: Aplicación de la Fórmula Cuadrática ($\Delta > 0$):</strong></div>`;
    html += `<div class="resultado-final">$$x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$$</div>`;
  } else if (disc === 0) {
    const x = -b / (2 * a);
    html += `<div><strong>Paso 2: Raíz Única de Multiplicidad Doble ($\Delta = 0$):</strong></div>`;
    html += `<div class="resultado-final">$$x_1 = x_2 = ${x.toFixed(4)}$$</div>`;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
    html += `<div><strong>Paso 2: Raíces Complejas Conjugadas ($\Delta < 0$):</strong></div>`;
    html += `<div class="resultado-final">$$x_1 = ${real} + ${imag}i, \\quad x_2 = ${real} - ${imag}i$$</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

function resolverSistema() {
  const a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
  const b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
  const c1 = parseFloat(document.getElementById('sys-c1').value) || 0;
  const a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
  const b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
  const c2 = parseFloat(document.getElementById('sys-c2').value) || 0;
  const res = document.getElementById('resultado');

  const det = a1 * b2 - a2 * b1;
  let html = `<div><strong>Paso 1: Cálculo del Determinante Principal ($\Delta$):</strong></div>`;
  html += `<div>$$\\Delta = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${a2})(${b1}) = ${det.toFixed(4)}$$</div>`;

  if (Math.abs(det) < 1e-9) {
    if (a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) {
      html += `<div class="resultado-final" style="background-color:#eff6ff; border-color:#bfdbfe; color:#1e3a8a;">Sistema Compatible Indeterminado: Infinitas soluciones (Las rectas son coincidentes).</div>`;
    } else {
      html += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Sistema Incompatible: Sin solución real (Las rectas son paralelas).</div>`;
    }
  } else {
    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;
    const x = detX / det;
    const y = detY / det;

    html += `<div><strong>Paso 2: Aplicación de la Regla de Cramer:</strong></div>`;
    html += `<div>$$\\Delta_x = ${detX.toFixed(4)}, \\quad \\Delta_y = ${detY.toFixed(4)}$$</div>`;
    html += `<div class="resultado-final">$$x = \\frac{\\Delta_x}{\\Delta} = ${x.toFixed(4)}, \\quad y = \\frac{\\Delta_y}{\\Delta} = ${y.toFixed(4)}$$</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const res = document.getElementById('resultado');

  if (c < 0) {
    res.innerHTML = `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Error: El valor absoluto $|ax + b|$ no puede ser igual a un valor negativo ($c = ${c} < 0$). Conjunto solución vacío ($\\mathcal{S} = \\emptyset$).</div>`;
    renderizarMatematicasGlobal();
    return;
  }

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: $a$ debe ser distinto de cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  const x1 = (c - b) / a;
  const x2 = (-c - b) / a;

  let html = `<div><strong>Paso 1: Descomposición por definición de Valor Absoluto:</strong></div>`;
  html += `<div>Caso 1: $${a}x + (${b}) = ${c} \\implies x_1 = ${x1.toFixed(4)}$</div>`;
  html += `<div>Caso 2: $${a}x + (${b}) = ${-c} \\implies x_2 = ${x2.toFixed(4)}$</div>`;
  html += `<div class="resultado-final">$$x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$$</div>`;

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

/* Helper para división sintética en polinomios */
function evaluarPolinomio(coeffs, x) {
  return coeffs.reduce((acc, c) => acc * x + c, 0);
}

function encontrarRaicesPolinomio(coeffs) {
  let raices = [];
  for (let r = -20; r <= 20; r += 0.5) {
    if (Math.abs(evaluarPolinomio(coeffs, r)) < 1e-4) {
      if (!raices.some(v => Math.abs(v - r) < 1e-3)) {
        raices.push(r);
      }
    }
  }
  return raices;
}

function resolverPolinomica() {
  const a = parseFloat(document.getElementById('poly-a').value) || 0;
  const b = parseFloat(document.getElementById('poly-b').value) || 0;
  const c = parseFloat(document.getElementById('poly-c').value) || 0;
  const d = parseFloat(document.getElementById('poly-d').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente $a$ no puede ser cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  const coeffs = [a, b, c, d];
  const raices = encontrarRaicesPolinomio(coeffs);

  let html = `<div><strong>Paso 1: Análisis del Polinomio Cúbico:</strong></div>`;
  html += `<div>$$P(x) = ${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0$$</div>`;

  if (raices.length > 0) {
    let r = raices[0];
    let q2 = a;
    let q1 = b + q2 * r;
    let q0 = c + q1 * r;

    html += `<div><strong>Paso 2: Raíz Real Encontrada mediante Ruffini ($r = ${r}$):</strong></div>`;
    html += `<div class="tabla-ruffini-container">
      <table class="tabla-ruffini">
        <tr>
          <td class="col-raiz">Coeficientes</td>
          <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td>
        </tr>
        <tr>
          <td class="col-raiz">r = ${r}</td>
          <td>-</td><td>${(q2*r).toFixed(2)}</td><td>${(q1*r).toFixed(2)}</td><td>${(q0*r).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="col-raiz">Cociente</td>
          <td>${q2}</td><td>${q1}</td><td>${q0}</td><td class="residuo-cero">0</td>
        </tr>
      </table>
    </div>`;

    html += `<div><strong>Paso 3: Reducción a Ecuación Cuadrática Residual:</strong></div>`;
    html += `<div>$$(${q2})x^2 + (${q1})x + (${q0}) = 0$$</div>`;

    const disc = q1 * q1 - 4 * q2 * q0;
    if (disc >= 0) {
      const x2 = (-q1 + Math.sqrt(disc)) / (2 * q2);
      const x3 = (-q1 - Math.sqrt(disc)) / (2 * q2);
      html += `<div class="resultado-final">Raíces Reales: $$x_1 = ${r}, \\quad x_2 = ${x2.toFixed(4)}, \\quad x_3 = ${x3.toFixed(4)}$$</div>`;
    } else {
      const real = (-q1 / (2 * q2)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * q2)).toFixed(4);
      html += `<div class="resultado-final">Raíz Real: $$x_1 = ${r}$$ <br> Raíces Complejas: $$x_{2,3} = ${real} \\pm ${imag}i$$</div>`;
    }
  } else {
    html += `<div class="resultado-final">No se encontraron raíces enteras/sencillas por división sintética directa en el rango [-20, 20].</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

function resolverCuartica() {
  const a = parseFloat(document.getElementById('quart-a').value) || 0;
  const b = parseFloat(document.getElementById('quart-b').value) || 0;
  const c = parseFloat(document.getElementById('quart-c').value) || 0;
  const d = parseFloat(document.getElementById('quart-d').value) || 0;
  const e = parseFloat(document.getElementById('quart-e').value) || 0;
  const res = document.getElementById('resultado');

  const coeffs = [a, b, c, d, e];
  const raices = encontrarRaicesPolinomio(coeffs);

  let html = `<div><strong>Ecuación Cuártica:</strong> $$${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e}) = 0$$</div>`;
  html += `<div>Se han localizado <strong>${raices.length}</strong> raíz(ces) real(es) en el rango evaluado:</div>`;

  if (raices.length > 0) {
    raices.forEach((r, idx) => {
      html += `<div class="resultado-final">$$x_{${idx + 1}} = ${r.toFixed(4)}$$</div>`;
    });
  } else {
    html += `<div class="resultado-final" style="background-color:#fef2f2; color:#991b1b;">Las soluciones pertenecen al campo complejo.</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

function resolverQuintica() {
  const a = parseFloat(document.getElementById('quint-a').value) || 0;
  const b = parseFloat(document.getElementById('quint-b').value) || 0;
  const c = parseFloat(document.getElementById('quint-c').value) || 0;
  const d = parseFloat(document.getElementById('quint-d').value) || 0;
  const e = parseFloat(document.getElementById('quint-e').value) || 0;
  const f = parseFloat(document.getElementById('quint-f').value) || 0;
  const res = document.getElementById('resultado');

  const coeffs = [a, b, c, d, e, f];
  const raices = encontrarRaicesPolinomio(coeffs);

  let html = `<div><strong>Ecuación Quíntica:</strong> $$${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f}) = 0$$</div>`;
  html += `<div>Se han localizado <strong>${raices.length}</strong> raíz(ces) real(es) en el intervalo analizado:</div>`;

  if (raices.length > 0) {
    raices.forEach((r, idx) => {
      html += `<div class="resultado-final">$$x_{${idx + 1}} = ${r.toFixed(4)}$$</div>`;
    });
  } else {
    html += `<div class="resultado-final" style="background-color:#fef2f2; color:#991b1b;">Las raíces son exclusivamente complejas.</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}

function resolverSextica() {
  const a = parseFloat(document.getElementById('sext-a').value) || 0;
  const b = parseFloat(document.getElementById('sext-b').value) || 0;
  const c = parseFloat(document.getElementById('sext-c').value) || 0;
  const d = parseFloat(document.getElementById('sext-d').value) || 0;
  const e = parseFloat(document.getElementById('sext-e').value) || 0;
  const f = parseFloat(document.getElementById('sext-f').value) || 0;
  const g = parseFloat(document.getElementById('sext-g').value) || 0;
  const res = document.getElementById('resultado');

  const coeffs = [a, b, c, d, e, f, g];
  const raices = encontrarRaicesPolinomio(coeffs);

  let html = `<div><strong>Ecuación Séxtica:</strong> $$${a}x^6 + (${b})x^5 + (${c})x^4 + (${d})x^3 + (${e})x^2 + (${f})x + (${g}) = 0$$</div>`;
  html += `<div>Se han localizado <strong>${raices.length}</strong> raíz(ces) real(es) en el rango de búsqueda:</div>`;

  if (raices.length > 0) {
    raices.forEach((r, idx) => {
      html += `<div class="resultado-final">$$x_{${idx + 1}} = ${r.toFixed(4)}$$</div>`;
    });
  } else {
    html += `<div class="resultado-final" style="background-color:#fef2f2; color:#991b1b;">Todas las raíces pertenecen al plano complejo.</div>`;
  }

  res.innerHTML = html;
  renderizarMatematicasGlobal();
}
