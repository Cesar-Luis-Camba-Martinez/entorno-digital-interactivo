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

  const tamFlecha = 8;
  ctx.fillStyle = '#64748b';

  ctx.beginPath();
  ctx.moveTo(ancho, centroY);
  ctx.lineTo(ancho - tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(ancho - tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, centroY);
  ctx.lineTo(tamFlecha, centroY - tamFlecha / 2);
  ctx.lineTo(tamFlecha, centroY + tamFlecha / 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centroX, 0);
  ctx.lineTo(centroX - tamFlecha / 2, tamFlecha);
  ctx.lineTo(centroX + tamFlecha / 2, tamFlecha);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centroX, alto);
  ctx.lineTo(centroX - tamFlecha / 2, alto - tamFlecha);
  ctx.lineTo(centroX + tamFlecha / 2, alto - tamFlecha);
  ctx.closePath();
  ctx.fill();

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
   PROCESO PREVIO DE APRENDIZAJE Y VERIFICACIÓN
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
      <p>Con los coeficientes que registraste en el Laboratorio Virtual, calcula la solución en tu cuaderno o directamente en el siguiente espacio. Anota el valor de la incógnita y, si puedes, los pasos que seguiste.</p>
      <label for="campo-intento-estudiante" class="etiqueta-formula" style="margin-top:0.6rem;">Tu respuesta y procedimiento:</label>
      <textarea id="campo-intento-estudiante" class="textarea-intento" rows="5" placeholder="Ejemplo: x = 2. Primero transpuse el término independiente y luego..." autocomplete="off"></textarea>
      <button type="button" class="btn-resolver" onclick="revelarSolucion()">✅ Ya resolví: Ver Desarrollo y Respuesta</button>
    </div>`;

  const campo = document.getElementById('campo-intento-estudiante');
  if (campo) campo.focus();
}

function revelarSolucion() {
  if (typeof funcionResolverPendiente !== 'function') return;

  const campo = document.getElementById('campo-intento-estudiante');
  const intento = campo ? campo.value.trim() : '';

  if (!intento) {
    const continuar = window.confirm('Aún no escribiste tu respuesta. ¿Deseas ver el desarrollo y la respuesta de todos modos?');
    if (!continuar) {
      if (campo) campo.focus();
      return;
    }
  }

  const funcion = funcionResolverPendiente;
  const tipo = tipoEcuacionPendiente;
  funcionResolverPendiente = null;
  tipoEcuacionPendiente = null;
  funcion();

  const res = document.getElementById('resultado');

  if (intento && res) {
    const bloqueIntento = `<div class="intento-registrado">
        <span class="etiqueta-formula">🧑‍🎓 Tu intento previo:</span>
        <div class="intento-texto">${escaparHTML(intento)}</div>
      </div>`;
    res.insertAdjacentHTML('afterbegin', bloqueIntento);

    const cajaVerificacion = verificarIntentoEstudiante(intento, res, tipo);
    if (cajaVerificacion) {
      res.insertAdjacentHTML('afterbegin', cajaVerificacion);
    }
  }

  renderizarMatematicasGlobal();
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/* =====================================================================
   MECANISMO DE VERIFICACIÓN ROBUSTO
   ===================================================================== */
function evaluarExpresionSimple(str) {
  if (!str) return null;
  let limpia = str.trim().replace(',', '.');
  
  // Soporte para fracciones numéricas sencillas (ej. "4/2", "-1/3")
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
  
  // 1. Asignaciones explícitas (ej. x = 2, x = 4/2, x1 = -3.5)
  // Evita atrapar ecuaciones no despejadas como "2x = 4" pidiendo un límite de término previo
  const regexAsignacion = /(?:^|[^0-9a-zA-Z_])([a-zA-Z_]\w*)\s*=\s*(-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?)/g;
  const explicitos = [];
  let coincidencia;
  
  while ((coincidencia = regexAsignacion.exec(texto)) !== null) {
    const rawVal = coincidencia[2];
    const val = evaluarExpresionSimple(rawVal);
    if (val !== null && !isNaN(val)) {
      explicitos.push(val);
    }
  }

  let valores = [];
  if (explicitos.length > 0) {
    valores = explicitos;
  } else {
    // Si no se usó "x =", busca números o fracciones aislados
    const regexGeneral = /-?\d+(?:[.,]\d+)?(?:\s*\/\s*-?\d+(?:[.,]\d+)?)?/g;
    const coincidencias = texto.match(regexGeneral) || [];
    valores = coincidencias
      .map(n => evaluarExpresionSimple(n))
      .filter(n => n !== null && !isNaN(n));
  }

  // Desduplicar valores idénticos o numéricamente equivalentes
  const unicos = [];
  valores.forEach(v => {
    if (!unicos.some(u => Math.abs(u - v) < 1e-4)) {
      unicos.push(v);
    }
  });

  return unicos;
}

function indicaSinSolucion(texto) {
  if (!texto) return false;
  return /(sin soluci|no tiene soluci|no hay soluci|conjunto vac|no existe soluci|∅|vac[ií]o)/.test(texto.toLowerCase());
}

function numerosCoinciden(a, b) {
  const TOLERANCIA_ABSOLUTA = 0.05;
  const TOLERANCIA_RELATIVA = 0.01;
  const diferencia = Math.abs(a - b);
  return diferencia <= TOLERANCIA_ABSOLUTA || diferencia <= Math.abs(b) * TOLERANCIA_RELATIVA;
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
  if (numeros.length === 0) return null;
  return numeros.length;
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
  const cajaCantidad = verificarCantidadSoluciones(intento, cantidadCorrecta);

  if (cantidadCorrecta === 0) return cajaCantidad;

  const numerosCorrectos = extraerNumerosDeResultado(textoCorrecto);
  const numerosEstudiante = extraerNumerosDelIntento(intento);
  let cajaValores = '';

  if (numerosEstudiante.length === 0) {
    cajaValores = construirCajaVerificacion('info', 'No se detectó un valor numérico en tu respuesta.', 'Recuerda anotar el valor de la incógnita, por ejemplo: x = 3.');
  } else if (numerosCorrectos.length > 0) {
    const correctosUnicos = [...new Set(numerosCorrectos.map(n => Math.round(n * 1000) / 1000))];
    const usados = new Set();
    let encontrados = 0;

    correctosUnicos.forEach(valorCorrecto => {
      const idx = numerosEstudiante.findIndex((v, i) => !usados.has(i) && numerosCoinciden(v, valorCorrecto));
      if (idx !== -1) { encontrados++; usados.add(idx); }
    });

    const prop = encontrados / correctosUnicos.length;
    if (prop === 1) {
      cajaValores = construirCajaVerificacion('correcta', '¡Excelente! El valor de tu respuesta es correcto.', 'Coincide con la solución calculada.');
    } else if (prop > 0) {
      cajaValores = construirCajaVerificacion('parcial', 'El valor de tu respuesta es parcialmente correcto.', `Identificaste ${encontrados} de ${correctosUnicos.length} solución(es).`);
    } else {
      cajaValores = construirCajaVerificacion('incorrecta', 'El valor de tu respuesta no coincide con la solución correcta.', 'Revisa el desarrollo detallado a continuación.');
    }
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
    return construirCajaVerificacion('info', 'Verificación por sustitución no aplicable.', 'Esta ecuación tiene raíces complejas conjugadas.');
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

  if (!cX || !cY) {
    return construirCajaVerificacion('info', 'No se pudo verificar por sustitución directa.', 'Escribe tu respuesta de forma explícita: "x = ..., y = ...".');
  }

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
   RESOLUCIÓN PASO A PASO
   ===================================================================== */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error matemático: Si $a = 0$, la expresión no constituye una ecuación lineal válida.</span>';
    renderizarMatematicasGlobal();
    return;
  }
  
  let x = -b / a;
  res.innerHTML = `<div><strong>Explicación:</strong> Para resolver la ecuación lineal $${a}x + (${b}) = 0$, se aísla la variable $x$.</div>
                   <div><strong>Paso 1: Planteamiento de la ecuación original:</strong> $${a}x + (${b}) = 0$</div>
                   <div><strong>Paso 2: Transposición del término independiente:</strong> $${a}x = ${-b}$</div>
                   <div><strong>Paso 3: Despeje formal dividiendo para $a$:</strong> $a = ${a} \\neq 0 \\implies x = \\frac{${-b}}{${a}}$</div>
                   <div class="resultado-final">Resultado Formateado: $x = ${x.toFixed(4)}$</div>`;
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
  let pasos = `<div><strong>Explicación Analítica:</strong> Se evalúa el dominio de definición para evitar divisiones para cero.</div>`;
  pasos += `<div><strong>Paso 1: Restricción de Dominio (Asíntota Vertical):</strong> $x + (${b}) \\neq 0 \\implies x \\neq ${restriccion}$</div>`;

  if (c === 0) {
    pasos += `<div><strong>Paso 2: Análisis del Numerador:</strong> La expresión $\\frac{${a}}{x + (${b})} = 0$ no posee solución real pues $${a} \\neq 0$.</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución: $\\mathcal{S} = \\emptyset$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let numPaso2 = -a / c;
  let x = numPaso2 - b;

  pasos += `<div><strong>Paso 2: Transposición del término independiente:</strong> $\\frac{${a}}{x + (${b})} = ${-c}$</div>`;
  pasos += `<div><strong>Paso 3: Despeje del denominador:</strong> $x + (${b}) = \\frac{${a}}{${-c}} \\implies x + (${b}) = ${numPaso2.toFixed(4)}$</div>`;
  pasos += `<div><strong>Paso 4: Despeje Final de $x$:</strong> $x = ${numPaso2.toFixed(4)} - (${b})$</div>`;

  if (Math.abs(x - restriccion) < 0.0001) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">La solución $x = ${x.toFixed(4)}$ coincide con la restricción ($x \\neq ${restriccion}$). No existe solución en $\\mathbb{R}$.</div>`;
  } else {
    pasos += `<div class="resultado-final">Solución válida: $x = ${x.toFixed(4)}$ (Restricción: $x \\neq ${restriccion}$)</div>`;
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $a$ no puede ser cero en una ecuación cuadrática.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let bCuadrado = b * b;
  let cuatroAC = 4 * a * c;
  let discriminante = bCuadrado - cuatroAC;
  let dosA = 2 * a;
  let menosB = -b;

  let h = -b / (2 * a);
  let k = a * h * h + b * h + c;
  let concavidad = a > 0 ? 'Cóncava hacia arriba ($\\cup$)' : 'Cóncava hacia abajo ($\\cap$)';
  let tipoExtremo = a > 0 ? 'Mínimo absoluto' : 'Máximo absoluto';
  let rangoStr = a > 0 ? `[${k.toFixed(4)}, +\\infty)` : `(-\\infty, ${k.toFixed(4)}]`;

  let pasos = `<div><strong>Explicación Analítica:</strong> Análisis algebraico y geométrico de $f(x) = ${a}x^2 + (${b})x + (${c})$.</div>`;
  pasos += `<div><strong>Paso 1: Identificación de coeficientes:</strong> $a = ${a},\\; b = ${b},\\; c = ${c}$</div>`;
  pasos += `<div><strong>Paso 2: Cálculo del Discriminante $\\Delta = b^2 - 4ac$:</strong> $\\Delta = (${b})^2 - 4(${a})(${c}) = ${discriminante.toFixed(2)}$</div>`;

  if (discriminante > 0) {
    let raizDisc = Math.sqrt(discriminante);
    let x1 = (menosB + raizDisc) / dosA;
    let x2 = (menosB - raizDisc) / dosA;

    pasos += `<div><strong>Paso 3: Aplicación de Fórmula General ($\Delta > 0$):</strong></div>`;
    pasos += `<div style="margin-left: 1rem;">• $x_1 = \\frac{${menosB.toFixed(2)} + ${raizDisc.toFixed(4)}}{${dosA.toFixed(2)}} = ${x1.toFixed(4)}$</div>`;
    pasos += `<div style="margin-left: 1rem;">• $x_2 = \\frac{${menosB.toFixed(2)} - ${raizDisc.toFixed(4)}}{${dosA.toFixed(2)}} = ${x2.toFixed(4)}$</div>`;
    pasos += `<div class="resultado-final">Soluciones reales distintas: $x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$</div>`;

  } else if (discriminante === 0) {
    let x = menosB / dosA;
    pasos += `<div><strong>Paso 3: Aplicación de Fórmula General ($\Delta = 0$):</strong></div>`;
    pasos += `<div class="resultado-final">Solución real doble: $x = ${x.toFixed(4)}$</div>`;

  } else {
    let absDisc = -discriminante;
    let raizDisc = Math.sqrt(absDisc);
    let parteReal = menosB / dosA;
    let parteImaginaria = raizDisc / dosA;

    pasos += `<div><strong>Paso 3: Aplicación de Fórmula General ($\Delta < 0$):</strong></div>`;
    pasos += `<div class="resultado-final">Soluciones complejas conjugadas: $x_1 = ${parteReal.toFixed(4)} + ${parteImaginaria.toFixed(4)}i, \\quad x_2 = ${parteReal.toFixed(4)} - ${parteImaginaria.toFixed(4)}i$</div>`;
  }

  pasos += `<div style="margin-top: 1rem;"><strong>Análisis Geométrico de la Parábola:</strong></div>`;
  pasos += `<div style="margin-left: 1rem;">• <strong>Vértice $V(h, k)$:</strong> $V(${h.toFixed(4)}, ${k.toFixed(4)})$</div>`;
  pasos += `<div style="margin-left: 1rem;">• <strong>Eje de simetría:</strong> $x = ${h.toFixed(4)}$</div>`;
  pasos += `<div style="margin-left: 1rem;">• <strong>Concavidad:</strong> ${concavidad} (${tipoExtremo})</div>`;
  pasos += `<div style="margin-left: 1rem;">• <strong>Intersección Y:</strong> $(0, ${c})$</div>`;
  pasos += `<div style="margin-left: 1rem;">• <strong>Recorrido (Rango):</strong> $\\text{Rec}(f) = ${rangoStr}$</div>`;

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

  let pasos = `<div><strong>Explicación:</strong> Resolviendo mediante la Regla de Cramer empleando determinantes:</div>`;
  pasos += `<div><strong>Paso 1: Determinante del Sistema ($D$):</strong> $D = (${a1})(${b2}) - (${a2})(${b1}) = ${D.toFixed(4)}$</div>`;
  pasos += `<div><strong>Paso 2: Determinante en $X$ ($D_x$):</strong> $D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${Dx.toFixed(4)}$</div>`;
  pasos += `<div><strong>Paso 3: Determinante en $Y$ ($D_y$):</strong> $D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${Dy.toFixed(4)}$</div>`;

  if (Math.abs(D) > 1e-6) {
    let x = Dx / D;
    let y = Dy / D;
    pasos += `<div class="resultado-final">Sistema Compatible Determinado: $x = ${x.toFixed(4)}, \\quad y = ${y.toFixed(4)}$</div>`;
  } else {
    if (Math.abs(Dx) < 1e-6 && Math.abs(Dy) < 1e-6) {
      pasos += `<div class="resultado-final" style="background-color:#fffbeb; border-color:#fde68a; color:#92400e;">Sistema Compatible Indeterminado (Infinitas soluciones, rectas coincidentes)</div>`;
    } else {
      pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Sistema Incompatible (Sin solución, rectas paralelas)</div>`;
    }
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

  let pasos = `<div><strong>Explicación:</strong> La ecuación $|${a}x + (${b})| = ${c}$ modela la distancia sobre la recta real.</div>`;

  if (c < 0) {
    pasos += `<div><strong>Paso 1: Comprobación de existencia:</strong> Dado que $c = ${c} < 0$, la magnitud absoluta no puede ser negativa.</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Sin solución real: $\\mathcal{S} = \\emptyset$</div>`;
  } else {
    let x1 = (c - b) / a;
    let x2 = (-c - b) / a;

    pasos += `<div><strong>Paso 1: Caso Positivo:</strong> $${a}x + (${b}) = ${c} \\implies x_1 = \\frac{${c} - (${b})}{${a}} = ${x1.toFixed(4)}$</div>`;
    pasos += `<div><strong>Paso 2: Caso Negativo:</strong> $${a}x + (${b}) = ${-c} \\implies x_2 = \\frac{${-c} - (${b})}{${a}} = ${x2.toFixed(4)}$</div>`;
    
    if (Math.abs(x1 - x2) < 1e-6) {
      pasos += `<div class="resultado-final">Solución única: $x = ${x1.toFixed(4)}$</div>`;
    } else {
      pasos += `<div class="resultado-final">Soluciones: $x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$</div>`;
    }
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/* =====================================================================
   HELPER DE RUFFINI Y RESOLUCIÓN DE POLINOMIOS
   ===================================================================== */
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
  } else {
    return 0;
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

  for (let x = -50; x <= 50; x += 0.5) {
    let f1 = evaluarPolinomio(coefs, x);
    let f2 = evaluarPolinomio(coefs, x + 0.5);
    if (f1 * f2 <= 0) {
      let low = x, high = x + 0.5;
      for (let iter = 0; iter < 30; iter++) {
        let mid = (low + high) / 2;
        if (evaluarPolinomio(coefs, low) * evaluarPolinomio(coefs, mid) <= 0) high = mid;
        else low = mid;
      }
      let r = (low + high) / 2;
      if (Math.abs(evaluarPolinomio(coefs, r)) < 1e-4) return Math.round(r * 10000) / 10000;
    }
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
  html += '</tr>';

  html += '<tr><td class="col-raiz"></td>';
  fila2.forEach(p => { html += `<td>${Number(p.toFixed(4))}</td>`; });
  html += '</tr>';

  html += '<tr><td class="col-raiz"></td>';
  fila3.forEach((v, idx) => {
    let esResiduo = (idx === fila3.length - 1);
    let cls = (esResiduo && Math.abs(v) < 1e-4) ? ' class="residuo-cero"' : '';
    html += `<td${cls}>${Number(v.toFixed(4))}</td>`;
  });
  html += '</tr></table></div>';

  return {
    html: html,
    coefsResultantes: fila3.slice(0, fila3.length - 1)
  };
}

function resolverPolinomioGenerico(coefs, nombreGrado) {
  const res = document.getElementById('resultado');
  if (coefs[0] === 0) {
    res.innerHTML = `<span style="color:#ef4444; font-weight:bold;">Error: El coeficiente del término de mayor grado no puede ser cero.</span>`;
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Explicación:</strong> Resolución paso a paso de la ecuación polinómica de ${nombreGrado}.</div>`;
  let coefsActuales = [...coefs];
  let raices = [];
  let pasoNum = 1;

  while (coefsActuales.length > 3) {
    let r = buscarRaizReal(coefsActuales);
    if (r === null) break;

    let resRuffini = generarTablaRuffiniHTML(coefsActuales, r);
    pasos += `<div><strong>Paso ${pasoNum}: División sintética (Ruffini) para la raíz $x = ${r}$:</strong></div>`;
    pasos += resRuffini.html;
    raices.push(`x_${raices.length + 1} = ${r}`);
    coefsActuales = resRuffini.coefsResultantes;
    pasoNum++;
  }

  if (coefsActuales.length === 3) {
    let A = coefsActuales[0], B = coefsActuales[1], C = coefsActuales[2];
    let disc = B * B - 4 * A * C;
    pasos += `<div><strong>Paso ${pasoNum}: Resolución de la cuadrática reducida $(${A})x^2 + (${B})x + (${C}) = 0$:</strong></div>`;

    if (disc >= 0) {
      let r1 = (-B + Math.sqrt(disc)) / (2 * A);
      let r2 = (-B - Math.sqrt(disc)) / (2 * A);
      raices.push(`x_${raices.length + 1} = ${r1.toFixed(4)}`);
      raices.push(`x_${raices.length + 1} = ${r2.toFixed(4)}`);
    } else {
      let re = (-B / (2 * A)).toFixed(4);
      let im = (Math.sqrt(-disc) / (2 * A)).toFixed(4);
      raices.push(`x_${raices.length + 1} = ${re} + ${im}i`);
      raices.push(`x_${raices.length + 1} = ${re} - ${im}i`);
    }
  }

  pasos += `<div class="resultado-final">Raíces encontradas: $${raices.join(', \\quad ')}$</div>`;
  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverPolinomica() {
  let a = parseFloat(document.getElementById('poly-a').value) || 0;
  let b = parseFloat(document.getElementById('poly-b').value) || 0;
  let c = parseFloat(document.getElementById('poly-c').value) || 0;
  let d = parseFloat(document.getElementById('poly-d').value) || 0;
  resolverPolinomioGenerico([a, b, c, d], "Tercer Grado (Cúbica)");
}

function resolverCuartica() {
  let a = parseFloat(document.getElementById('quart-a').value) || 0;
  let b = parseFloat(document.getElementById('quart-b').value) || 0;
  let c = parseFloat(document.getElementById('quart-c').value) || 0;
  let d = parseFloat(document.getElementById('quart-d').value) || 0;
  let e = parseFloat(document.getElementById('quart-e').value) || 0;
  resolverPolinomioGenerico([a, b, c, d, e], "Cuarto Grado (Cuártica)");
}

function resolverQuintica() {
  let a = parseFloat(document.getElementById('quint-a').value) || 0;
  let b = parseFloat(document.getElementById('quint-b').value) || 0;
  let c = parseFloat(document.getElementById('quint-c').value) || 0;
  let d = parseFloat(document.getElementById('quint-d').value) || 0;
  let e = parseFloat(document.getElementById('quint-e').value) || 0;
  let f = parseFloat(document.getElementById('quint-f').value) || 0;
  resolverPolinomioGenerico([a, b, c, d, e, f], "Quinto Grado (Quíntica)");
}

function resolverSextica() {
  let a = parseFloat(document.getElementById('sext-a').value) || 0;
  let b = parseFloat(document.getElementById('sext-b').value) || 0;
  let c = parseFloat(document.getElementById('sext-c').value) || 0;
  let d = parseFloat(document.getElementById('sext-d').value) || 0;
  let e = parseFloat(document.getElementById('sext-e').value) || 0;
  let f = parseFloat(document.getElementById('sext-f').value) || 0;
  let g = parseFloat(document.getElementById('sext-g').value) || 0;
  resolverPolinomioGenerico([a, b, c, d, e, f, g], "Sexto Grado (Séxtica)");
}