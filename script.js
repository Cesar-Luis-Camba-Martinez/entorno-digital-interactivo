/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO CON ZOOM Y PAN
   ===================================================================== */
let canvas, ctx;
let resizeFrameId = null;

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

// Optimización con debounce vía requestAnimationFrame
function redimensionarCanvasOptimizado() {
  if (resizeFrameId) {
    cancelAnimationFrame(resizeFrameId);
  }
  resizeFrameId = requestAnimationFrame(() => {
    redimensionarCanvas();
  });
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
  
  window.addEventListener('resize', redimensionarCanvasOptimizado);

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
  for (let i = inicioX; i <= RANGO.maxX + paso / 2; i += paso) {
    let valX = parseFloat(i.toFixed(4));
    let x = (valX - RANGO.minX) * scaleX;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke();
  }

  const inicioY = Math.floor(RANGO.minY / paso) * paso;
  for (let i = inicioY; i <= RANGO.maxY + paso / 2; i += paso) {
    let valY = parseFloat(i.toFixed(4));
    let y = (RANGO.maxY - valY) * scaleY;
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

  // Flecha Eje X Positivo (Derecha)
  ctx.beginPath();
  ctx.moveTo(ancho, centroY);
  ctx.lineTo(ancho - tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(ancho - tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje X Negativo (Izquierda)
  ctx.beginPath();
  ctx.moveTo(0, centroY);
  ctx.lineTo(tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje Y Positivo (Arriba)
  ctx.beginPath();
  ctx.moveTo(centroX, 0);
  ctx.lineTo(centroX - tamFlecha / 2, tamFlecha);
  ctx.lineTo(centroX + tamFlecha / 2, tamFlecha);
  ctx.closePath();
  ctx.fill();

  // Flecha Eje Y Negativo (Abajo)
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
  for (let i = inicioX; i <= RANGO.maxX + paso / 2; i += paso) {
    let val = parseFloat(i.toFixed(4));
    if (Math.abs(val) < 0.0001) continue;
    let x = (val - RANGO.minX) * scaleX;
    ctx.beginPath(); ctx.moveTo(x, centroY - 4); ctx.lineTo(x, centroY + 4); ctx.stroke();
    ctx.fillText(Number(val.toFixed(2)), x - 6, centroY + 6);
  }

  ctx.textBaseline = 'middle';
  for (let i = inicioY; i <= RANGO.maxY + paso / 2; i += paso) {
    let val = parseFloat(i.toFixed(4));
    if (Math.abs(val) < 0.0001) continue;
    let y = (RANGO.maxY - val) * scaleY;
    ctx.beginPath(); ctx.moveTo(centroX - 4, y); ctx.lineTo(centroX + 4, y); ctx.stroke();
    ctx.fillText(Number(val.toFixed(2)), centroX + 8, y);
  }

  // 5. Etiquetado de los extremos (x, -x, y, -y)
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

  // Dibujar asíntota vertical si existe
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
    
    // Control de asíntota para evitar trazos verticales espurios
    if (asintotaX !== null && Math.abs(mathX - asintotaX) < (1.5 / scaleX)) {
      if (iniciado) {
        ctx.stroke();
        ctx.beginPath();
        iniciado = false;
      }
      continue;
    }

    let mathY = funcion(mathX);
    
    if (isNaN(mathY) || !isFinite(mathY)) {
      if (iniciado) {
        ctx.stroke();
        ctx.beginPath();
        iniciado = false;
      }
      continue;
    }

    let py = (RANGO.maxY - mathY) * scaleY;

    // Descarte de valores fuera del lienzo para evitar cortes bruscos
    if (py < -alto || py > alto * 2) {
      if (iniciado) {
        ctx.stroke();
        ctx.beginPath();
        iniciado = false;
      }
      continue;
    }

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
   LÓGICA MATEMÁTICA PASO A PASO
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    if (b === 0) {
      res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Identidad: $$0x + 0 = 0$$. La ecuación admite infinitas soluciones en $$\\mathbb{R}$$.</span>';
    } else {
      res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Contradicción: $$0x + (' + b + ') = 0$$. La ecuación no tiene solución en $$\\mathbb{R}$$ ($$\\mathcal{S} = \\emptyset$$).</span>';
    }
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }
  
  let x = -b / a;
  res.innerHTML = `<div><strong>Explicación:</strong> Para resolver la ecuación lineal $$${a}x + (${b}) = 0$$, se aísla el término con la incógnita y luego se despeja $$x$$.</div>
                   <div><strong>Paso 1: Planteamiento de la ecuación original:</strong> $$${a}x + (${b}) = 0$$</div>
                   <div><strong>Paso 2: Transposición del término independiente:</strong> $$${a}x = ${-b}$$</div>
                   <div><strong>Paso 3: Despeje formal dividiendo para $$a$$ ($$a = ${a} \\neq 0$$):</strong> $$x = \\frac{${-b}}{${a}}$$</div>
                   <div class="resultado-final"><strong>Resultado Formateado:</strong> $$x = ${x.toFixed(4)}$$</div>`;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

function resolverFraccionaria() {
  const a = parseFloat(document.getElementById('frac-a').value) || 0;
  const b = parseFloat(document.getElementById('frac-b').value) || 0;
  const c = parseFloat(document.getElementById('frac-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El numerador $$a$$ no puede ser cero en una ecuación fraccionaria racional.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let restriccion = -b;
  let pasos = `<div><strong>Explicación:</strong> Se analiza la ecuación racional $$\\frac{${a}}{x + (${b})} + (${c}) = 0$$ determinando primero su dominio de definición.</div>`;
  pasos += `<div><strong>Paso 1: Identificación del Dominio y Restricción:</strong> El denominador no puede ser cero ($$x + (${b}) \\neq 0 \\implies x \\neq ${restriccion}$$).</div>`;
  
  if (c === 0) {
    pasos += `<div style="color:#ef4444; font-weight:bold;">Dado que $$c = 0$$, $$\\frac{${a}}{x + (${b})} = 0$$, la ecuación no posee solución real pues $$a = ${a} \\neq 0$$.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  pasos += `<div><strong>Paso 2: Transposición de la constante $$c$$:</strong> $$\\frac{${a}}{x + (${b})} = ${-c}$$</div>`;
  pasos += `<div><strong>Paso 3: Multiplicación por el denominador en ambos miembros:</strong> $$${a} = ${-c} \\cdot (x + (${b}))$$</div>`;
  pasos += `<div><strong>Paso 4: Propiedad distributiva en el miembro derecho:</strong> $$${a} = ${-c}x + (${-c * b})$$</div>`;
  pasos += `<div><strong>Paso 5: Transposición de términos para despejar $$x$$:</strong> $${c}x = ${-c * b} - (${a}) \\implies ${c}x = ${-c * b - a}$$</div>`;
  
  let x = (-c * b - a) / c;
  pasos += `<div><strong>Paso 6: Despeje numérico final:</strong> $$x = \\frac{${-c * b - a}}{${c}} = ${x.toFixed(4)}$$</div>`;

  if (Math.abs(x - restriccion) < 0.000001) {
    pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">⚠ La solución generada ($$x = ${x.toFixed(4)}$$) coincide con la restricción del dominio ($$x \\neq ${restriccion}$$). Por lo tanto, la ecuación no tiene solución válida en $$\\mathbb{R}$$.</div>`;
  } else {
    pasos += `<div class="resultado-final">$$x = ${x.toFixed(4)}$$ (Solución válida, pues $$x \\neq ${restriccion}$$)</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

function calcularEcuacion() {
  const a = parseFloat(document.getElementById('coef-a').value) || 0;
  const b = parseFloat(document.getElementById('coef-b').value) || 0;
  const c = parseFloat(document.getElementById('coef-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero en una ecuación cuadrática.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let discriminante = (b * b) - (4 * a * c);
  let pasos = `<div><strong>Explicación:</strong> Se evalúa el discriminante $$\\Delta = b^2 - 4ac$$ para determinar la naturaleza de las raíces de $$${a}x^2 + (${b})x + (${c}) = 0$$.</div>`;
  pasos += `<div><strong>Paso 1: Cálculo del Discriminante:</strong> $$\\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${discriminante}$$</div>`;

  if (discriminante > 0) {
    let x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    let x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    pasos += `<div><strong>Paso 2: Existencia de dos raíces reales distintas ($$\\Delta > 0$$):</strong></div>`;
    pasos += `<div>$$x_1 = \\frac{-(${b}) + \\sqrt{${discriminante}}}{2(${a})} = \\frac>${-b} + ${Math.sqrt(discriminante).toFixed(4)}}{${2 * a}} = ${x1.toFixed(4)}$$</div>`;
    pasos += `<div>$$x_2 = \\frac{-(${b}) - \\sqrt{${discriminante}}}{2(${a})} = \\frac>${-b} - ${Math.sqrt(discriminante).toFixed(4)}}{${2 * a}} = ${x2.toFixed(4)}$$</div>`;
    pasos += `<div class="resultado-final">Raíces Reales: $$x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$$</div>`;
  } else if (discriminante === 0) {
    let x = -b / (2 * a);
    pasos += `<div><strong>Paso 2: Existencia de una única raíz real doble ($$\\Delta = 0$$):</strong></div>`;
    pasos += `<div>$$x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$$</div>`;
    pasos += `<div class="resultado-final">Raíz Real Única: $$x = ${x.toFixed(4)}$$</div>`;
  } else {
    let parteReal = (-b / (2 * a)).toFixed(4);
    let parteImaginaria = (Math.sqrt(-discriminante) / (2 * a)).toFixed(4);
    pasos += `<div><strong>Paso 2: Existencia de dos raíces complejas conjugadas ($$\\Delta < 0$$):</strong></div>`;
    pasos += `<div class="resultado-final">Raíces Complejas: $$x_1 = ${parteReal} + ${Math.abs(parteImaginaria)}i, \\quad x_2 = ${parteReal} - ${Math.abs(parteImaginaria)}i$$</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
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
  let pasos = `<div><strong>Explicación:</strong> Aplicación de la Regla de Cramer mediante cálculo de determinantes ordenados.</div>`;
  pasos += `<div><strong>Paso 1: Determinante del Sistema:</strong></div>`;
  pasos += `<div>$$\\text{Det}(S) = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1} \\cdot ${b2}) - (${a2} \\cdot ${b1}) = ${detS}$$</div>`;

  if (detS === 0) {
    let detX = (c1 * b2) - (c2 * b1);
    if (detX === 0) {
      pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">Sistema Compatible Indeterminado: Infinitas soluciones (rectas coincidentes).</div>`;
    } else {
      pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">Sistema Incompatible: Sin solución en $$\\mathbb{R}$$ (rectas paralelas no coincidentes).</div>`;
    }
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let detX = (c1 * b2) - (c2 * b1);
  let detY = (a1 * c2) - (a2 * c1);

  pasos += `<div><strong>Paso 2: Determinante respecto a X:</strong></div>`;
  pasos += `<div>$$\\text{Det}(S_x) = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = (${c1} \\cdot ${b2}) - (${c2} \\cdot ${b1}) = ${detX}$$</div>`;

  pasos += `<div><strong>Paso 3: Determinante respecto a Y:</strong></div>`;
  pasos += `<div>$$\\text{Det}(S_y) = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = (${a1} \\cdot ${c2}) - (${a2} \\cdot ${c1}) = ${detY}$$</div>`;

  let x = detX / detS;
  let y = detY / detS;

  pasos += `<div><strong>Paso 4: Soluciones Finales por División de Determinantes:</strong></div>`;
  pasos += `<div>$$x = \\frac{\\text{Det}(S_x)}{\\text{Det}(S)} = \\frac{${detX}}{${detS}} = ${x.toFixed(4)}$$</div>`;
  pasos += `<div>$$y = \\frac{\\text{Det}(S_y)}{\\text{Det}(S)} = \\frac{${detY}}{${detS}} = ${y.toFixed(4)}$$</div>`;
  pasos += `<div class="resultado-final">Punto de Intersección Único: $$(x, y) = (${x.toFixed(4)}, \\; ${y.toFixed(4)})$$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

function resolverPolinomica() {
  const a = parseFloat(document.getElementById('poly-a').value) || 0;
  const b = parseFloat(document.getElementById('poly-b').value) || 0;
  const c = parseFloat(document.getElementById('poly-c').value) || 0;
  const d = parseFloat(document.getElementById('poly-d').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ debe ser distinto de cero para un polinomio cúbico.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let pasos = `<div><strong>Explicación:</strong> Resolución del polinomio cúbico $$${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0$$ aplicando la Regla de Ruffini.</div>`;
  
  let raizEncontrada = null;
  for (let r = -20; r <= 20; r++) {
    if (r === 0 && d !== 0) continue;
    let evalPol = a * Math.pow(r, 3) + b * Math.pow(r, 2) + c * r + d;
    if (Math.abs(evalPol) < 0.0001) {
      raizEncontrada = r;
      break;
    }
  }

  if (raizEncontrada === null) {
    pasos += `<div>No se encontraron raíces enteras inmediatas en el rango de búsqueda. Evaluando por métodos numéricos aproximados.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let r1 = raizEncontrada;
  let c2 = b + (r1 * a);
  let c3 = c + (r1 * c2);
  let residuo = d + (r1 * c3);

  let m1 = r1 * a;
  let m2 = r1 * c2;
  let m3 = r1 * c3;

  pasos += `<div><strong>Paso 1: Identificación de la primera raíz entera por evaluación del Teorema del Residuo:</strong> $$x_1 = ${r1}$$</div>`;
  pasos += `<div><strong>Paso 2: Esquema Formal de la Tabla de División Sintética de Ruffini:</strong></div>`;
  
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${r1}</td>
        <td>${a}</td>
        <td>${b}</td>
        <td>${c}</td>
        <td>${d}</td>
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
        <td class="residuo-cero">${Math.abs(residuo) < 0.0001 ? 0 : residuo}</td>
      </tr>
    </table>
  </div>`;

  pasos += `<div><strong>Paso 3: Reducción a Ecuación Cuadrática Residual:</strong> $$(${a})x^2 + (${c2})x + (${c3}) = 0$$</div>`;
  
  let disc = (c2 * c2) - (4 * a * c3);
  if (disc > 0) {
    let x2 = (-c2 + Math.sqrt(disc)) / (2 * a);
    let x3 = (-c2 - Math.sqrt(disc)) / (2 * a);
    pasos += `<div class="resultado-final">Raíces Reales Obtenidas: $$x_1 = ${r1}, \\quad x_2 = ${x2.toFixed(4)}, \\quad x_3 = ${x3.toFixed(4)}$$</div>`;
  } else if (disc === 0) {
    let x2 = -c2 / (2 * a);
    pasos += `<div class="resultado-final">Raíces Reales Obtenidas: $$x_1 = ${r1}, \\quad x_{2,3} = ${x2.toFixed(4)}$$ (Doble)</div>`;
  } else {
    let pReal = (-c2 / (2 * a)).toFixed(4);
    let pImag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
    pasos += `<div class="resultado-final">Raíces del Polinomio: $$x_1 = ${r1}, \\quad x_{2,3} = ${pReal} \\pm ${Math.abs(pImag)}i$$</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

function resolverCuartica() {
  const a = parseFloat(document.getElementById('quart-a').value) || 0;
  const b = parseFloat(document.getElementById('quart-b').value) || 0;
  const c = parseFloat(document.getElementById('quart-c').value) || 0;
  const d = parseFloat(document.getElementById('quart-d').value) || 0;
  const e = parseFloat(document.getElementById('quart-e').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero en un polinomio cuártico.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let pasos = `<div><strong>Explicación:</strong> Resolución del polinomio de grado 4 $$${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e}) = 0$$ mediante reducción sistemática de Ruffini.</div>`;

  let r1 = null;
  for (let r = -20; r <= 20; r++) {
    if (r === 0 && e !== 0) continue;
    let val = a * Math.pow(r, 4) + b * Math.pow(r, 3) + c * Math.pow(r, 2) + d * r + e;
    if (Math.abs(val) < 0.0001) { r1 = r; break; }
  }

  if (r1 === null) {
    pasos += `<div>No se encontraron raíces racionales enteras inmediatas en el rango estándar.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let c2 = b + (r1 * a);
  let c3 = c + (r1 * c2);
  let c4 = d + (r1 * c3);
  let residuo1 = e + (r1 * c4);

  let m1 = r1 * a;
  let m2 = r1 * c2;
  let m3 = r1 * c3;
  let m4 = r1 * c4;

  pasos += `<div><strong>Paso 1: Primera Raíz Identificada por Evaluación:</strong> <span class="resultado-final">$$x_1 = ${r1}$$</span></div>`;
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${r1}</td>
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

  pasos += `<div><strong>Paso 2: Reducción a Polinomio Cúbico Residual:</strong> $$(${a})x^3 + (${c2})x^2 + (${c3})x + (${c4}) = 0$$</div>`;
  
  let r2 = null;
  for (let r = -20; r <= 20; r++) {
    if (r === 0 && c4 !== 0) continue;
    let val = a * Math.pow(r, 3) + c2 * Math.pow(r, 2) + c3 * r + c4;
    if (Math.abs(val) < 0.0001) { r2 = r; break; }
  }

  if (r2 !== null) {
    let q2 = c2 + (r2 * a);
    let q3 = c3 + (r2 * q2);
    let residuo2 = c4 + (r2 * q3);

    let k1 = r2 * a;
    let k2 = r2 * q2;
    let k3 = r2 * q3;

    pasos += `<div><strong>Paso 3: Segunda Raíz Identificada por Segunda División Sintética:</strong> <span class="resultado-final">$$x_2 = ${r2}$$</span></div>`;
    pasos += `<div class="tabla-ruffini-container">
      <table class="tabla-ruffini">
        <tr>
          <td class="col-raiz">x = ${r2}</td>
          <td>${a}</td><td>${c2}</td><td>${c3}</td><td>${c4}</td>
        </tr>
        <tr>
          <td class="col-raiz">↓</td>
          <td>—</td>
          <td>${k1 >= 0 ? '+' + k1 : k1}</td>
          <td>${k2 >= 0 ? '+' + k2 : k2}</td>
          <td>${k3 >= 0 ? '+' + k3 : k3}</td>
        </tr>
        <tr>
          <td class="col-raiz">Cuadrático</td>
          <td><strong>${a}</strong></td>
          <td><strong>${q2}</strong></td>
          <td><strong>${q3}</strong></td>
          <td class="residuo-cero">${Math.abs(residuo2) < 0.0001 ? 0 : residuo2}</td>
        </tr>
      </table>
    </div>`;

    pasos += `<div><strong>Paso 4: Análisis de la Ecuación Cuadrática Residual Final:</strong> $$(${a})x^2 + (${q2})x + (${q3}) = 0$$</div>`;
    let disc = q2 * q2 - 4 * a * q3;
    if (disc > 0) {
      let x3 = (-q2 + Math.sqrt(disc)) / (2 * a);
      let x4 = (-q2 - Math.sqrt(disc)) / (2 * a);
      pasos += `<div class="resultado-final">Raíces Finales del Polinomio Cuártico: $$x_1 = ${r1}, \\quad x_2 = ${r2}, \\quad x_3 = ${x3.toFixed(4)}, \\quad x_4 = ${x4.toFixed(4)}$$</div>`;
    } else if (disc === 0) {
      let x3 = -q2 / (2 * a);
      pasos += `<div class="resultado-final">Raíces Finales del Polinomio Cuártico: $$x_1 = ${r1}, \\quad x_2 = ${r2}, \\quad x_{3,4} = ${x3.toFixed(4)}$$</div>`;
    } else {
      let pR = (-q2 / (2 * a)).toFixed(4);
      let pI = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
      pasos += `<div class="resultado-final">Raíces Finales: $$x_1 = ${r1}, \\quad x_2 = ${r2}, \\quad x_{3,4} = ${pR} \\pm ${Math.abs(pI)}i$$</div>`;
    }
  } else {
    pasos += `<div>No se logró reducir el polinomio a grado 2 por raíces enteras secundarias.</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ debe ser distinto de cero para un polinomio quíntico.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let pasos = `<div><strong>Explicación:</strong> Análisis procedimental del polinomio de grado 5 $$${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f}) = 0$$.</div>`;

  let coefs = [a, b, c, d, e, f];
  let raicesEncontradas = [];
  let gradoActual = 5;

  function evaluarPolinomio(arr, val) {
    let resP = 0;
    for (let i = 0; i < arr.length; i++) {
      resP += arr[i] * Math.pow(val, arr.length - 1 - i);
    }
    return resP;
  }

  for (let iter = 1; iter <= 3; iter++) {
    let rEncontrada = null;
    let indFte = coefs[coefs.length - 1];

    for (let r = -20; r <= 20; r++) {
      if (r === 0 && indFte !== 0) continue;
      let val = evaluarPolinomio(coefs, r);
      if (Math.abs(val) < 0.0001) {
        rEncontrada = r;
        break;
      }
    }

    if (rEncontrada !== null) {
      raicesEncontradas.push(rEncontrada);
      let nuevosCoefs = [coefs[0]];
      let multiplicadores = [];

      for (let k = 1; k < coefs.length - 1; k++) {
        let mult = rEncontrada * nuevosCoefs[k - 1];
        multiplicadores.push(mult);
        nuevosCoefs.push(coefs[k] + mult);
      }
      
      let resUlt = rEncontrada * nuevosCoefs[nuevosCoefs.length - 1];
      multiplicadores.push(resUlt);
      let residuo = coefs[coefs.length - 1] + resUlt;

      pasos += `<div><strong>Paso ${iter}: División Sintética de Ruffini para la raíz $$x_${iter} = ${rEncontrada}$$:</strong></div>`;
      
      let htmlTabla = `<div class="tabla-ruffini-container"><table class="tabla-ruffini"><tr><td class="col-raiz">x = ${rEncontrada}</td>`;
      coefs.forEach(cf => htmlTabla += `<td>${cf}</td>`);
      htmlTabla += `</tr><tr><td class="col-raiz">↓</td><td>—</td>`;
      multiplicadores.forEach(m => htmlTabla += `<td>${m >= 0 ? '+' + m : m}</td>`);
      htmlTabla += `</tr><tr><td class="col-raiz">Grado ${gradoActual - 1}</td>`;
      nuevosCoefs.forEach(nc => htmlTabla += `<td><strong>${nc}</strong></td>`);
      htmlTabla += `<td class="residuo-cero">${Math.abs(residuo) < 0.0001 ? 0 : residuo}</td></tr></table></div>`;

      pasos += htmlTabla;
      coefs = nuevosCoefs;
      gradoActual--;
    } else {
      break;
    }
  }

  if (gradoActual === 2) {
    pasos += `<div><strong>Paso Final: Resolución de la Ecuación Cuadrática Residual:</strong> $$(${coefs[0]})x^2 + (${coefs[1]})x + (${coefs[2]}) = 0$$</div>`;
    let disc = coefs[1] * coefs[1] - 4 * coefs[0] * coefs[2];
    if (disc > 0) {
      let xA = (-coefs[1] + Math.sqrt(disc)) / (2 * coefs[0]);
      let xB = (-coefs[1] - Math.sqrt(disc)) / (2 * coefs[0]);
      raicesEncontradas.push(Number(xA.toFixed(4)));
      raicesEncontradas.push(Number(xB.toFixed(4)));
    } else if (disc === 0) {
      let xA = -coefs[1] / (2 * coefs[0]);
      raicesEncontradas.push(Number(xA.toFixed(4)));
    } else {
      let pR = (-coefs[1] / (2 * coefs[0])).toFixed(4);
      let pI = (Math.sqrt(-disc) / (2 * coefs[0])).toFixed(4);
      raicesEncontradas.push(`${pR} + ${Math.abs(pI)}i`);
      raicesEncontradas.push(`${pR} - ${Math.abs(pI)}i`);
    }
  }

  pasos += `<div class="resultado-final"><strong>Conjunto Solución Obtenido:</strong> $$\\mathcal{S} = \\{ ${raicesEncontradas.join(', \\; ')} \\}$$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}

function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero en una ecuación con valor absoluto.</span>';
    renderizarMatematicasGlobal();
    actualizarGrafica();
    return;
  }

  let pasos = `<div><strong>Explicación:</strong> Para resolver la ecuación con valor absoluto de la forma $$|${a}x + (${b})| = ${c}$$, se analiza el término independiente $$c$$ y se aplica la propiedad fundamental $$|u| = c \\iff u = c \\text{ o } u = -c$$ (para $$c \\ge 0$$).</div>`;
  pasos += `<div><strong>Paso 1: Análisis del término independiente externo $$c = ${c}$$:</strong></div>`;

  if (c < 0) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Dado que $$c = ${c} < 0$$, la ecuación no posee solución en el conjunto de los números reales ($\\mathbb{R}$), debido a que el valor absoluto de cualquier expresión algebraica es siempre no negativo ($$\\mathcal{S} = \\emptyset$$).</div>`;
  } else if (c === 0) {
    let x = -b / a;
    pasos += `<div>Dado que $$c = 0$$, la expresión dentro del valor absoluto debe ser estrictamente igual a cero:</div>`;
    pasos += `<div><strong>Subpaso 1.1 (Planteamiento de la igualdad única):</strong> $$${a}x + (${b}) = 0$$</div>`;
    pasos += `<div><strong>Subpaso 1.2 (Transposición de la constante $b$):</strong> $$${a}x = ${-b}$$</div>`;
    pasos += `<div><strong>Subpaso 1.3 (Despeje formal de $x$):</strong> $$x = \\frac{${-b}}{${a}}$$</div>`;
    pasos += `<div class="resultado-final"><strong>Solución Única:</strong> $$x = ${x.toFixed(4)}$$</div>`;
  } else {
    let x1 = (c - b) / a;
    let x2 = (-c - b) / a;

    pasos += `<div><strong>Paso 2: Descomposición detallada en dos casos algebraicos por definición de valor absoluto:</strong></div>`;

    // CASO 1: Igualdad Positiva (+c)
    pasos += `<div style="margin-top: 0.75rem; padding: 0.85rem 1rem; background-color: #f8fafc; border-left: 4px solid var(--azul-medio); border-radius: 6px;">`;
    pasos += `<div><strong>📌 Caso 1 (Igualdad Positiva, $+c$):</strong> $$${a}x + (${b}) = ${c}$$</div>`;
    pasos += `<div style="margin-top:0.3rem;">• <em>Subpaso 1.1 (Planteamiento de la igualdad):</em> $$${a}x + (${b}) = ${c}$$</div>`;
    pasos += `<div>• <em>Subpaso 1.2 (Transposición del término independiente $b$):</em> $$${a}x = ${c} - (${b})$$</div>`;
    pasos += `<div>• <em>Subpaso 1.3 (Simplificación del miembro derecho):</em> $$${a}x = ${c - b}$$</div>`;
    pasos += `<div>• <em>Subpaso 1.4 (Despeje de la incóginta $x_1$ dividiendo para $a = ${a}$):</em> $$x_1 = \\frac{${c - b}}{${a}}$$</div>`;
    pasos += `<div style="margin-top:0.3rem;">• <em>Subpaso 1.5 (Cálculo numérico final del Caso 1):</em> <strong style="color: var(--azul-oscuro);">$$x_1 = ${x1.toFixed(4)}$$</strong></div>`;
    pasos += `</div>`;

    // CASO 2: Igualdad Negativa (-c)
    pasos += `<div style="margin-top: 0.75rem; padding: 0.85rem 1rem; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px;">`;
    pasos += `<div><strong>📌 Caso 2 (Igualdad Negativa, $-c$):</strong> $$${a}x + (${b}) = -(${c})$$</div>`;
    pasos += `<div style="margin-top:0.3rem;">• <em>Subpaso 2.1 (Planteamiento de la igualdad):</em> $$${a}x + (${b}) = ${-c}$$</div>`;
    pasos += `<div>• <em>Subpaso 2.2 (Transposición del término independiente $b$):</em> $$${a}x = ${-c} - (${b})$$</div>`;
    pasos += `<div>• <em>Subpaso 2.3 (Simplificación del miembro derecho):</em> $$${a}x = ${-c - b}$$</div>`;
    pasos += `<div>• <em>Subpaso 2.4 (Despeje de la incógnita $x_2$ dividiendo para $a = ${a}$):</em> $$x_2 = \\frac{${-c - b}}{${a}}$$</div>`;
    pasos += `<div style="margin-top:0.3rem;">• <em>Subpaso 2.5 (Cálculo numérico final del Caso 2):</em> <strong style="color: #047857;">$$x_2 = ${x2.toFixed(4)}$$</strong></div>`;
    pasos += `</div>`;

    // CONJUNTO SOLUCIÓN FINAL
    pasos += `<div class="resultado-final" style="margin-top: 1rem;">`;
    pasos += `<strong>Conjunto Solución Final ($\\mathcal{S}$):</strong> $$\\mathcal{S} = \\{ x_1, \\; x_2 \\} = \\left\\{ ${x1.toFixed(4)}, \\; ${x2.toFixed(4)} \\right\\}$$`;
    pasos += `</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
  actualizarGrafica();
}