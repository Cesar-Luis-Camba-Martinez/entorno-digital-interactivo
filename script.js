/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO (CON ZOOM Y PAN)
   ===================================================================== */
let canvas, ctx;

// Rango por defecto (Escala 1.0)
const RANGO_BASE = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

// Rango dinámico actualizable por el zoom
let RANGO = { ...RANGO_BASE };

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

  redimensionarCanvas();
  conmutarPanel();
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
  const sel = selector.value;

  document.querySelectorAll('.panel-contenido').forEach(p => p.classList.add('oculto'));

  const mapa = {
    lineal: 'panel-lineal',
    fraccionaria: 'panel-fraccionaria',
    cuadratica: 'panel-cuadratica',
    sistema: 'panel-sistema',
    polinomica: 'panel-polinomica',
    cuartica: 'panel-cuartica',
    quintica: 'panel-quintica',
    absoluto: 'panel-absoluto'
  };

  if (mapa[sel]) {
    const panelActivo = document.getElementById(mapa[sel]);
    if (panelActivo) panelActivo.classList.remove('oculto');
  }

  actualizarLeyenda(sel);

  const res = document.getElementById('resultado');
  if (res) {
    res.innerHTML = 'Seleccione una función y presione <strong>Resolver</strong> para mostrar los cálculos paso a paso.';
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

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, centroY); ctx.lineTo(ancho, centroY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(centroX, 0); ctx.lineTo(centroX, alto); ctx.stroke();

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

  // Configuración para el etiquetado de los cuatro extremos (x, -x, y, -y)
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#1e3a8a';

  // Semieje X positivo (Extremo derecho)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('x', ancho - 10, centroY - 15);

  // Semieje X negativo (Extremo izquierdo)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('-x', 10, centroY - 15);

  // Semieje Y positivo (Extremo superior)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('y', centroX + 10, 10);

  // Semieje Y negativo (Extremo inferior)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('-y', centroX + 10, alto - 10);
}

function graficarFuncion(funcion, color, asintotaX = null) {
  if (!ctx || !canvas) return;
  const { ancho, alto } = obtenerDimensionesEfectivas();

  const scaleX = ancho / (RANGO.maxX - RANGO.minX);
  const scaleY = alto / (RANGO.maxY - RANGO.minY);

  // Dibujar asíntota si existe
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
    
    // Evitar discontinuidad o asíntota vertical
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
  const sel = selector.value;

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
  else if (sel === 'absoluto') {
    let a = parseFloat(document.getElementById('abs-a').value) || 0;
    let b = parseFloat(document.getElementById('abs-b').value) || 0;
    let c = parseFloat(document.getElementById('abs-c').value) || 0;
    graficarFuncion((x) => Math.abs(a * x + b) - c, '#ef4444');
  }
}

/* =====================================================================
   LÓGICA MATEMÁTICA: ECUACIONES LINEALES, FRACCIONARIAS Y CUADRÁTICAS
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error matemático: Si $$a = 0$$, la expresión no representa una ecuación lineal de primer grado válida.</span>';
    renderizarMatematicasGlobal();
    return;
  }
  
  let x = -b / a;
  res.innerHTML = `<div><strong>Paso 1:</strong> Estructurar la ecuación original: $$${a}x + (${b}) = 0$$</div>
                   <div><strong>Paso 2:</strong> Transponer el término independiente: $$${a}x = ${-b}$$</div>
                   <div><strong>Paso 3:</strong> Despejar la incógnita $$x = \\frac{${-b}}{${a}}$$</div>
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
  let pasos = `<div><strong>Paso 1: Identificación de la Restricción de Dominio (Asíntota Vertical):</strong></div>`;
  pasos += `<div>El denominador $$x + (${b}) \\neq 0 \\implies x \\neq ${restriccion}$$.</div>`;

  if (c === 0) {
    pasos += `<div><strong>Paso 2: Análisis del Numerador:</strong></div>`;
    pasos += `<div>Dado que $$c = 0$$, la ecuación se simplifica a $$\\frac{${a}}{x + (${b})} = 0$$, lo cual no tiene solución ($$${a} \\neq 0$$).</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución: $$\\mathcal{S} = \\emptyset$$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let numPaso2 = -a / c;
  let x = numPaso2 - b;

  pasos += `<div><strong>Paso 2: Transposición del Término Independiente $$c$$:</strong></div>`;
  pasos += `<div>$$\\frac{${a}}{x + (${b})} = ${-c}$$</div>`;
  
  pasos += `<div><strong>Paso 3: Multiplicar por el Denominador e Invertir la Ecuación:</strong></div>`;
  pasos += `<div>$$${a} = ${-c}(x + (${b})) \\implies x + (${b}) = \\frac{${a}}{${-c}} \\implies x + (${b}) = ${numPaso2.toFixed(4)}$$</div>`;

  pasos += `<div><strong>Paso 4: Despeje Final de $$x$$:</strong></div>`;
  pasos += `<div>$$x = ${numPaso2.toFixed(4)} - (${b})$$</div>`;

  if (Math.abs(x - restriccion) < 0.0001) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">La solución generada ($$x = ${x.toFixed(4)}$$) coincide con la restricción del dominio ($$x \\neq ${restriccion}$$). Por lo tanto, la ecuación no tiene solución válida.</div>`;
  } else {
    pasos += `<div class="resultado-final">$$x = ${x.toFixed(4)}$$ (Solución válida, pues $$x \\neq ${restriccion}$$)</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function calcularEcuacion() {
  const a = parseFloat(document.getElementById('coef-a').value) || 0;
  const b = parseFloat(document.getElementById('coef-b').value) || 0;
  const c = parseFloat(document.getElementById('coef-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero en una ecuación cuadrática.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let discriminante = (b * b) - (4 * a * c);
  let pasos = `<div><strong>Paso 1:</strong> Estructurar los valores base: $$a = ${a},\\; b = ${b},\\; c = ${c}$$</div>`;
  pasos += `<div><strong>Paso 2:</strong> Calcular el Discriminante: $$\\Delta = (${b})^2 - 4(${a})(${c}) = ${discriminante.toFixed(2)}$$</div>`;

  if (discriminante > 0) {
    let x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    let x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> Aplicar la fórmula general obteniendo dos soluciones reales discretas:</div>
              <div class="resultado-final">$$x_1 = \\frac{-(${b}) + \\sqrt{${discriminante.toFixed(2)}}}{2(${a})} = ${x1.toFixed(4)}$$</div>
              <div class="resultado-final">$$x_2 = \\frac{-(${b}) - \\sqrt{${discriminante.toFixed(2)}}}{2(${a})} = ${x2.toFixed(4)}$$</div>`;
  } else if (discriminante === 0) {
    let x = -b / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> Dado que $$\\Delta = 0$$, se genera una raíz real única de multiplicidad 2:</div>
              <div class="resultado-final">$$x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$$</div>`;
  } else {
    let parteReal = -b / (2 * a);
    let parteImaginaria = Math.sqrt(-discriminante) / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> El discriminante es negativo ($$\\Delta < 0$$). Las raíces pertenecen al campo complejo:</div>
              <div class="resultado-final">$$x_1 = ${parteReal.toFixed(2)} + ${parteImaginaria.toFixed(2)}i$$</div>
              <div class="resultado-final">$$x_2 = ${parteReal.toFixed(2)} - ${parteImaginaria.toFixed(2)}i$$</div>`;
  }
  res.innerHTML = pasos;
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

  let detS = (a1 * b2) - (a2 * b1);
  let pasos = `<div><strong>Paso 1:</strong> Calcular el Determinante del Sistema (Regla de Cramer):</div>
               <div>$$\\text{Det}(S) = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1} \\cdot ${b2}) - (${a2} \\cdot ${b1}) = ${detS}$$</div>`;

  if (detS === 0) {
    pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">Resultado: El determinante es cero. El sistema es incompatible o indeterminado (rectas paralelas o coincidentes).</div>`;
  } else {
    let detX = (c1 * b2) - (c2 * b1);
    let detY = (a1 * c2) - (a2 * c1);
    let x = detX / detS;
    let y = detY / detS;
    pasos += `<div><strong>Paso 2:</strong> Calcular los determinantes de las variables:</div>
              <div>$$\\text{Det}(X) = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = ${detX} \\quad | \\quad \\text{Det}(Y) = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = ${detY}$$</div>
              <div><strong>Paso 3:</strong> Encontrar el punto de intersección $$(x, y)$$:</div>
              <div class="resultado-final">$$x = \\frac{\\text{Det}(X)}{\\text{Det}(S)} = ${x.toFixed(4)}$$</div>
              <div class="resultado-final">$$y = \\frac{\\text{Det}(Y)}{\\text{Det}(S)} = ${y.toFixed(4)}$$</div>`;
  }
  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/* =====================================================================
   LÓGICA MATEMÁTICA: ECUACIONES CÚBICA, CUÁRTICA Y QUÍNTICA (RUFFINI)
   ===================================================================== */
function obtenerDivisores(num) {
  let divisores = [];
  let absN = Math.abs(num);
  for (let i = 1; i <= absN; i++) {
    if (absN % i === 0) {
      divisores.push(i);
      divisores.push(-i);
    }
  }
  return divisores.sort((a, b) => a - b);
}

function resolverPolinomica() {
  const a = parseFloat(document.getElementById('poly-a').value) || 0;
  const b = parseFloat(document.getElementById('poly-b').value) || 0;
  const c = parseFloat(document.getElementById('poly-c').value) || 0;
  const d = parseFloat(document.getElementById('poly-d').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero para ser de tercer grado.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Polinómica Cúbica:</strong></div>`;
  pasos += `<div>$$P(x) = ${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0$$</div>`;

  if (d === 0) {
    pasos += `<div><strong>Paso 2: Extracción de Factor Común $$x$$:</strong></div>`;
    pasos += `<div>$$P(x) = x \\cdot (${a}x^2 + (${b})x + (${c})) = 0$$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $$x_1 = 0$$</div>`;
    pasos += resolverCuadraticaResidual(a, b, c, 2);
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(d);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => {
    qList.forEach(q => {
      let val = p / q;
      if (!candidatos.includes(val)) candidatos.push(val);
    });
  });
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Aplicación del Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$d = ${d}$$ ($$p$$): $$\\mathcal{\\{}${pList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): $$\\mathcal{\\{}${qList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Posibles raíces ($$\\pm p/q$$): $$\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$$</div>`;

  const P = (x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  let raizEncontrada = null;

  for (let r of candidatos) {
    if (Math.abs(P(r)) < 0.000001) {
      raizEncontrada = r;
      break;
    }
  }

  if (raizEncontrada === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> No se encontraron raíces racionales exactas en los candidatos.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let k = raizEncontrada;
  let m1 = a * k;
  let coef2 = b + m1;
  let m2 = coef2 * k;
  let coef3 = c + m2;
  let m3 = coef3 * k;
  let residuo = d + m3;

  pasos += `<div><strong>Paso 3: Evaluación y División Sintética (Regla de Ruffini):</strong></div>`;
  pasos += `<div>Probando $$x = ${k}$$: $$P(${k}) = 0$$. <span class="resultado-final">$$x_1 = ${k}$$</span> es una raíz exacta.</div>`;
  
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${k}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
      </tr>
      <tr>
        <td class="col-raiz">Resultados</td>
        <td><strong>${a}</strong></td>
        <td><strong>${coef2}</strong></td>
        <td><strong>${coef3}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo) < 0.0001 ? 0 : residuo} (Residuo)</td>
      </tr>
    </table>
  </div>`;

  pasos += `<div>Polinomio reducido: $$(${a})x^2 + (${coef2})x + (${coef3}) = 0$$</div>`;
  pasos += resolverCuadraticaResidual(a, coef2, coef3, 2);

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverCuartica() {
  const a = parseFloat(document.getElementById('quart-a').value) || 0;
  const b = parseFloat(document.getElementById('quart-b').value) || 0;
  const c = parseFloat(document.getElementById('quart-c').value) || 0;
  const d = parseFloat(document.getElementById('quart-d').value) || 0;
  const e = parseFloat(document.getElementById('quart-e').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero para ser de cuarto grado.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Polinómica Cuártica:</strong></div>`;
  pasos += `<div>$$P(x) = ${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e}) = 0$$</div>`;

  if (e === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $$x$$:</strong></div>`;
    pasos += `<div>$$P(x) = x \\cdot (${a}x^3 + (${b})x^2 + (${c})x + (${d})) = 0$$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $$x_1 = 0$$</div>`;
    pasos += `<div>Para encontrar las raíces restantes, resolvemos la ecuación cúbica $$${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0$$:</div>`;
    
    res.innerHTML = pasos + resolverCubicaAuxiliar(a, b, c, d, 2);
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(e);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => {
    qList.forEach(q => {
      let val = p / q;
      if (!candidatos.includes(val)) candidatos.push(val);
    });
  });
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$e = ${e}$$ ($$p$$): $$\\mathcal{\\{}${pList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): $$\\mathcal{\\{}${qList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Raíces racionales candidatas ($$\\pm p/q$$): $$\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$$</div>`;

  const P = (x) => a * Math.pow(x, 4) + b * Math.pow(x, 3) + c * Math.pow(x, 2) + d * x + e;
  let r1 = null;

  for (let cand of candidatos) {
    if (Math.abs(P(cand)) < 0.000001) {
      r1 = cand;
      break;
    }
  }

  if (r1 === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> No se encontraron raíces enteras/racionales exactas en los candidatos.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let k1 = r1;
  let m1 = a * k1;
  let c2 = b + m1;
  let m2 = c2 * k1;
  let c3 = c + m2;
  let m3 = c3 * k1;
  let c4 = d + m3;
  let m4 = c4 * k1;
  let residuo1 = e + m4;

  pasos += `<div><strong>Paso 3: Primera División Sintética (Ruffini):</strong></div>`;
  pasos += `<div>Evaluando $$x = ${k1}$$: $$P(${k1}) = 0$$. Raíz encontrada: <span class="resultado-final">$$x_1 = ${k1}$$</span></div>`;
  
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${k1}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${e}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
        <td>${m4 >= 0 ? '+' + m4 : m4}</td>
      </tr>
      <tr>
        <td class="col-raiz">Cúbico</td>
        <td><strong>${a}</strong></td>
        <td><strong>${c2}</strong></td>
        <td><strong>${c3}</strong></td>
        <td><strong>${c4}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo1) < 0.0001 ? 0 : residuo1}</td>
      </tr>
    </table>
  </div>`;

  pasos += `<div>Polinomio cúbico reducido: $$(${a})x^3 + (${c2})x^2 + (${c3})x + (${c4}) = 0$$</div>`;
  pasos += resolverCubicaAuxiliar(a, c2, c3, c4, 2);

  res.innerHTML = pasos;
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

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero para ser de quinto grado.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Polinómica Quíntica:</strong></div>`;
  pasos += `<div>$$P(x) = ${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f}) = 0$$</div>`;

  if (f === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $$x$$:</strong></div>`;
    pasos += `<div>$$P(x) = x \\cdot (${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e})) = 0$$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $$x_1 = 0$$</div>`;
    pasos += `<div>Para encontrar las raíces restantes, resolvemos la sub-ecuación de cuarto grado:</div>`;
    
    res.innerHTML = pasos + resolverCuarticaAuxiliar(a, b, c, d, e, 2);
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(f);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$f = ${f}$$ ($$p$$): $$\\mathcal{\\{}${pList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): $$\\mathcal{\\{}${qList.join(', ')}\\mathcal{\\}}$$</div>`;
  pasos += `<div>• Posibles raíces ($$\\pm p/q$$): $$\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$$</div>`;

  const P = (x) => a * Math.pow(x, 5) + b * Math.pow(x, 4) + c * Math.pow(x, 3) + d * Math.pow(x, 2) + e * x + f;
  let r1 = null;

  for (let cand of candidatos) {
    if (Math.abs(P(cand)) < 0.000001) {
      r1 = cand;
      break;
    }
  }

  if (r1 === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> Según el Teorema de Abel-Ruffini, las ecuaciones polinómicas de grado $$\\ge 5$$ no siempre son solubles mediante radicales si carecen de raíces racionales enteras.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let k1 = r1;
  let m1 = a * k1;
  let c2 = b + m1;
  let m2 = c2 * k1;
  let c3 = c + m2;
  let m3 = c3 * k1;
  let c4 = d + m3;
  let m4 = c4 * k1;
  let c5 = e + m4;
  let m5 = c5 * k1;
  let residuo1 = f + m5;

  pasos += `<div><strong>Paso 3: Primera División Sintética (Ruffini):</strong></div>`;
  pasos += `<div>Evaluando $$x = ${k1}$$: $$P(${k1}) = 0$$. Raíz encontrada: <span class="resultado-final">$$x_1 = ${k1}$$</span></div>`;
  
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${k1}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${e}</td><td>${f}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
        <td>${m4 >= 0 ? '+' + m4 : m4}</td>
        <td>${m5 >= 0 ? '+' + m5 : m5}</td>
      </tr>
      <tr>
        <td class="col-raiz">Cuártico</td>
        <td><strong>${a}</strong></td>
        <td><strong>${c2}</strong></td>
        <td><strong>${c3}</strong></td>
        <td><strong>${c4}</strong></td>
        <td><strong>${c5}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo1) < 0.0001 ? 0 : residuo1}</td>
      </tr>
    </table>
  </div>`;

  pasos += resolverCuarticaAuxiliar(a, c2, c3, c4, c5, 2);

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverCuarticaAuxiliar(a, b, c, d, e, indiceInicio) {
  let html = `<div style="margin-top:1rem;"><strong>Resolución del Polinomio Cuártico Reducido:</strong></div>`;
  const P4 = (x) => a * Math.pow(x, 4) + b * Math.pow(x, 3) + c * Math.pow(x, 2) + d * x + e;
  
  const pList = obtenerDivisores(e);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));

  let r2 = null;
  for (let cand of candidatos) {
    if (Math.abs(P4(cand)) < 0.000001) {
      r2 = cand;
      break;
    }
  }

  if (r2 === null) {
    return html + `<div style="color:#b91c1c;">No se encontraron más raíces racionales exactas para la sub-ecuación cuártica.</div>`;
  }

  let m1 = a * r2;
  let c2 = b + m1;
  let m2 = c2 * r2;
  let c3 = c + m2;
  let m3 = c3 * r2;
  let c4 = d + m3;
  let m4 = c4 * r2;
  let residuo2 = e + m4;

  html += `<div>Evaluando $$x = ${r2}$$: Raíz obtenida: <span class="resultado-final">$$x_${indiceInicio} = ${r2}$$</span></div>`;
  html += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${r2}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${e}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
        <td>${m4 >= 0 ? '+' + m4 : m4}</td>
      </tr>
      <tr>
        <td class="col-raiz">Cúbico</td>
        <td><strong>${a}</strong></td>
        <td><strong>${c2}</strong></td>
        <td><strong>${c3}</strong></td>
        <td><strong>${c4}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo2) < 0.0001 ? 0 : residuo2}</td>
      </tr>
    </table>
  </div>`;

  html += resolverCubicaAuxiliar(a, c2, c3, c4, indiceInicio + 1);
  return html;
}

function resolverCubicaAuxiliar(a, b, c, d, indiceInicio) {
  let html = `<div style="margin-top:1rem;"><strong>Resolución de la Ecuación Cúbica Reducida:</strong></div>`;
  const P3 = (x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  
  const pList = obtenerDivisores(d);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));

  let r2 = null;
  for (let cand of candidatos) {
    if (Math.abs(P3(cand)) < 0.000001) {
      r2 = cand;
      break;
    }
  }

  if (r2 === null) {
    return html + `<div style="color:#b91c1c;">No se encontraron más raíces racionales exactas para la sub-ecuación cúbica.</div>`;
  }

  let m1 = a * r2;
  let c2 = b + m1;
  let m2 = c2 * r2;
  let c3 = c + m2;
  let m3 = c3 * r2;
  let residuo2 = d + m3;

  html += `<div>Evaluando $$x = ${r2}$$: Raíz obtenida: <span class="resultado-final">$$x_${indiceInicio} = ${r2}$$</span></div>`;
  html += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${r2}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
      </tr>
      <tr>
        <td class="col-raiz">Cuadrático</td>
        <td><strong>${a}</strong></td>
        <td><strong>${c2}</strong></td>
        <td><strong>${c3}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo2) < 0.0001 ? 0 : residuo2}</td>
      </tr>
    </table>
  </div>`;

  html += resolverCuadraticaResidual(a, c2, c3, indiceInicio + 1);
  return html;
}

function resolverCuadraticaResidual(a2, b2, c2, indiceInicio) {
  let html = `<div style="margin-top:0.75rem;"><strong>Resolución de la Ecuación Cuadrática Residual:</strong></div>`;
  html += `<div>Aplicando la fórmula general a $$${a2}x^2 + (${b2})x + (${c2}) = 0$$:</div>`;
  
  let disc = (b2 * b2) - (4 * a2 * c2);
  html += `<div>Cálculo del Discriminante: $$\\Delta = (${b2})^2 - 4(${a2})(${c2}) = ${disc.toFixed(2)}$$</div>`;

  if (disc > 0) {
    let x2 = (-b2 + Math.sqrt(disc)) / (2 * a2);
    let x3 = (-b2 - Math.sqrt(disc)) / (2 * a2);
    html += `<div class="resultado-final">$$x_${indiceInicio} = \\frac{-(${b2}) + \\sqrt{${disc.toFixed(2)}}}{2(${a2})} = ${x2.toFixed(4)}$$</div>`;
    html += `<div class="resultado-final">$$x_${indiceInicio + 1} = \\frac{-(${b2}) - \\sqrt{${disc.toFixed(2)}}}{2(${a2})} = ${x3.toFixed(4)}$$</div>`;
  } else if (disc === 0) {
    let x2 = -b2 / (2 * a2);
    html += `<div class="resultado-final">$$x_${indiceInicio} = x_${indiceInicio + 1} = ${x2.toFixed(4)}$$ (Raíz de multiplicidad 2)</div>`;
  } else {
    let pReal = -b2 / (2 * a2);
    let pImag = Math.sqrt(-disc) / (2 * a2);
    html += `<div class="resultado-final">$$x_${indiceInicio} = ${pReal.toFixed(2)} + ${pImag.toFixed(2)}i$$</div>`;
    html += `<div class="resultado-final">$$x_${indiceInicio + 1} = ${pReal.toFixed(2)} - ${pImag.toFixed(2)}i$$</div>`;
  }

  return html;
}

/* =====================================================================
   LÓGICA MATEMÁTICA: ECUACIONES CON VALOR ABSOLUTO
   ===================================================================== */
function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero en una ecuación de primer grado con valor absoluto.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación:</strong></div>`;
  pasos += `<div>$$|${a}x + (${b})| = ${c}$$</div>`;

  if (c < 0) {
    pasos += `<div><strong>Paso 2: Análisis de restricción del Valor Absoluto:</strong></div>`;
    pasos += `<div>Dado que el término independiente $$c = ${c} < 0$$, la ecuación no tiene solución en los números reales ($$\\mathbb{R}$$).</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución: $$\\mathcal{S} = \\emptyset$$ (Sin solución real)</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  if (c === 0) {
    let x = -b / a;
    pasos += `<div><strong>Paso 2: Caso Único ($$c = 0$$):</strong></div>`;
    pasos += `<div>$$${a}x + (${b}) = 0 \\implies ${a}x = ${-b} \\implies x = \\frac{${-b}}{${a}}$$</div>`;
    pasos += `<div class="resultado-final">$$x = ${x.toFixed(4)}$$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let x1 = (c - b) / a;
  let x2 = (-c - b) / a;

  pasos += `<div><strong>Paso 2: Descomposición por Propiedad del Valor Absoluto ($$c > 0$$):</strong></div>`;
  pasos += `<div>Se generan dos ecuaciones lineales independientes:</div>`;
  
  pasos += `<div style="margin-top:0.5rem;"><strong>Ecuación 1 ($$ax + b = c$$):</strong></div>`;
  pasos += `<div>$$${a}x + (${b}) = ${c} \\implies ${a}x = ${c - b} \\implies x_1 = \\frac{${c - b}}{${a}}$$</div>`;
  pasos += `<div class="resultado-final">$$x_1 = ${x1.toFixed(4)}$$</div>`;

  pasos += `<div style="margin-top:0.5rem;"><strong>Ecuación 2 ($$ax + b = -c$$):</strong></div>`;
  pasos += `<div>$$${a}x + (${b}) = -${c} \\implies ${a}x = ${-c - b} \\implies x_2 = \\frac{-${c - b}}{${a}}$$</div>`;
  pasos += `<div class="resultado-final">$$x_2 = ${x2.toFixed(4)}$$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}