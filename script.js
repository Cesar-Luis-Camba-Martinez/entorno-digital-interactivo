/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO (CON ZOOM Y PAN)
   ===================================================================== */
let canvas, ctx;

// Rango por defecto (Escala 1.0)
const RANGO_BASE = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

// Rango dinámico actualizable por el zoom
let RANGO = { ...RANGO_BASE };

/* =====================================================================
   INICIALIZACIÓN Y EVENTOS DE INTERACCIÓN
   ===================================================================== */
window.addEventListener('load', () => {
  canvas = document.getElementById('planoCartesiano');
  if (!canvas || !canvas.getContext) {
    document.querySelector('.grafica-box-global').innerHTML =
      '<p style="color:#b91c1c;padding:1rem;">⚠ Su navegador no soporta Canvas HTML5. Actualice su navegador.</p>';
    return;
  }
  ctx = canvas.getContext('2d');
  
  // Escuchar variaciones en los inputs numéricos para redibujar el plano al instante
  document.querySelectorAll('input[type="number"]').forEach(inp => {
    inp.addEventListener('input', actualizarGrafica);
  });

  // Habilitar Zoom con la Rueda del Ratón (Mouse Wheel)
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85; // Alejar o Acercar
    cambiarZoom(factor);
  }, { passive: false });

  // Sincronizar el estado inicial del panel y la gráfica
  conmutarPanel();
});

// Renderizador automático de fórmulas estáticas y dinámicas
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
  // Limitar el nivel máximo y mínimo de zoom
  const rangoX = (RANGO.maxX - RANGO.minX) * factor;
  if (rangoX < 2 || rangoX > 200) return; // Evita límites extremos

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

  // 1. Ocultar todos los paneles de contenido
  document.querySelectorAll('.panel-contenido').forEach(p => p.classList.add('oculto'));

  // 2. Mapeo del valor del select con el ID del panel
  const mapa = {
    lineal: 'panel-lineal',
    cuadratica: 'panel-cuadratica',
    sistema: 'panel-sistema',
    polinomica: 'panel-polinomica',
    absoluto: 'panel-absoluto'
  };

  // 3. Mostrar el panel correspondiente
  if (mapa[sel]) {
    const panelActivo = document.getElementById(mapa[sel]);
    if (panelActivo) panelActivo.classList.remove('oculto');
  }

  // 4. Actualizar la leyenda según el tipo de ecuación
  actualizarLeyenda(sel);

  // 5. Restablecer el mensaje del área de resultados
  const res = document.getElementById('resultado');
  if (res) {
    res.innerHTML = 'Seleccione una función y presione <strong>Resolver</strong> para mostrar los cálculos paso a paso.';
  }

  // 6. Redibujar el gráfico interactivo y re-renderizar KaTeX
  actualizarGrafica();
  renderizarMatematicasGlobal();
}

function actualizarLeyenda(tipo) {
  const leyenda = document.getElementById('leyenda');
  if (!leyenda) return;
  if (tipo === 'sistema') {
    leyenda.innerHTML = '<span class="leyenda-item"><span class="leyenda-color" style="background:#2563eb;"></span> Ecuación 1</span> <span class="leyenda-item"><span class="leyenda-color" style="background:#10b981;"></span> Ecuación 2</span>';
  } else {
    leyenda.innerHTML = '<span class="leyenda-item"><span class="leyenda-color" style="background:#ef4444;"></span> Gráfica f(x)</span>';
  }
}

/* =====================================================================
   MOTOR GRÁFICO (CANVAS API CON ADAPTABILIDAD DINÁMICA DE PASO)
   ===================================================================== */
function dibujarPlano() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scaleX = canvas.width / (RANGO.maxX - RANGO.minX);
  const scaleY = canvas.height / (RANGO.maxY - RANGO.minY);
  const centroX = -RANGO.minX * scaleX;
  const centroY = RANGO.maxY * scaleY;

  // Determinar el paso de las marcas según la escala del zoom
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
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }

  const inicioY = Math.floor(RANGO.minY / paso) * paso;
  for (let i = inicioY; i <= RANGO.maxY; i += paso) {
    let y = (RANGO.maxY - i) * scaleY;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // 2. Ejes principales X e Y
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, centroY); ctx.lineTo(canvas.width, centroY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(centroX, 0); ctx.lineTo(centroX, canvas.height); ctx.stroke();

  // 3. Texto y Números de Escala
  ctx.fillStyle = '#475569';
  ctx.font = '11px sans-serif';

  // Numeración Eje X
  ctx.textBaseline = 'top';
  for (let i = inicioX; i <= RANGO.maxX; i += paso) {
    if (Math.abs(i) < 0.0001) continue;
    let x = (i - RANGO.minX) * scaleX;
    ctx.beginPath(); ctx.moveTo(x, centroY - 4); ctx.lineTo(x, centroY + 4); ctx.stroke();
    ctx.fillText(Number(i.toFixed(2)), x - 6, centroY + 6);
  }

  // Numeración Eje Y
  ctx.textBaseline = 'middle';
  for (let i = inicioY; i <= RANGO.maxY; i += paso) {
    if (Math.abs(i) < 0.0001) continue;
    let y = (RANGO.maxY - i) * scaleY;
    ctx.beginPath(); ctx.moveTo(centroX - 4, y); ctx.lineTo(centroX + 4, y); ctx.stroke();
    ctx.fillText(Number(i.toFixed(2)), centroX + 8, y);
  }

  // Etiquetas identificadoras
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('X', canvas.width - 15, centroY - 15);
  ctx.fillText('Y', centroX + 12, 15);
}

function graficarFuncion(funcion, color) {
  if (!ctx || !canvas) return;
  const scaleX = canvas.width / (RANGO.maxX - RANGO.minX);
  const scaleY = canvas.height / (RANGO.maxY - RANGO.minY);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  let iniciado = false;
  for (let px = 0; px <= canvas.width; px++) {
    let mathX = RANGO.minX + (px / scaleX);
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
  else if (sel === 'absoluto') {
    let a = parseFloat(document.getElementById('abs-a').value) || 0;
    let b = parseFloat(document.getElementById('abs-b').value) || 0;
    let c = parseFloat(document.getElementById('abs-c').value) || 0;
    graficarFuncion((x) => Math.abs(a * x + b) - c, '#ef4444');
  }
}

/* =====================================================================
   LÓGICA MATEMÁTICA: ECUACIONES LINEALES, CUADRÁTICAS Y SISTEMAS
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error matemático: Si $$a = 0$$, la expresión no representa una ecuación lineal de primer grado de manera válida.</span>';
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
  let pasos = `<div><strong>Paso 1:</strong> Estructurar los valores base: $$a = ${a}, \\; b = ${b}, \\; c = ${c}$$</div>`;
  pasos += `<div><strong>Paso 2:</strong> Calcular el Discriminante: $$\Delta = (${b})^2 - 4(${a})(${c}) = ${discriminante.toFixed(2)}$$</div>`;

  if (discriminante > 0) {
    let x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    let x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> Aplicar la fórmula general obteniendo dos soluciones reales discretas:</div>
              <div class="resultado-final">$$x_1 = \\frac{-(${b}) + \\sqrt{${discriminante.toFixed(2)}}}{2(${a})} = ${x1.toFixed(4)}$$</div>
              <div class="resultado-final">$$x_2 = \\frac{-(${b}) - \\sqrt{${discriminante.toFixed(2)}}}{2(${a})} = ${x2.toFixed(4)}$$</div>`;
  } else if (discriminante === 0) {
    let x = -b / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> Dado que $$\Delta = 0$$, se genera una raíz real única de multiplicidad 2:</div>
              <div class="resultado-final">$$x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$$</div>`;
  } else {
    let parteReal = -b / (2 * a);
    let parteImaginaria = Math.sqrt(-discriminante) / (2 * a);
    pasos += `<div><strong>Paso 3:</strong> El discriminante es negativo ($$\Delta < 0$$). Las raíces pertenecen al campo de los números complejos:</div>
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
   IMPLEMENTACIÓN DETALLADA: ECUACIÓN POLINÓMICA (RUFFINI + RATIONAL ROOT)
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

  // CASO ESPECIAL: Si d = 0, x = 0 es raíz por factor común
  if (d === 0) {
    pasos += `<div><strong>Paso 2: Extracción de Factor Común $$x$$:</strong></div>`;
    pasos += `<div>$$P(x) = x \\cdot (${a}x^2 + (${b})x + (${c})) = 0$$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $$x_1 = 0$$</div>`;
    
    // Resolver ecuación cuadrática restante a*x^2 + b*x + c = 0
    pasos += resolverCuadraticaResidual(a, b, c, 2);
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  // PASO 2: TEOREMA DE LA RAÍZ RACIONAL
  const pList = obtenerDivisores(d);
  const qList = obtenerDivisores(a);
  
  // Calcular candidatos unicos p/q
  let candidatos = [];
  pList.forEach(p => {
    qList.forEach(q => {
      let val = p / q;
      if (!candidatos.includes(val)) candidatos.push(val);
    });
  });
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Aplicación del Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores del término independiente $$d = ${d}$$ ($$p$$): \\{${pList.join(', ')}\\}</div>`;
  pasos += `<div>• Divisores del coeficiente principal $$a = ${a}$$ ($$q$$): \\{${qList.join(', ')}\\}</div>`;
  pasos += `<div>• Posibles raíces racionales ($\pm p/q$): \\{${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\}</div>`;

  // Evaluación de candidatos mediante P(r) = 0
  const P = (x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  let raizEncontrada = null;

  for (let r of candidatos) {
    if (Math.abs(P(r)) < 0.000001) {
      raizEncontrada = r;
      break;
    }
  }

  if (raizEncontrada === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> No se encontraron raíces enteras/racionales exactas en la lista de candidatos. La ecuación requiere métodos numéricos o la Fórmula de Cardano.</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  // PASO 3: DIVISIÓN SINTÉTICA (REGLA DE RUFFINI)
  let k = raizEncontrada;
  let m1 = a * k;
  let coef2 = b + m1;
  let m2 = coef2 * k;
  let coef3 = c + m2;
  let m3 = coef3 * k;
  let residuo = d + m3;

  pasos += `<div><strong>Paso 3: Evaluación y División Sintética (Regla de Ruffini):</strong></div>`;
  pasos += `<div>Probando el valor $$x = ${k}$$: $$P(${k}) = 0$$. Por lo tanto, <span class="resultado-final">$$x_1 = ${k}$$</span> es una raíz exacta.</div>`;
  
  // Render de la Tabla de Ruffini en HTML
  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${k}</td>
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
        <td class="col-raiz">Resultados</td>
        <td><strong>${a}</strong></td>
        <td><strong>${coef2}</strong></td>
        <td><strong>${coef3}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo) < 0.0001 ? 0 : residuo} (Residuo)</td>
      </tr>
    </table>
  </div>`;

  pasos += `<div>Polinomio reducido de segundo grado: $$(${a})x^2 + (${coef2})x + (${coef3}) = 0$$</div>`;

  // PASO 4: RESOLVER ECUACIÓN CUADRÁTICA RESIDUAL
  pasos += resolverCuadraticaResidual(a, coef2, coef3, 2);

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverCuadraticaResidual(a2, b2, c2, indiceInicio) {
  let html = `<div><strong>Paso 4: Resolución de la Ecuación Cuadrática Residual:</strong></div>`;
  html += `<div>Aplicando la fórmula general a $$${a2}x^2 + (${b2})x + (${c2}) = 0$$:</div>`;
  
  let disc = (b2 * b2) - (4 * a2 * c2);
  html += `<div>Cálculo del Discriminante: $$\Delta = (${b2})^2 - 4(${a2})(${c2}) = ${disc.toFixed(2)}$$</div>`;

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
   IMPLEMENTACIÓN: ECUACIÓN CON VALOR ABSOLUTO |ax + b| = c
   ===================================================================== */
function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ debe ser distinto de cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación:</strong></div>`;
  pasos += `<div>$$|${a}x + (${b})| = ${c}$$</div>`;

  // Análisis del término independiente c
  if (c < 0) {
    pasos += `<div><strong>Paso 2: Análisis del Término Independiente ($c < 0$):</strong></div>`;
    pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">Dado que el valor absoluto nunca puede ser negativo ($$${c} < 0$$), la ecuación NO tiene solución en el conjunto de los números reales ($$S = \\emptyset$$).</div>`;
  } else if (c === 0) {
    let x = -b / a;
    pasos += `<div><strong>Paso 2: Caso Único ($c = 0$):</strong></div>`;
    pasos += `<div>Cuando el término independiente es cero, la ecuación se reduce a una única ecuación lineal:</div>`;
    pasos += `<div>$$${a}x + (${b}) = 0 \\implies ${a}x = ${-b}$$</div>`;
    pasos += `<div class="resultado-final">$$x = \\frac{${-b}}{${a}} = ${x.toFixed(4)}$$</div>`;
  } else {
    let x1 = (c - b) / a;
    let x2 = (-c - b) / a;

    pasos += `<div><strong>Paso 2: Aplicar la Propiedad del Valor Absoluto ($c > 0$):</strong></div>`;
    pasos += `<div>Se generan dos casos lineales independientes ($$ax + b = c$$ y $$ax + b = -c$$):</div>`;
    
    pasos += `<div style="margin-top:0.5rem;"><strong>Caso 1 (Positivo):</strong> $$${a}x + (${b}) = ${c}$$</div>`;
    pasos += `<div>$$${a}x = ${c} - (${b}) \\implies ${a}x = ${(c - b).toFixed(2)}$$</div>`;
    pasos += `<div class="resultado-final">$$x_1 = \\frac{${(c - b).toFixed(2)}}{${a}} = ${x1.toFixed(4)}$$</div>`;

    pasos += `<div style="margin-top:0.5rem;"><strong>Caso 2 (Negativo):</strong> $$${a}x + (${b}) = -${c}$$</div>`;
    pasos += `<div>$$${a}x = -${c} - (${b}) \\implies ${a}x = ${(-c - b).toFixed(2)}$$</div>`;
    pasos += `<div class="resultado-final">$$x_2 = \\frac{${(-c - b).toFixed(2)}}{${a}} = ${x2.toFixed(4)}$$</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}
