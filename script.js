/* =====================================================================
   VARIABLES GLOBALES Y ESTADO DEL MOTOR GRÁFICO CON ZOOM Y PAN
   ===================================================================== */
let canvas, ctx;

const RANGO_BASE = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
let RANGO = { ...RANGO_BASE };

/* =====================================================================
   CONTROL DE NAVEGACIÓN: PORTADA / APLICACIÓN
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
  const sel = selector.value;

  document.querySelectorAll('.panel-contenido').forEach(p => p.classList.add('oculto'));

  const mapa = {
    lineal: 'panel-lineal',
    fraccionaria: 'panel-fraccionaria',
    cuadratica: 'panel-cuadratica',
    sistema: 'panel-sistema',
    absoluto: 'panel-absoluto',
    polinomica: 'panel-polinomica',
    cuartica: 'panel-cuartica',
    quintica: 'panel-quintica',
    sextica: 'panel-sextica',
  };

  if (mapa[sel]) {
    const panelActivo = document.getElementById(mapa[sel]);
    if (panelActivo) panelActivo.classList.remove('oculto');
  }

  actualizarLeyenda(sel);

  funcionResolverPendiente = null;
  const res = document.getElementById('resultado');
  if (res) {
    res.innerHTML = 'Seleccione una ecuación y presione <strong>Resolver</strong> para iniciar tu intento personal; luego podrás comparar tu respuesta con el desarrollo paso a paso.';
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
   MOTOR GRÁFICO (CANVAS API)
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

  const tamFlecha = 8;
  ctx.fillStyle = '#64748b';

  ctx.beginPath(); ctx.moveTo(ancho, centroY); ctx.lineTo(ancho - tamFlecha, centroY - tamFlecha / 2); ctx.lineTo(ancho - tamFlecha, centroY + tamFlecha / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, centroY); ctx.lineTo(tamFlecha, centroY - tamFlecha / 2); ctx.lineTo(tamFlecha, centroY + tamFlecha / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(centroX, 0); ctx.lineTo(centroX - tamFlecha / 2, tamFlecha); ctx.lineTo(centroX + tamFlecha / 2, tamFlecha); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(centroX, alto); ctx.lineTo(centroX - tamFlecha / 2, alto - tamFlecha); ctx.lineTo(centroX + tamFlecha / 2, alto - tamFlecha); ctx.closePath(); ctx.fill();

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

  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('x', ancho - 14, centroY - 15);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('-x', 14, centroY - 15);
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('y', centroX + 12, 12);
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('-y', centroX + 12, alto - 12);
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
    ctx.beginPath(); ctx.moveTo(xAsin, 0); ctx.lineTo(xAsin, alto); ctx.stroke();
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
    graficarFuncion((x) => (a / (x + b)) + c, '#ef4444', -b);
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
    graficarFuncion((x) => a * Math.pow(x, 6) + b * Math.pow(x, 5) + c * Math.pow(x, 4) + d * Math.pow(x, 3) + e * Math.pow(x, 2) + f * x + g, '#ef4444');
  }

  // ✨ MEJORA: Pintar de color distinto cada solución de x observada en la gráfica
  renderizarSolucionesEnCanvas(sel);
}

/* =====================================================================
   PROCESO PREVIO Y VERIFICACIÓN
   ===================================================================== */
let funcionResolverPendiente = null;
let tipoEcuacionPendiente = null;

function iniciarResolucion(funcionResolver, tipoEcuacion) {
  funcionResolverPendiente = funcionResolver;
  tipoEcuacionPendiente = tipoEcuacion || null;
  const res = document.getElementById('resultado');
  if (!res) return;

  res.innerHTML = `<div class="intento-estudiante">
      <span class="etiqueta-formula">🧠 Antes de ver la solución: resuélvela tú mismo/a</span>
      <p>Con los coeficientes que registraste en el Laboratorio Virtual, calcula la solución en tu cuaderno. Luego anota <strong>solo el valor final</strong> de la incógnita abajo (ej: x = 2). El procedimiento es opcional y no se usa para calificar.</p>
      <label for="campo-respuesta-estudiante" class="etiqueta-formula" style="margin-top:0.6rem;">Tu respuesta final:</label>
      <input type="text" id="campo-respuesta-estudiante" class="textarea-intento campo-respuesta" placeholder="Ejemplo: x = 2" autocomplete="off">
      <label for="campo-procedimiento-estudiante" class="etiqueta-formula" style="margin-top:0.6rem;">Procedimiento (opcional, no se evalúa):</label>
      <textarea id="campo-procedimiento-estudiante" class="textarea-intento" rows="4" placeholder="Ejemplo: Primero transpuse el término independiente y luego..." autocomplete="off"></textarea>
      <button type="button" class="btn-resolver" onclick="revelarSolucion()">✅ Ya resolví: Ver Desarrollo y Respuesta</button>
    </div>`;

  const campo = document.getElementById('campo-respuesta-estudiante');
  if (campo) campo.focus();
}

function revelarSolucion() {
  if (typeof funcionResolverPendiente !== 'function') return;

  const campoRespuesta = document.getElementById('campo-respuesta-estudiante');
  const campoProcedimiento = document.getElementById('campo-procedimiento-estudiante');
  const intento = campoRespuesta ? campoRespuesta.value.trim() : '';
  const procedimiento = campoProcedimiento ? campoProcedimiento.value.trim() : '';

  if (!intento) {
    const continuar = window.confirm('Aún no escribiste tu respuesta final. ¿Deseas ver el desarrollo y la respuesta de todos modos?');
    if (!continuar) {
      if (campoRespuesta) campoRespuesta.focus();
      return;
    }
  }

  const funcion = funcionResolverPendiente;
  const tipo = tipoEcuacionPendiente;
  funcionResolverPendiente = null;
  tipoEcuacionPendiente = null;
  funcion();

  const res = document.getElementById('resultado');

  if ((intento || procedimiento) && res) {
    const textoMostrado = [intento, procedimiento].filter(Boolean).join('\n');
    const bloqueIntento = `<div class="intento-registrado">
        <span class="etiqueta-formula">🧑‍🎓 Tu intento previo:</span>
        <div class="intento-texto">${escaparHTML(textoMostrado)}</div>
      </div>`;
    res.insertAdjacentHTML('afterbegin', bloqueIntento);

    if (intento) {
      const cajaVerificacion = verificarIntentoEstudiante(intento, res, tipo);
      if (cajaVerificacion) {
        res.insertAdjacentHTML('afterbegin', cajaVerificacion);
      }
    }
  }

  renderizarMatematicasGlobal();
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function evaluarExpresionSimple(str) {
  if (!str) return null;
  let limpia = str.trim().replace(',', '.');
  const fracMatch = limpia.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den !== 0) return num / den;
  }
  const val = parseFloat(limpia);
  return isNaN(val) ? null : val;
}

function extraerNumerosDeResultado(texto) {
  if (!texto) return [];
  const numeros = [];
  const regexIgualdad = /=\s*(-?\d+(?:\.\d+)?)/g;
  let coincidencia;
  while ((coincidencia = regexIgualdad.exec(texto)) !== null) {
    numeros.push(parseFloat(coincidencia[1]));
  }
  const regexImaginaria = /([+-]\s*\d+(?:\.\d+)?)\s*i\b/g;
  while ((coincidencia = regexImaginaria.exec(texto)) !== null) {
    numeros.push(parseFloat(coincidencia[1].replace(/\s+/g, '')));
  }
  return numeros;
}

function extraerNumerosDelIntento(texto) {
  if (!texto) return [];
  const regexAsignacion = /(?:^|[^0-9a-zA-Z_])([a-zA-Z_]\w*)\s*=\s*(-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?)/g;
  const explicitos = [];
  let coincidencia;
  
  while ((coincidencia = regexAsignacion.exec(texto)) !== null) {
    const val = evaluarExpresionSimple(coincidencia[2]);
    if (val !== null && !isNaN(val)) explicitos.push(val);
  }

  let valores = explicitos.length > 0 ? explicitos : (texto.match(/-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?/g) || [])
    .map(n => evaluarExpresionSimple(n))
    .filter(n => n !== null && !isNaN(n));

  const unicos = [];
  valores.forEach(v => {
    if (!unicos.some(u => Math.abs(u - v) < 1e-4)) unicos.push(v);
  });
  return unicos;
}

function indicaSinSolucion(texto) {
  if (!texto) return false;
  return /(sin soluci|no tiene soluci|no hay soluci|conjunto vac|no existe soluci|∅|vac[ií]o)/.test(texto.toLowerCase());
}

function numerosCoinciden(a, b) {
  return Math.abs(a - b) <= 0.05 || Math.abs(a - b) <= Math.abs(b) * 0.01;
}

const PALABRAS_NUMERO_ES = {
  'cero': 0, 'ninguna': 0, 'ningún': 0, 'ninguno': 0,
  'una': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6
};

function contarSolucionesCorrectas(textoCorrecto) {
  if (/\\emptyset|∅|no tiene soluci[oó]n v[aá]lida|carece de soluci[oó]n/i.test(textoCorrecto)) return 0;
  if (/\bx\s*=/.test(textoCorrecto) && /\by\s*=/.test(textoCorrecto) && !/x_/.test(textoCorrecto)) return 1;
  const coincidencia = textoCorrecto.match(/\bx(_\{?\d+\}?)?\s*=/g);
  return coincidencia ? coincidencia.length : 0;
}

function extraerCantidadDeclaradaPorEstudiante(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();
  if (indicaSinSolucion(t)) return 0;
  const cDigito = t.match(/(\d+)\s*(soluci[oó]n(?:es)?|ra[ií]z|ra[ií]ces)/);
  if (cDigito) return parseInt(cDigito[1], 10);
  const cPalabra = t.match(/\b(cero|ninguna|ningún|ninguno|una|uno|dos|tres|cuatro|cinco|seis)\b\s*(soluci[oó]n(?:es)?|ra[ií]z|ra[ií]ces)/);
  if (cPalabra && cPalabra[1] in PALABRAS_NUMERO_ES) return PALABRAS_NUMERO_ES[cPalabra[1]];
  const numeros = extraerNumerosDelIntento(texto);
  return numeros.length === 0 ? null : numeros.length;
}

function verificarCantidadSoluciones(intento, cantidadCorrecta) {
  const cantidadEstudiante = extraerCantidadDeclaradaPorEstudiante(intento);
  const etiqueta = n => (n === 1 ? '1 solución' : `${n} soluciones`);

  if (cantidadEstudiante === null) {
    return construirCajaVerificacion('info', 'No se pudo determinar cuántas soluciones planteaste.', `Esta ecuación tiene ${etiqueta(cantidadCorrecta)}.`);
  }
  if (cantidadEstudiante === cantidadCorrecta) {
    return construirCajaVerificacion('correcta', `Cantidad de soluciones correcta: identificaste ${etiqueta(cantidadCorrecta)}.`, null);
  }
  return construirCajaVerificacion('incorrecta', 'La cantidad de soluciones que planteaste no es correcta.', `Tu respuesta sugiere ${etiqueta(cantidadEstudiante)}, pero esta ecuación tiene en realidad ${etiqueta(cantidadCorrecta)}.`);
}

function construirCajaVerificacion(tipo, titulo, detalle) {
  const config = {
    correcta: { icono: '✅', clase: 'verificacion-correcta' },
    parcial: { icono: '🟡', clase: 'verificacion-parcial' },
    incorrecta: { icono: '❌', clase: 'verificacion-incorrecta' },
    info: { icono: 'ℹ️', clase: 'verificacion-info' }
  };
  const c = config[tipo] || config.info;
  return `<div class="verificacion-caja ${c.clase}">
      <span class="verificacion-icono" aria-hidden="true">${c.icono}</span>
      <span class="verificacion-texto">
        <span class="verificacion-titulo">${escaparHTML(titulo)}</span>
        ${detalle ? `<span class="verificacion-detalle">${escaparHTML(detalle)}</span>` : ''}
      </span>
    </div>`;
}

function verificarIntentoEstudiante(intento, contenedorResultado, tipoEcuacion) {
  if (!contenedorResultado) return '';
  const nodosFinales = contenedorResultado.querySelectorAll('.resultado-final');
  if (nodosFinales.length === 0) return '';

  let textoCorrecto = '';
  nodosFinales.forEach(nodo => { textoCorrecto += ' ' + nodo.textContent; });

  const cantidadCorrecta = contarSolucionesCorrectas(textoCorrecto);

  const numerosCorrectos = extraerNumerosDeResultado(textoCorrecto);
  const numerosEstudiante = extraerNumerosDelIntento(intento);
  let cajaValores = '';
  let prop = 0;
  let correctosUnicos = [];

  if (numerosEstudiante.length === 0) {
    cajaValores = construirCajaVerificacion('info', 'No se detectó un valor numérico en tu respuesta.', 'Recuerda anotar el valor de la incógnita, por ejemplo: x = 3.');
  } else if (numerosCorrectos.length > 0) {
    correctosUnicos = [...new Set(numerosCorrectos.map(n => Math.round(n * 1000) / 1000))];
    const usados = new Set();
    let encontrados = 0;

    correctosUnicos.forEach(valorCorrecto => {
      const idx = numerosEstudiante.findIndex((v, i) => !usados.has(i) && numerosCoinciden(v, valorCorrecto));
      if (idx !== -1) { encontrados++; usados.add(idx); }
    });

    prop = encontrados / correctosUnicos.length;
    if (prop === 1) {
      cajaValores = construirCajaVerificacion('correcta', '¡Excelente! El valor de tu respuesta es correcto.', 'Coincide con la solución calculada.');
    } else if (prop > 0) {
      cajaValores = construirCajaVerificacion('parcial', 'El valor de tu respuesta es parcialmente correcto.', `Identificaste ${encontrados} de ${correctosUnicos.length} solución(es).`);
    } else {
      cajaValores = construirCajaVerificacion('incorrecta', 'El valor de tu respuesta no coincide con la solución correcta.', 'Revisa el desarrollo detallado a continuación.');
    }
  }

  let cajaCantidad = '';
  if (prop === 1 && numerosEstudiante.length >= correctosUnicos.length) {
    cajaCantidad = construirCajaVerificacion('correcta', 'Cantidad de soluciones correcta: identificaste las soluciones requeridas.', null);
  } else if (prop > 0) {
    cajaCantidad = construirCajaVerificacion('parcial', `Cantidad de soluciones parcial: encontraste ${numerosEstudiante.length} valor(es) correcto(s) de un total de ${correctosUnicos.length} solución(es).`, null);
  } else {
    cajaCantidad = verificarCantidadSoluciones(intento, cantidadCorrecta);
  }

  const cajaSustitucion = verificarPorSustitucion(intento, tipoEcuacion);
  return cajaCantidad + cajaValores + cajaSustitucion;
}

function obtenerCoeficientesPorTipo(tipoEcuacion) {
  const num = id => {
    const el = document.getElementById(id);
    return el ? (parseFloat(el.value) || 0) : 0;
  };
  switch (tipoEcuacion) {
    case 'lineal': return { a: num('lin-a'), b: num('lin-b') };
    case 'fraccionaria': return { a: num('frac-a'), b: num('frac-b'), c: num('frac-c') };
    case 'cuadratica': return { a: num('coef-a'), b: num('coef-b'), c: num('coef-c') };
    case 'sistema': return { a1: num('sys-a1'), b1: num('sys-b1'), c1: num('sys-c1'), a2: num('sys-a2'), b2: num('sys-b2'), c2: num('sys-c2') };
    case 'absoluto': return { a: num('abs-a'), b: num('abs-b'), c: num('abs-c') };
    case 'cubica': return { a: num('poly-a'), b: num('poly-b'), c: num('poly-c'), d: num('poly-d') };
    case 'cuartica': return { a: num('quart-a'), b: num('quart-b'), c: num('quart-c'), d: num('quart-d'), e: num('quart-e') };
    case 'quintica': return { a: num('quint-a'), b: num('quint-b'), c: num('quint-c'), d: num('quint-d'), e: num('quint-e'), f: num('quint-f') };
    case 'sextica': return { a: num('sext-a'), b: num('sext-b'), c: num('sext-c'), d: num('sext-d'), e: num('sext-e'), f: num('sext-f'), g: num('sext-g') };
    default: return null;
  }
}

function evaluarResiduoEcuacion(tipoEcuacion, coef, x) {
  switch (tipoEcuacion) {
    case 'lineal': return coef.a * x + coef.b;
    case 'fraccionaria': return Math.abs(x + coef.b) < 1e-6 ? null : coef.a / (x + coef.b) + coef.c;
    case 'cuadratica': return coef.a * x * x + coef.b * x + coef.c;
    case 'absoluto': return Math.abs(coef.a * x + coef.b) - coef.c;
    case 'cubica': return coef.a * Math.pow(x, 3) + coef.b * Math.pow(x, 2) + coef.c * x + coef.d;
    case 'cuartica': return coef.a * Math.pow(x, 4) + coef.b * Math.pow(x, 3) + coef.c * Math.pow(x, 2) + coef.d * x + coef.e;
    case 'quintica': return coef.a * Math.pow(x, 5) + coef.b * Math.pow(x, 4) + coef.c * Math.pow(x, 3) + coef.d * Math.pow(x, 2) + coef.e * x + coef.f;
    case 'sextica': return coef.a * Math.pow(x, 6) + coef.b * Math.pow(x, 5) + coef.c * Math.pow(x, 4) + coef.d * Math.pow(x, 3) + coef.e * Math.pow(x, 2) + coef.f * x + coef.g;
    default: return null;
  }
}

function toleranciaResiduo(coef) {
  const suma = Object.values(coef).reduce((acc, v) => acc + Math.abs(v || 0), 0);
  return Math.max(0.5, suma * 0.05);
}

function verificarSustitucionUnaIncognita(intento, tipoEcuacion, coef) {
  const numeros = extraerNumerosDelIntento(intento);
  if (numeros.length === 0) return '';
  if (tipoEcuacion === 'cuadratica' && (coef.b * coef.b - 4 * coef.a * coef.c) < 0) {
    return "";
  }
  const tol = toleranciaResiduo(coef);
  const evals = numeros.map(x => ({ x, res: evaluarResiduoEcuacion(tipoEcuacion, coef, x) }));
  const evaluables = evals.filter(e => e.res !== null);
  if (evaluables.length === 0) return '';
  const satisfacen = evaluables.filter(e => Math.abs(e.res) <= tol);

  if (satisfacen.length === evaluables.length) {
    return construirCajaVerificacion('correcta', 'Verificación por sustitución: tu respuesta satisface la ecuación original.', 'El resultado al sustituir es aproximadamente cero.');
  } else if (satisfacen.length > 0) {
    return construirCajaVerificacion('parcial', 'Verificación por sustitución: solo parte de tu respuesta satisface la ecuación.', `${satisfacen.length} de ${evaluables.length} reducen a cero.`);
  }
  return construirCajaVerificacion('incorrecta', 'Verificación por sustitución: tu respuesta no satisface la ecuación original.', 'El resultado no se aproxima a cero.');
}

function verificarSustitucionSistema(intento, coef) {
  const cX = intento.match(/(?:^|[^0-9a-zA-Z_])x\s*=\s*(-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?)/i);
  const cY = intento.match(/(?:^|[^0-9a-zA-Z_])y\s*=\s*(-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?)/i);
  if (!cX || !cY) return '';

  const x = evaluarExpresionSimple(cX[1]);
  const y = evaluarExpresionSimple(cY[1]);
  if (x === null || y === null) return '';

  const r1 = coef.a1 * x + coef.b1 * y - coef.c1;
  const r2 = coef.a2 * x + coef.b2 * y - coef.c2;
  const tol = toleranciaResiduo(coef);
  const c1 = Math.abs(r1) <= tol, c2 = Math.abs(r2) <= tol;

  if (c1 && c2) return construirCajaVerificacion('correcta', 'Verificación por sustitución: tu punto satisface ambas ecuaciones.', `Sustitución en x = ${x}, y = ${y} correcta.`);
  if (c1 || c2) return construirCajaVerificacion('parcial', 'Verificación por sustitución: tu punto satisface solo una de las dos ecuaciones.', `Cumple en la ${c1 ? 'primera' : 'segunda'} ecuación.`);
  return construirCajaVerificacion('incorrecta', 'Verificación por sustitución: tu punto no satisface el sistema original.', 'Ninguna de las dos ecuaciones se cumple.');
}

function verificarPorSustitucion(intento, tipoEcuacion) {
  if (!intento || !tipoEcuacion) return '';
  const coef = obtenerCoeficientesPorTipo(tipoEcuacion);
  if (!coef) return '';
  return tipoEcuacion === 'sistema' ? verificarSustitucionSistema(intento, coef) : verificarSustitucionUnaIncognita(intento, tipoEcuacion, coef);
}

/* =====================================================================
   MÉTODOS DE RESOLUCIÓN PASO A PASO DETALLADOS
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error matemático: Si el coeficiente $a = 0$, la variable $x$ desaparece y no constituye una ecuación lineal válida.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let x = -b / a;
  
  let HTML = `
    <div><strong>🎯 Explicación para principiantes:</strong> Una ecuación de primer grado (lineal) tiene la forma $a x + b = 0$. El objetivo pedagógico es "despejar" la incógnita $x$ dejándola sola en el primer miembro mediante operaciones inversas.</div>
    <div><strong>Paso 1: Identificación de componentes:</strong>
      <br>• Coeficiente principal ($a$): $a = ${a}$
      <br>• Término independiente ($b$): $b = ${b}$
    </div>
    <div><strong>Paso 2: Planteamiento de la ecuación con tus datos: $${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = 0$</strong>
    </div>
    <div><strong>Paso 3: Transposición del término independiente ($b$):</strong>
      <br>Para quitar el número $(${b})$ del lado izquierdo, aplicamos la propiedad uniforme restando $(${b})$ a ambos lados de la igualdad (lo que popularmente se conoce como "pasar al otro miembro con signo cambiado"): $${a}x = ${-b}$
    </div>
    <div><strong>Paso 4: Aislamiento de la incógnita $x$ (División por el coeficiente $a$):</strong>
      <br>Dado que $a = ${a}$ está multiplicando a $x$, pasa al segundo miembro a dividir a ${-b} conservando su signo: $x = \\frac{${-b}}{${a}}$
    </div>
    <div><strong>Paso 5: Cálculo aritmético final:</strong>
      <br>Realizamos la división numérica: x = ${x.toFixed(4)}
    </div>
    <div><strong>Paso 6: Comprobación de la solución:</strong>
      <br>Sustituimos $x = ${x.toFixed(4)}$ en la ecuación original $a x + b = 0$: $${a}(${x.toFixed(4)}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${(a * x + b).toFixed(4)} \\approx 0 \\quad \\text{(¡Verificación exitosa!)}$
    </div>
    <div class="resultado-final">Solución única despejada: $x = ${x.toFixed(4)}$</div>
  `;

  res.innerHTML = HTML;
  renderizarMatematicasGlobal();
}

function resolverFraccionaria() {
  const a = parseFloat(document.getElementById('frac-a').value) || 0;
  const b = parseFloat(document.getElementById('frac-b').value) || 0;
  const c = parseFloat(document.getElementById('frac-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El numerador $a$ no puede ser cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let restriccion = -b;
  let pasos = `<div><strong>🎯 Explicación para principiantes:</strong> Una ecuación fraccionaria es aquella donde la incógnita aparece en el denominador: $\\frac{a}{x + b} + c = 0$. Su resolución requiere primero restringir el dominio para impedir divisiones entre cero.</div>`;

  if (c === 0) {
    pasos += `<div><strong>Paso 1: Identificación de la restricción de dominio:</strong>
      <br>El denominador $x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} \\neq 0 \\implies x \\neq ${restriccion}$.
    </div>
    <div><strong>Paso 2: Análisis de la expresión:</strong>
      <br>La ecuación dada es $\\frac{${a}}{x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}} = 0$.
      <br>Una fracción es igual a cero únicamente si su numerador es cero. Como el numerador es $a = ${a} \\neq 0$, esta igualdad es imposible.
    </div>
    <div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución Vacío: $\\mathcal{S} = \\emptyset$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let numPaso2 = -a / c;
  let x = numPaso2 - b;

  pasos += `
    <div><strong>Paso 1: Restricción del Dominio (Asíntota Vertical):</strong>
      <br>El denominador no puede ser cero porque la división para cero no está definida en matemáticas: $x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} \\neq 0 \\implies x \\neq ${restriccion}$
      <br><em>Definición:</em> Si el cálculo final diera $x = ${restriccion}$, no habría solución válida.
    </div>
    <div><strong>Paso 2: Transposición del término independiente $c$:</strong>
      <br>Escribimos la ecuación y pasamos el término $c = ${c}$ con signo cambiado al miembro derecho: $\\frac{${a}}{x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}} = ${-c}$
    </div>
    <div><strong>Paso 3: Multiplicación por el denominador para despejar la fracción:</strong>
      <br>Multiplicamos ambos lados de la ecuación por el binomio $(x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)})$: $${a} = ${-c} \\cdot (x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)})$
    </div>
    <div><strong>Paso 4: Despeje del binomio $(x + b)$:</strong>
      <br>Pasamos el término ${-c} a dividir al lado izquierdo:
      <br>$x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = \\frac{${a}}{${-c}}$
      <br>$x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${numPaso2.toFixed(4)}$
    </div>
    <div><strong>Paso 5: Aislamiento final de $x$:</strong>
      <br>Pasamos $(${b})$ con signo cambiado al otro lado de la ecuación: $x = ${numPaso2.toFixed(4)} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)}$
      <br>$x = ${x.toFixed(4)}$
    </div>
    <div><strong>Paso 6: Verificación de la restricción:</strong>
      <br>Comprobamos si $x = ${x.toFixed(4)}$ coincide con la restricción $x \\neq ${restriccion}$. Como no coincide, el valor encontrado es una solución completamente válida.
    </div>
    <div class="resultado-final">Solución válida: $x = ${x.toFixed(4)}$</div>
  `;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function calcularEcuacion() {
  const a = parseFloat(document.getElementById('coef-a').value) || 0;
  const b = parseFloat(document.getElementById('coef-b').value) || 0;
  const c = parseFloat(document.getElementById('coef-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente $a$ no puede ser cero en una ecuación cuadrática.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let discriminante = (b * b) - (4 * a * c);
  let dosA = 2 * a;
  let menosB = -b;
  let h = -b / (2 * a);
  let k = a * h * h + b * h + c;

  let pasos = `
    <div><strong>🎯 Explicación para principiantes:</strong> Una ecuación de segundo grado tiene la forma $a x^2 + b x + c = 0$. Se resuelve mediante la Fórmula General (Fórmula de Bhaskara): $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$</div>
    <div><strong>Paso 1: Identificación de coeficientes:</strong>
      <br>• Coeficiente cuadrático ($a$): $a = ${a}$
      <br>• Coeficiente lineal ($b$): $b = ${b}$
      <br>• Término independiente ($c$): $c = ${c}$
    </div>
    <div><strong>Paso 2: Cálculo explícito del Discriminante ($\Delta = b^2 - 4ac$):</strong>
      <br>El discriminante determina la naturaleza de las raíces: $\\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${discriminante.toFixed(4)}$
    </div>
  `;

  if (discriminante > 0) {
    let raizDisc = Math.sqrt(discriminante);
    let x1 = (menosB + raizDisc) / dosA;
    let x2 = (menosB - raizDisc) / dosA;

    pasos += `
      <div><strong>Análisis del Discriminante:</strong>
        <br>Puesto que $\\Delta = ${discriminante.toFixed(4)} > 0$, la raíz cuadrada $\\sqrt{${discriminante.toFixed(4)}} = ${raizDisc.toFixed(4)}$ es un número real positivo. Por tanto, existen <strong>dos soluciones reales distintas</strong>.
      </div>
      <div><strong>Paso 3: Sustitución de valores en la Fórmula General:</strong>
        <br>$x = \\frac{-(${b}) \\pm \\sqrt{${discriminante.toFixed(4)}}}{2(${a})} = \\frac{${menosB} \\pm ${raizDisc.toFixed(4)}}{${dosA}}$
      </div>
      <div><strong>Paso 4: Cálculo de la primera raíz ($x_1$, usando el signo $+$):</strong>
        <br>$x_1 = \\frac{${menosB} + ${raizDisc.toFixed(4)}}{${dosA}} = \\frac{${(menosB + raizDisc).toFixed(4)}}{${dosA}} = ${x1.toFixed(4)}$
      </div>
      <div><strong>Paso 5: Cálculo de la segunda raíz ($x_2$, usando el signo $-$):</strong>
        <br>$x_2 = \\frac{${menosB} - ${raizDisc.toFixed(4)}}{${dosA}} = \\frac{${(menosB - raizDisc).toFixed(4)}}{${dosA}} = ${x2.toFixed(4)}$
      </div>
      <div><strong>Paso 6: Análisis Geométrico de la Parábola $f(x) = ax^2 + bx + c$:</strong>
        <br>• <strong>Coordenadas del Vértice $V(h, k)$:</strong>
          <br>&nbsp;&nbsp;– <em>Abscisa ($h$):</em> $h = -\\frac{b}{2a} = -\\frac{${b}}{2(${a})} = \\frac{${menosB}}{${dosA}} = ${h.toFixed(4)}$
          <br>&nbsp;&nbsp;– <em>Ordenada ($k$):</em> $k = f(${h.toFixed(4)}) = ${a}(${h.toFixed(4)})^2 ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}(${h.toFixed(4)}) ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = ${k.toFixed(4)}$
          <br>&nbsp;&nbsp;– <em>Punto Vértice:</em> $V(${h.toFixed(4)}, ${k.toFixed(4)})$
        <br>• <strong>Eje de Simetría:</strong> Recta vertical $x = ${h.toFixed(4)}$
        <br>• <strong>Concavidad y Extremo:</strong> Como $a = ${a} ${a > 0 ? '> 0$' : '< 0$'}, la parábola es ${a > 0 ? 'cóncava hacia arriba ( $\\cup$ ) y el vértice es un punto <strong>Mínimo absoluto</strong>.' : 'cóncava hacia abajo ( $\\cap$ ) y el vértice es un punto <strong>Máximo absoluto</strong>.'}
        <br>• <strong>Intersección con el eje $Y$ (Ordenada al origen):</strong> $f(0) = c = ${c} \\implies (0, ${c})$
        <br>• <strong>Intersecciones con el eje $X$ (Raíces):</strong> Puntos $(${x1.toFixed(4)}, 0)$ y $(${x2.toFixed(4)}, 0)$
        <br>• <strong>Dominio y Rango:</strong>
          <br>&nbsp;&nbsp;– <em>Dominio:</em> $\\text{Dom}(f) = \\mathbb{R} = (-\\infty, +\\infty)$
          <br>&nbsp;&nbsp;– <em>Rango:</em> $\\text{Ran}(f) = ${a > 0 ? `[${k.toFixed(4)}, +\\infty)` : `(-\\infty, ${k.toFixed(4)}]`}\$
      </div>
      <div class="resultado-final">Dos soluciones reales distintas: $x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$</div>
    `;
  } else if (discriminante === 0) {
    let x = menosB / dosA;

    pasos += `
      <div><strong>Análisis del Discriminante:</strong>
        <br>Puesto que $\\Delta = 0$, la raíz cuadrada $\\sqrt{0} = 0$, resultando en <strong>una única solución real (raíz doble)</strong>.
      </div>
      <div><strong>Paso 3: Sustitución en la Fórmula General:</strong>
        <br>$$x = \\frac{-(${b}) \\pm 0}{2(${a})} = \\frac{${menosB}}{${dosA}} = ${x.toFixed(4)}$$
      </div>
      <div><strong>Paso 4: Análisis Geométrico de la Parábola $f(x) = ax^2 + bx + c$:</strong>
        <br>• <strong>Coordenadas del Vértice $V(h, k)$:</strong>
          <br>&nbsp;&nbsp;– <em>Abscisa ($h$):</em> $h = -\\frac{b}{2a} = ${h.toFixed(4)}$
          <br>&nbsp;&nbsp;– <em>Ordenada ($k$):</em> $k = f(${h.toFixed(4)}) = 0.0000 \\implies V(${h.toFixed(4)}, 0.0000)$
        <br>• <strong>Eje de Simetría:</strong> Recta vertical $x = ${h.toFixed(4)}$
        <br>• <strong>Concavidad y Extremo:</strong> Como $a = ${a} ${a > 0 ? '> 0$' : '< 0$'}, la parábola es ${a > 0 ? 'cóncava hacia arriba ( $\\cup$ ) y el vértice es un punto <strong>Mínimo absoluto</strong>.' : 'cóncava hacia abajo ( $\\cap$ ) y el vértice es un punto <strong>Máximo absoluto</strong>.'}
        <br>• <strong>Intersección con el eje $Y$:</strong> $f(0) = c = ${c} \\implies (0, ${c})$
        <br>• <strong>Intersección con el eje $X$:</strong> La parábola es tangente al eje horizontal en $(${x.toFixed(4)}, 0)$
        <br>• <strong>Dominio y Rango:</strong>
          <br>&nbsp;&nbsp;– <em>Dominio:</em> $\\text{Dom}(f) = \\mathbb{R} = (-\\infty, +\\infty)$
          <br>&nbsp;&nbsp;– <em>Rango:</em> $\\text{Ran}(f) = ${a > 0 ? `[0.0000, +\\infty)` : `(-\\infty, 0.0000]`}\$
      </div>
      <div class="resultado-final">Solución real única (raíz doble): $x = ${x.toFixed(4)}$</div>
    `;
  } else {
    let raizDisc = Math.sqrt(-discriminante);
    let parteReal = menosB / dosA;
    let parteImaginaria = raizDisc / dosA;

    pasos += `
      <div><strong>Análisis del Discriminante:</strong>
        <br>Puesto que $\\Delta = ${discriminante.toFixed(4)} < 0$, la solución no pertenece a los números reales. La ecuación tiene <strong>dos soluciones complejas conjugadas</strong> empleando $i = \\sqrt{-1}$.
      </div>
      <div><strong>Paso 3: Descomposición en parte real e imaginaria:</strong>
        <br>$$\\sqrt{\\Delta} = \\sqrt{${discriminante.toFixed(4)}} = \\sqrt{${-discriminante.toFixed(4)}} \\cdot i = ${raizDisc.toFixed(4)}i$$
        <br>$$\\text{Parte Real: } \\frac{-b}{2a} = \\frac{${menosB}}{${dosA}} = ${parteReal.toFixed(4)}$$
        <br>$$\\text{Parte Imaginaria: } \\frac{\\sqrt{|\\Delta|}}{2a} = \\frac{${raizDisc.toFixed(4)}}{${dosA}} = ${parteImaginaria.toFixed(4)}$$
      </div>
      <div><strong>Paso 4: Soluciones complejas resultantes:</strong>
        <br>$$x_1 = ${parteReal.toFixed(4)} + ${parteImaginaria.toFixed(4)}i$$
        <br>$$x_2 = ${parteReal.toFixed(4)} - ${parteImaginaria.toFixed(4)}i$$
      </div>
      <div><strong>Paso 5: Análisis Geométrico de la Parábola $f(x) = ax^2 + bx + c$:</strong>
        <br>• <strong>Coordenadas del Vértice $V(h, k)$:</strong>
          <br>&nbsp;&nbsp;– <em>Abscisa ($h$):</em> $h = -\\frac{b}{2a} = ${h.toFixed(4)}$
          <br>&nbsp;&nbsp;– <em>Ordenada ($k$):</em> $k = f(${h.toFixed(4)}) = ${k.toFixed(4)} \\implies V(${h.toFixed(4)}, ${k.toFixed(4)})$
        <br>• <strong>Eje de Simetría:</strong> Recta vertical $x = ${h.toFixed(4)}$
        <br>• <strong>Concavidad y Extremo:</strong> Como $a = ${a} ${a > 0 ? '> 0$' : '< 0$'}, la parábola es ${a > 0 ? 'cóncava hacia arriba ( $\\cup$ ) y el vértice es un punto <strong>Mínimo absoluto</strong>.' : 'cóncava hacia abajo ( $\\cap$ ) y el vértice es un punto <strong>Máximo absoluto</strong>.'}
        <br>• <strong>Intersección con el eje $Y$:</strong> $f(0) = c = ${c} \\implies (0, ${c})$
        <br>• <strong>Intersección con el eje $X$:</strong> No tiene intersecciones reales con el eje $X$.
        <br>• <strong>Dominio y Rango:</strong>
          <br>&nbsp;&nbsp;– <em>Dominio:</em> $\\text{Dom}(f) = \\mathbb{R} = (-\\infty, +\\infty)$
          <br>&nbsp;&nbsp;– <em>Rango:</em> $\\text{Ran}(f) = ${a > 0 ? `[${k.toFixed(4)}, +\\infty)` : `(-\\infty, ${k.toFixed(4)}]`}\$
      </div>
      <div class="resultado-final">Dos soluciones complejas conjugadas: $x_1 = ${parteReal.toFixed(4)} + ${parteImaginaria.toFixed(4)}i, \\quad x_2 = ${parteReal.toFixed(4)} - ${parteImaginaria.toFixed(4)}i$</div>
    `;
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

  let D = a1 * b2 - a2 * b1;
  let Dx = c1 * b2 - c2 * b1;
  let Dy = a1 * c2 - a2 * c1;

  let pasos = `
    <div><strong>🎯 Explicación para principiantes:</strong> Un sistema de $2 \\times 2$ está formado por dos ecuaciones lineales con dos incógnitas ($x$ e $y$). Resolverlo significa encontrar el punto de intersección $(x, y)$ en el plano. Usamos la <strong>Regla de Cramer</strong> mediante determinantes.
      <br><em>Fórmula del determinante $2 \\times 2$:</em> $\\begin{vmatrix} p & q \\\\ r & s \\end{vmatrix} = (p \\cdot s) - (q \\cdot r)$.
    </div>
    <div><strong>Paso 1: Formulación del sistema con tus valores:</strong>
      <br>$\\begin{cases} (${a1})x + (${b1})y = ${c1} \\\\ (${a2})x + (${b2})y = ${c2} \\end{cases}$
    </div>
    <div><strong>Paso 2: Cálculo del Determinante Principal ($D$):</strong>
      <br>Formado por los coeficientes de las incógnitas:
      <br>$$D = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1} \\cdot ${b2}) - (${b1} \\cdot ${a2}) = ${a1 * b2} - (${b1 * a2}) = ${D}$$
    </div>
  `;

  if (Math.abs(D) > 1e-6) {
    let x = Dx / D;
    let y = Dy / D;

    pasos += `
      <div><strong>Paso 3: Cálculo del Determinante Auxiliar $D_x$:</strong>
        <br>Reemplazamos la columna de $x$ por los términos independientes ($c_1, c_2$):
        <br>$$D_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = (${c1} \\cdot ${b2}) - (${b1} \\cdot ${c2}) = ${c1 * b2} - (${b1 * c2}) = ${Dx}$$
      </div>
      <div><strong>Paso 4: Cálculo del Determinante Auxiliar $D_y$:</strong>
        <br>Reemplazamos la columna de $y$ por los términos independientes ($c_1, c_2$):
        <br>$$D_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = (${a1} \\cdot ${c2}) - (${c1} \\cdot ${a2}) = ${a1 * c2} - (${c1 * a2}) = ${Dy}$$
      </div>
      <div><strong>Paso 5: Obtención de las soluciones por cociente:</strong>
        <br>$x = \\frac{D_x}{D} = \\frac{${Dx}}{${D}} = ${x.toFixed(4)}$
        <br>$y = \\frac{D_y}{D} = \\frac{${Dy}}{${D}} = ${y.toFixed(4)}$
      </div>
      <div><strong>Paso 6: Interpretación geométrica:</strong>
        <br>Las dos rectas se cruzan exactamente en las coordenadas $(x, y) = (${x.toFixed(4)}, ${y.toFixed(4)})$.
      </div>
      <div class="resultado-final">Solución única: $x = ${x.toFixed(4)}, \\quad y = ${y.toFixed(4)}$</div>
    `;
  } else {
    pasos += `
      <div><strong>Análisis de la condición $D = 0$:</strong>
        <br>Como el determinante principal es cero ($D = 0$), las pendientes de las rectas son iguales.
        <br>• Las dos rectas son paralelas (sin solución) o coincidentes (infinitas soluciones).
      </div>
      <div class="resultado-final" style="background-color:#fffbeb; color:#92400e;">Sistema sin solución única (Paralelas o coincidentes)</div>
    `;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverAbsoluto() {
  const a = parseFloat(document.getElementById('abs-a').value) || 0;
  const b = parseFloat(document.getElementById('abs-b').value) || 0;
  const c = parseFloat(document.getElementById('abs-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente $a$ no puede ser cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let HTML = `
    <div><strong>🎯 Explicación para principiantes:</strong> Una ecuación con valor absoluto $|a x + b| = c$ representa una distancia. Puesto que una distancia no puede ser negativa, si $c < 0$, la ecuación carece de solución real.</div>
    <div><strong>Paso 1: Análisis del término externo $c$:</strong>
      <br>Término independiente externo: $c = ${c}$
    </div>
  `;

  if (c < 0) {
    HTML += `
      <div><strong>Paso 2: Evaluación de la propiedad de Positividad:</strong>
        <br>El valor absoluto de cualquier expresión real es mayor o igual a cero ($|ax + b| \\ge 0$). Como $c = ${c} < 0$, la igualdad es imposible.
      </div>
      <div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución Vacío: $\\mathcal{S} = \\emptyset$</div>
    `;
  } else {
    let x1 = (c - b) / a;
    let x2 = (-c - b) / a;

    HTML += `
      <div><strong>Paso 2: Descomposición en dos casos algebraicos ($ax + b = c$ y $ax + b = -c$):</strong>
        <br>• Caso 1 (Positivo): $${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}$
        <br>• Caso 2 (Negativo): $${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${-c}$
      </div>
      <div><strong>Paso 3: Resolución del Caso 1 ($ax + b = c$):</strong>
        <br>$$${a}x = ${c} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)} \\implies x_1 = \\frac{${c - b}}{${a}} = ${x1.toFixed(4)}$$
      </div>
      <div><strong>Paso 4: Resolución del Caso 2 ($ax + b = -c$):</strong>
        <br>$$${a}x = ${-c} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)} \\implies x_2 = \\frac{${-c - b}}{${a}} = ${x2.toFixed(4)}$$
      </div>
      <div class="resultado-final">${Math.abs(x1 - x2) < 1e-9 ? `Solución única: $x = ${x1.toFixed(4)}$` : `Dos soluciones reales: $x_1 =${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$`}</div>
    `;
  }

  res.innerHTML = HTML;
  renderizarMatematicasGlobal();
}

function evaluarPolinomio(coefs, x) {
  return coefs.reduce((acc, c, i) => acc + c * Math.pow(x, coefs.length - 1 - i), 0);
}

function buscarRaizReal(coefs) {
  if (coefs.length <= 1) return null;
  let a0 = Math.abs(coefs[coefs.length - 1]);
  let an = Math.abs(coefs[0]);
  let candidatos = [0];
  let pDivs = [1];
  if (a0 !== 0) {
    for (let i = 1; i <= Math.min(a0, 200); i++) {
      if (a0 % i === 0 || Math.abs(a0 / i - Math.round(a0 / i)) < 1e-6) pDivs.push(i);
    }
  }
  let qDivs = [1];
  for (let i = 1; i <= Math.min(an, 20); i++) {
    if (an % i === 0 || Math.abs(an / i - Math.round(an / i)) < 1e-6) qDivs.push(i);
  }
  for (let p of pDivs) {
    for (let q of qDivs) {
      candidatos.push(p / q);
      candidatos.push(-p / q);
    }
  }
  for (let k = -20; k <= 20; k++) candidatos.push(k);
  for (let r of candidatos) {
    if (Math.abs(evaluarPolinomio(coefs, r)) < 1e-5) return Math.round(r * 10000) / 10000;
  }
  return null;
}

function generarTablaRuffiniHTML(coefs, raiz) {
  let fila1 = coefs;
  let fila2 = [0];
  let fila3 = [coefs[0]];
  for (let i = 1; i < coefs.length; i++) {
    let prod = fila3[i - 1] * raiz;
    fila2.push(prod);
    fila3.push(coefs[i] + prod);
  }
  let html = '<div class="tabla-ruffini-container"><table class="tabla-ruffini">';
  html += `<tr><td class="col-raiz">${raiz}</td>`;
  fila1.forEach(c => { html += `<td>${Number(c.toFixed(4))}</td>`; });
  html += '</tr><tr><td class="col-raiz"></td>';
  fila2.forEach(p => { html += `<td>${Number(p.toFixed(4))}</td>`; });
  html += '</tr><tr><td class="col-raiz"></td>';
  fila3.forEach((v, idx) => {
    let esResiduo = (idx === fila3.length - 1);
    let cls = (esResiduo && Math.abs(v) < 1e-4) ? ' class="residuo-cero"' : '';
    html += `<td${cls}>${Number(v.toFixed(4))}</td>`;
  });
  html += '</tr></table></div>';
  return { html: html, coefsResultantes: fila3.slice(0, fila3.length - 1) };
}

function resolverPolinomioGenerico(coefs, nombreGrado) {
  const res = document.getElementById('resultado');
  if (coefs[0] === 0) {
    res.innerHTML = `<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente principal no puede ser cero.</span>`;
    renderizarMatematicasGlobal();
    return;
  }

  let grado = coefs.length - 1;
  let pasos = `
    <div><strong>🎯 Explicación para principiantes:</strong> Una ecuación polinómica de ${nombreGrado} es de grado $n = ${grado}$. El Teorema Fundamental del Álgebra afirma que tiene exactamente $${grado}$ raíces en el conjunto de los números complejos.</div>
    <div><strong>Procedimiento Metodológico Paso a Paso:</strong>
      <br>1. Identificar divisores del término independiente y coeficiente principal (Teorema de la Raíz Racional).
      <br>2. Evaluar la raíz exacta $r$ y aplicar la <strong>Regla de Ruffini (División Sintética)</strong> para factorizar y reducir el grado.
      <br>3. Al reducir al grado 2, resolver la ecuación cuadrática por la Fórmula General de Bhaskara.
    </div>
    <div><strong>Paso 1: Coeficientes del polinomio de grado $${grado}$:</strong>
      <br>Coeficiente principal $a_${grado} = ${coefs[0]}$, Término independiente $a_0 = ${coefs[coefs.length - 1]}$
    </div>
  `;

  let a0 = Math.abs(coefs[coefs.length - 1]);
  let an = Math.abs(coefs[0]);
  let pDivs = [1];
  if (a0 !== 0) {
    for (let i = 1; i <= Math.min(a0, 200); i++) {
      if (a0 % i === 0 || Math.abs(a0 / i - Math.round(a0 / i)) < 1e-6) {
        if (!pDivs.includes(i)) pDivs.push(i);
      }
    }
  }
  let qDivs = [1];
  for (let i = 1; i <= Math.min(an, 20); i++) {
    if (an % i === 0 || Math.abs(an / i - Math.round(an / i)) < 1e-6) {
      if (!qDivs.includes(i)) qDivs.push(i);
    }
  }

  pasos += `
    <div><strong>Paso 2: Candidatos a raíz racional ($\pm p/q$):</strong>
      <br>• Divisores del término independiente $a_0$: $\pm \{ ${pDivs.join(', ')} \}$
      <br>• Divisores del coeficiente principal $a_${grado}$: $\pm \{ ${qDivs.join(', ')} \}$
    </div>
  `;

  let coefsActuales = [...coefs];
  let raices = [];
  let pasoNum = 3;

  while (coefsActuales.length > 3) {
    let r = buscarRaizReal(coefsActuales);
    if (r === null) break;

    let resRuffini = generarTablaRuffiniHTML(coefsActuales, r);
    pasos += `
      <div><strong>Paso ${pasoNum}: División sintética (Ruffini) con la raíz exacta $x = ${r}$:</strong>
        <br>La última casilla muestra un residuo $0$, confirmando que $x = ${r}$ es raíz del polinomio y reduce el grado a $n = ${coefsActuales.length - 2}$.
      </div>
    `;
    pasos += resRuffini.html;
    raices.push(`x_${raices.length + 1} = ${r}`);
    coefsActuales = resRuffini.coefsResultantes;
    pasoNum++;
  }

  if (coefsActuales.length === 3) {
    let A = coefsActuales[0], B = coefsActuales[1], C = coefsActuales[2];
    let disc = B * B - 4 * A * C;
    let dosA = 2 * A;
    let menosB = -B;

    pasos += `
      <div><strong>Paso ${pasoNum}: Resolución de la Ecuación Cuadrática Reducida ($${A}x^2 ${B >= 0 ? '+ ' + B : '- ' + Math.abs(B)}x ${C >= 0 ? '+ ' + C : '- ' + Math.abs(C)} = 0$):</strong>
        <br>Fórmula General: $x = \\frac{-B \\pm \\sqrt{B^2 - 4AC}}{2A}$
        <br>• Discriminante: $\\Delta = (${B})^2 - 4(${A})(${C}) = ${disc.toFixed(4)}$
      </div>
    `;

    if (disc >= 0) {
      let raizDisc = Math.sqrt(disc);
      let r1 = (menosB + raizDisc) / dosA;
      let r2 = (menosB - raizDisc) / dosA;

      pasos += `
        <div>• Solución cuadrática $x_{${raices.length + 1}} = \\frac{${menosB} + ${raizDisc.toFixed(4)}}{${dosA}} = ${r1.toFixed(4)}$
        <br>• Solución cuadrática $x_{${raices.length + 2}} = \\frac{${menosB} - ${raizDisc.toFixed(4)}}{${dosA}} = ${r2.toFixed(4)}$
        </div>
      `;
      raices.push(`x_${raices.length + 1} = ${r1.toFixed(4)}`);
      raices.push(`x_${raices.length + 1} = ${r2.toFixed(4)}`);
    } else {
      let raizDisc = Math.sqrt(-disc);
      let pReal = menosB / dosA;
      let pImag = raizDisc / dosA;
      pasos += `
        <div>• Raíces complejas conjugadas: $x = ${pReal.toFixed(4)} \\pm ${pImag.toFixed(4)}i$
        </div>
      `;
      raices.push(`x_${raices.length + 1} = ${pReal.toFixed(4)} + ${pImag.toFixed(4)}i`);
      raices.push(`x_${raices.length + 2} = ${pReal.toFixed(4)} - ${pImag.toFixed(4)}i`);
    }
  }

  pasos += `<div class="resultado-final">Raíces obtenidas: $${raices.join(', \\quad ')}$</div>`;
  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverPolinomica() {
  resolverPolinomioGenerico([parseFloat(document.getElementById('poly-a').value)||1, parseFloat(document.getElementById('poly-b').value)||0, parseFloat(document.getElementById('poly-c').value)||0, parseFloat(document.getElementById('poly-d').value)||0], "Tercer Grado (Cúbica)");
}
function resolverCuartica() {
  resolverPolinomioGenerico([parseFloat(document.getElementById('quart-a').value)||1, parseFloat(document.getElementById('quart-b').value)||0, parseFloat(document.getElementById('quart-c').value)||0, parseFloat(document.getElementById('quart-d').value)||0, parseFloat(document.getElementById('quart-e').value)||0], "Cuarto Grado (Cuártica)");
}
function resolverQuintica() {
  resolverPolinomioGenerico([parseFloat(document.getElementById('quint-a').value)||1, parseFloat(document.getElementById('quint-b').value)||0, parseFloat(document.getElementById('quint-c').value)||0, parseFloat(document.getElementById('quint-d').value)||0, parseFloat(document.getElementById('quint-e').value)||0, parseFloat(document.getElementById('quint-f').value)||0], "Quinto Grado (Quíntica)");
}
function resolverSextica() {
  resolverPolinomioGenerico([parseFloat(document.getElementById('sext-a').value)||1, parseFloat(document.getElementById('sext-b').value)||0, parseFloat(document.getElementById('sext-c').value)||0, parseFloat(document.getElementById('sext-d').value)||0, parseFloat(document.getElementById('sext-e').value)||0, parseFloat(document.getElementById('sext-f').value)||0, parseFloat(document.getElementById('sext-g').value)||0], "Sexto Grado (Séxtica)");
}

/* =====================================================================
   NUEVO MOTOR DE RENDERIZADO DE SOLUCIONES CON COLORES DISTINTOS EN LA GRÁFICA
   ===================================================================== */
const COLORES_SOLUCIONES = [
  '#f59e0b', // Ámbar brillante (Solución 1)
  '#10b981', // Esmeralda brillante (Solución 2)
  '#8b5cf6', // Púrpura eléctrico (Solución 3)
  '#ec4899', // Rosa fucsia (Solución 4)
  '#06b6d4', // Cian brillante (Solución 5)
  '#f97316', // Naranja intenso (Solución 6)
  '#84cc16'  // Lima brillante (Solución 7)
];

function obtenerSolucionesActuales(sel) {
  let soluciones = [];
  if (sel === 'lineal') {
    let a = parseFloat(document.getElementById('lin-a').value) || 0;
    let b = parseFloat(document.getElementById('lin-b').value) || 0;
    if (a !== 0) soluciones.push(-b / a);
  } else if (sel === 'fraccionaria') {
    let a = parseFloat(document.getElementById('frac-a').value) || 0;
    let b = parseFloat(document.getElementById('frac-b').value) || 0;
    let c = parseFloat(document.getElementById('frac-c').value) || 0;
    if (a !== 0 && c !== 0) {
      let x = (-a / c) - b;
      if (Math.abs(x - (-b)) > 1e-5) soluciones.push(x);
    }
  } else if (sel === 'cuadratica') {
    let a = parseFloat(document.getElementById('coef-a').value) || 0;
    let b = parseFloat(document.getElementById('coef-b').value) || 0;
    let c = parseFloat(document.getElementById('coef-c').value) || 0;
    if (a !== 0) {
      let disc = b * b - 4 * a * c;
      if (disc >= 0) {
        let rDisc = Math.sqrt(disc);
        soluciones.push((-b + rDisc) / (2 * a));
        if (disc > 1e-9) soluciones.push((-b - rDisc) / (2 * a));
      }
    }
  } else if (sel === 'absoluto') {
    let a = parseFloat(document.getElementById('abs-a').value) || 0;
    let b = parseFloat(document.getElementById('abs-b').value) || 0;
    let c = parseFloat(document.getElementById('abs-c').value) || 0;
    if (a !== 0 && c >= 0) {
      let x1 = (c - b) / a;
      let x2 = (-c - b) / a;
      soluciones.push(x1);
      if (Math.abs(x1 - x2) > 1e-5) soluciones.push(x2);
    }
  } else if (['polinomica', 'cuartica', 'quintica', 'sextica'].includes(sel)) {
    let fn = (x) => 0;
    if (sel === 'polinomica') {
      let a = parseFloat(document.getElementById('poly-a').value)||0;
      let b = parseFloat(document.getElementById('poly-b').value)||0;
      let c = parseFloat(document.getElementById('poly-c').value)||0;
      let d = parseFloat(document.getElementById('poly-d').value)||0;
      fn = (x) => a*x*x*x + b*x*x + c*x + d;
    } else if (sel === 'cuartica') {
      let a = parseFloat(document.getElementById('quart-a').value)||0;
      let b = parseFloat(document.getElementById('quart-b').value)||0;
      let c = parseFloat(document.getElementById('quart-c').value)||0;
      let d = parseFloat(document.getElementById('quart-d').value)||0;
      let e = parseFloat(document.getElementById('quart-e').value)||0;
      fn = (x) => a*Math.pow(x,4) + b*Math.pow(x,3) + c*Math.pow(x,2) + d*x + e;
    } else if (sel === 'quintica') {
      let a = parseFloat(document.getElementById('quint-a').value)||0;
      let b = parseFloat(document.getElementById('quint-b').value)||0;
      let c = parseFloat(document.getElementById('quint-c').value)||0;
      let d = parseFloat(document.getElementById('quint-d').value)||0;
      let e = parseFloat(document.getElementById('quint-e').value)||0;
      let f = parseFloat(document.getElementById('quint-f').value)||0;
      fn = (x) => a*Math.pow(x,5) + b*Math.pow(x,4) + c*Math.pow(x,3) + d*Math.pow(x,2) + e*x + f;
    } else if (sel === 'sextica') {
      let a = parseFloat(document.getElementById('sext-a').value)||0;
      let b = parseFloat(document.getElementById('sext-b').value)||0;
      let c = parseFloat(document.getElementById('sext-c').value)||0;
      let d = parseFloat(document.getElementById('sext-d').value)||0;
      let e = parseFloat(document.getElementById('sext-e').value)||0;
      let f = parseFloat(document.getElementById('sext-f').value)||0;
      let g = parseFloat(document.getElementById('sext-g').value)||0;
      fn = (x) => a*Math.pow(x,6) + b*Math.pow(x,5) + c*Math.pow(x,4) + d*Math.pow(x,3) + e*Math.pow(x,2) + f*x + g;
    }

    let pasosScan = 800;
    let dx = (RANGO.maxX - RANGO.minX) / pasosScan;
    let prevX = RANGO.minX;
    let prevY = fn(prevX);

    for (let i = 1; i <= pasosScan; i++) {
      let currX = RANGO.minX + i * dx;
      let currY = fn(currX);
      if (isNaN(currY) || !isFinite(currY)) {
        prevX = currX;
        prevY = currY;
        continue;
      }
      if (prevY !== undefined && !isNaN(prevY) && isFinite(prevY)) {
        if (Math.abs(currY) < 1e-6) {
          if (!soluciones.some(s => Math.abs(s - currX) < 1e-2)) soluciones.push(currX);
        } else if (prevY * currY < 0) {
          let xLow = prevX, xHigh = currX;
          let root = currX;
          for (let iter = 0; iter < 15; iter++) {
            let xMid = (xLow + xHigh) / 2;
            let yMid = fn(xMid);
            if (Math.abs(yMid) < 1e-9) { root = xMid; break; }
            if (prevY * yMid < 0) { xHigh = xMid; }
            else { xLow = xMid; prevY = yMid; root = xMid; }
          }
          if (!soluciones.some(s => Math.abs(s - root) < 1e-2)) soluciones.push(root);
        }
      }
      prevX = currX;
      prevY = currY;
    }
  }

  let unicos = [];
  soluciones.forEach(s => {
    if (!unicos.some(u => Math.abs(u - s) < 1e-3)) unicos.push(s);
  });
  return unicos;
}

function obtenerPuntoSistema() {
  let a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
  let b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
  let c1 = parseFloat(document.getElementById('sys-c1').value) || 0;
  let a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
  let b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
  let c2 = parseFloat(document.getElementById('sys-c2').value) || 0;
  let D = a1 * b2 - a2 * b1;
  if (Math.abs(D) <= 1e-6) return null;
  let x = (c1 * b2 - c2 * b1) / D;
  let y = (a1 * c2 - a2 * c1) / D;
  return { x, y };
}

function renderizarSolucionesEnCanvas(sel) {
  if (!ctx || !canvas) return;
  const { ancho, alto } = obtenerDimensionesEfectivas();
  const scaleX = ancho / (RANGO.maxX - RANGO.minX);
  const scaleY = alto / (RANGO.maxY - RANGO.minY);
  const centroY = RANGO.maxY * scaleY;

  if (sel === 'sistema') {
    let pt = obtenerPuntoSistema();
    if (pt && pt.x >= RANGO.minX && pt.x <= RANGO.maxX && pt.y >= RANGO.minY && pt.y <= RANGO.maxY) {
      let px = (pt.x - RANGO.minX) * scaleX;
      let py = (RANGO.maxY - pt.y) * scaleY;

      ctx.save();
      // Halo resplandeciente
      ctx.beginPath();
      ctx.arc(px, py, 15, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fill();

      // Círculo principal
      ctx.beginPath();
      ctx.arc(px, py, 7.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Etiqueta flotante
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`Intersección (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`, px + 12, py - 6);
      ctx.restore();
    }
    return;
  }

  let sols = obtenerSolucionesActuales(sel);
  sols.forEach((xVal, idx) => {
    if (xVal >= RANGO.minX && xVal <= RANGO.maxX) {
      let px = (xVal - RANGO.minX) * scaleX;
      let py = centroY; // Sobre el eje X (y = 0)
      let color = COLORES_SOLUCIONES[idx % COLORES_SOLUCIONES.length];

      ctx.save();
      // Halo exterior brillante con el color distintivo de esta solución
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, 2 * Math.PI);
      ctx.fillStyle = hexToRgba(color, 0.32);
      ctx.fill();

      // Anillo secundario
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, 2 * Math.PI);
      ctx.fillStyle = hexToRgba(color, 0.65);
      ctx.fill();

      // Punto central sólido blanco con borde de color
      ctx.beginPath();
      ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Etiqueta con el valor exacto de x y su color identificativo
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = py > alto / 2 ? 'bottom' : 'top';
      let offsetY = py > alto / 2 ? -14 : 14;
      ctx.fillText(`x${idx + 1} = ${xVal.toFixed(2)}`, px, py + offsetY);
      ctx.restore();
    }
  });
}

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}
