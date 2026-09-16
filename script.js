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
   PROCESO PREVIO DE APRENDIZAJE: INTENTO DEL ESTUDIANTE ANTES DE LA SOLUCIÓN
   ===================================================================== */
// Guarda una referencia a la función de resolución real (resolverLineal,
// calcularEcuacion, etc.) mientras el estudiante realiza su propio intento.
let funcionResolverPendiente = null;

// Guarda el identificador del tipo de ecuación del panel activo (por
// ejemplo 'lineal', 'cuadratica', 'sistema', etc.) mientras el estudiante
// realiza su intento. Se usa exclusivamente para el mecanismo de
// verificación por sustitución directa en la ecuación real.
let tipoEcuacionPendiente = null;

// Se ejecuta al presionar "▶ Resolver". En lugar de mostrar de inmediato
// la respuesta y el desarrollo, primero solicita al estudiante que
// calcule la solución por su cuenta con los coeficientes ya ingresados.
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

// Se ejecuta al presionar "Ver Desarrollo y Respuesta". Recupera el
// intento del estudiante, ejecuta la función de resolución original
// (sin alterarla), VERIFICA automáticamente la respuesta del estudiante
// contra el resultado correcto recién calculado, y antepone tanto la
// retroalimentación como el intento registrado para que el estudiante
// compare su propio procedimiento con el correcto.
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
    // Antepone primero el intento registrado del estudiante...
    const bloqueIntento = `<div class="intento-registrado">
        <span class="etiqueta-formula">🧑‍🎓 Tu intento previo:</span>
        <div class="intento-texto">${escaparHTML(intento)}</div>
      </div>`;
    res.insertAdjacentHTML('afterbegin', bloqueIntento);

    // ...y luego, encima de todo, las cajas de verificación automática,
    // comparando lo que el estudiante escribió contra la(s) respuesta(s)
    // correcta(s) que la función de resolución acaba de renderizar, y
    // contra la ecuación original (verificación por sustitución).
    const cajaVerificacion = verificarIntentoEstudiante(intento, res, tipo);
    if (cajaVerificacion) {
      res.insertAdjacentHTML('afterbegin', cajaVerificacion);
    }
  }

  renderizarMatematicasGlobal();
}

// Sanea el texto libre del estudiante antes de insertarlo como HTML.
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/* =====================================================================
   MECANISMO DE VERIFICACIÓN DE LA RESPUESTA DEL ESTUDIANTE
   ===================================================================== */
// Estas funciones comparan, de manera automática, el texto libre que
// el estudiante escribió en el campo de intento contra los valores
// numéricos finales que la función de resolución (resolverLineal,
// calcularEcuacion, resolverSistema, etc.) ya calculó y mostró dentro
// de los elementos con clase "resultado-final". No se modifica ninguna
// función de resolución existente: la verificación "lee" el resultado
// que ellas mismas generaron en el DOM y lo contrasta con el intento.

// Extrae del texto los números que aparecen inmediatamente después de
// un signo "=", que es exactamente el patrón que usan todas las
// funciones de resolución para mostrar su respuesta final
// (por ejemplo: "x = 2.0000", "x_1 = -3", "y = 1.5000").
function extraerNumerosDeResultado(texto) {
  if (!texto) return [];
  const numeros = [];
  const regexIgualdad = /=\s*(-?\d+(?:\.\d+)?)/g;
  let coincidencia;
  while ((coincidencia = regexIgualdad.exec(texto)) !== null) {
    numeros.push(parseFloat(coincidencia[1]));
  }
  // Captura también la parte imaginaria de raíces complejas conjugadas,
  // expresadas como "+ 2.00i" o "- 3i" dentro del texto.
  const regexImaginaria = /([+-]\s*\d+(?:\.\d+)?)\s*i\b/g;
  while ((coincidencia = regexImaginaria.exec(texto)) !== null) {
    numeros.push(parseFloat(coincidencia[1].replace(/\s+/g, '')));
  }
  return numeros;
}

// Extrae los números que el ESTUDIANTE escribió en su intento. Se da
// prioridad a patrones explícitos de asignación como "x = 3" o
// "x1 = -2.5"; si no se encuentra ninguno, se toman en cuenta todos
// los números presentes en el texto como respaldo.
function extraerNumerosDelIntento(texto) {
  if (!texto) return [];

  const regexAsignacion = /\b[a-zA-Z]\w*\s*=\s*(-?\d+(?:[.,]\d+)?)/g;
  const explicitos = [];
  let coincidencia;
  while ((coincidencia = regexAsignacion.exec(texto)) !== null) {
    explicitos.push(parseFloat(coincidencia[1].replace(',', '.')));
  }
  if (explicitos.length > 0) return explicitos;

  const regexGeneral = /-?\d+(?:[.,]\d+)?/g;
  const coincidencias = texto.match(regexGeneral) || [];
  return coincidencias
    .map(n => parseFloat(n.replace(',', '.')))
    .filter(n => !isNaN(n));
}

// Determina si el texto del estudiante indica, en palabras, que la
// ecuación no tiene solución real (para los casos en que ese es,
// efectivamente, el resultado correcto).
function indicaSinSolucion(texto) {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return /(sin soluci|no tiene soluci|no hay soluci|conjunto vac|no existe soluci|∅|vac[ií]o)/.test(t);
}

// Compara dos números con una tolerancia razonable, ya que la
// respuesta correcta se muestra redondeada (toFixed) y el estudiante
// puede escribir menos decimales.
function numerosCoinciden(a, b) {
  const TOLERANCIA_ABSOLUTA = 0.05;
  const TOLERANCIA_RELATIVA = 0.01;
  const diferencia = Math.abs(a - b);
  return diferencia <= TOLERANCIA_ABSOLUTA || diferencia <= Math.abs(b) * TOLERANCIA_RELATIVA;
}

/* ---------------------------------------------------------------------
   VERIFICACIÓN DE LA CANTIDAD DE SOLUCIONES
   --------------------------------------------------------------------- */
// Mapa de palabras numéricas en español, usado para reconocer respuestas
// como "dos soluciones" o "tres raíces" escritas con letras.
const PALABRAS_NUMERO_ES = {
  'cero': 0, 'ninguna': 0, 'ningún': 0, 'ninguno': 0,
  'una': 1, 'uno': 1,
  'dos': 2,
  'tres': 3,
  'cuatro': 4,
  'cinco': 5,
  'seis': 6,
};

// Cuenta cuántas soluciones tiene REALMENTE la ecuación, a partir del
// texto ya renderizado dentro de los elementos ".resultado-final". Se
// apoya en que cada incógnita anunciada con "x =" (con o sin subíndice,
// por ejemplo "x =", "x_1 =", "x_2 =") corresponde a una raíz distinta,
// incluyendo raíces repetidas (multiplicidad) y complejas conjugadas.
function contarSolucionesCorrectas(textoCorrecto) {
  const sinSolucionTexto = /\\emptyset|∅|no tiene soluci[oó]n v[aá]lida|carece de soluci[oó]n/i.test(textoCorrecto);
  if (sinSolucionTexto) return 0;

  // Caso especial: Sistema de Ecuaciones Lineales 2×2. La solución es
  // UN único punto de intersección (x, y), no dos soluciones separadas.
  if (/\bx\s*=/.test(textoCorrecto) && /\by\s*=/.test(textoCorrecto) && !/x_/.test(textoCorrecto)) {
    return 1;
  }

  const regexRaices = /\bx(_\{?\d+\}?)?\s*=/g;
  const coincidencias = textoCorrecto.match(regexRaices) || [];
  return coincidencias.length;
}

// Intenta determinar cuántas soluciones CREE el estudiante que tiene la
// ecuación, ya sea porque lo declaró explícitamente ("2 soluciones",
// "tres raíces", "no tiene solución") o, en su defecto, contando cuántos
// valores numéricos distintos escribió como respuesta. Devuelve null si
// no fue posible determinarlo de ninguna forma.
function extraerCantidadDeclaradaPorEstudiante(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();

  if (indicaSinSolucion(t)) return 0;

  // Patrón explícito con dígitos: "2 soluciones", "tiene 3 raíces"
  const regexDigito = /(\d+)\s*(soluci[oó]n(?:es)?|ra[ií]z|ra[ií]ces)/;
  const coincidenciaDigito = t.match(regexDigito);
  if (coincidenciaDigito) return parseInt(coincidenciaDigito[1], 10);

  // Patrón explícito con palabra numérica: "dos soluciones", "tres raíces"
  const regexPalabra = /\b(cero|ninguna|ningún|ninguno|una|uno|dos|tres|cuatro|cinco|seis)\b\s*(soluci[oó]n(?:es)?|ra[ií]z|ra[ií]ces)/;
  const coincidenciaPalabra = t.match(regexPalabra);
  if (coincidenciaPalabra && coincidenciaPalabra[1] in PALABRAS_NUMERO_ES) {
    return PALABRAS_NUMERO_ES[coincidenciaPalabra[1]];
  }

  // Respaldo: se infiere la cantidad a partir de cuántos valores
  // numéricos distintos escribió el estudiante como respuesta.
  const numeros = extraerNumerosDelIntento(texto);
  if (numeros.length === 0) return null;
  const distintos = [...new Set(numeros.map(n => Math.round(n * 1000) / 1000))];
  return distintos.length;
}

// Construye la caja de retroalimentación específica sobre la CANTIDAD
// de soluciones planteadas por el estudiante frente a la cantidad real.
function verificarCantidadSoluciones(intento, cantidadCorrecta) {
  const cantidadEstudiante = extraerCantidadDeclaradaPorEstudiante(intento);
  const etiqueta = n => (n === 1 ? '1 solución' : `${n} soluciones`);

  if (cantidadEstudiante === null) {
    return construirCajaVerificacion(
      'info',
      'No se pudo determinar cuántas soluciones planteaste.',
      `Esta ecuación tiene ${etiqueta(cantidadCorrecta)}. Intenta indicarlo explícitamente (por ejemplo: "encontré ${etiqueta(cantidadCorrecta)}").`
    );
  }

  if (cantidadEstudiante === cantidadCorrecta) {
    return construirCajaVerificacion(
      'correcta',
      `Cantidad de soluciones correcta: identificaste ${etiqueta(cantidadCorrecta)}.`,
      null
    );
  }

  const comparativo = cantidadEstudiante < cantidadCorrecta ? 'menos de las que existen' : 'más de las que existen';
  return construirCajaVerificacion(
    'incorrecta',
    'La cantidad de soluciones que planteaste no es correcta.',
    `Tu respuesta sugiere ${etiqueta(cantidadEstudiante)} (${comparativo}), pero esta ecuación tiene en realidad ${etiqueta(cantidadCorrecta)}. Revisa el desarrollo para entender por qué.`
  );
}

// Construye el bloque HTML de retroalimentación visual.
function construirCajaVerificacion(tipo, titulo, detalle) {
  const config = {
    correcta:   { icono: '✅', clase: 'verificacion-correcta' },
    parcial:    { icono: '🟡', clase: 'verificacion-parcial' },
    incorrecta: { icono: '❌', clase: 'verificacion-incorrecta' },
    info:       { icono: 'ℹ️', clase: 'verificacion-info' },
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

// Función principal de verificación. Recibe el texto del intento del
// estudiante, el contenedor #resultado (ya con la solución correcta
// renderizada) y el tipo de ecuación del panel activo, y devuelve el
// HTML combinado de tres verificaciones independientes: (1) la CANTIDAD
// de soluciones, (2) el VALOR de cada solución comparado contra la
// respuesta ya calculada, y (3) la verificación por SUSTITUCIÓN DIRECTA
// de la respuesta del estudiante en la ecuación original.
function verificarIntentoEstudiante(intento, contenedorResultado, tipoEcuacion) {
  if (!contenedorResultado) return '';

  const nodosFinales = contenedorResultado.querySelectorAll('.resultado-final');
  if (nodosFinales.length === 0) return '';

  let textoCorrecto = '';
  nodosFinales.forEach(nodo => { textoCorrecto += ' ' + nodo.textContent; });

  const cantidadCorrecta = contarSolucionesCorrectas(textoCorrecto);

  // 1) Verificación de la CANTIDAD de soluciones (siempre se muestra).
  const cajaCantidad = verificarCantidadSoluciones(intento, cantidadCorrecta);

  // Caso especial: la respuesta correcta es "no tiene solución real".
  // Aquí no tiene sentido verificar valores, así que solo se informa
  // sobre la cantidad (0) y se cierra la verificación.
  if (cantidadCorrecta === 0) {
    return cajaCantidad;
  }

  // 2) Verificación del VALOR de cada solución.
  const numerosCorrectos = extraerNumerosDeResultado(textoCorrecto);
  const numerosEstudiante = extraerNumerosDelIntento(intento);

  let cajaValores = '';

  if (numerosEstudiante.length === 0) {
    cajaValores = construirCajaVerificacion(
      'info',
      'No se detectó un valor numérico en tu respuesta.',
      'Recuerda anotar el valor de la incógnita, por ejemplo: x = 3. Compara igualmente tu procedimiento con el desarrollo mostrado.'
    );
  } else if (numerosCorrectos.length > 0) {
    // Se comparan los valores correctos (sin duplicados) contra los que
    // escribió el estudiante, emparejando cada uno como máximo una vez.
    const correctosUnicos = [...new Set(numerosCorrectos.map(n => Math.round(n * 1000) / 1000))];
    const usados = new Set();
    let encontrados = 0;

    correctosUnicos.forEach(valorCorrecto => {
      const indice = numerosEstudiante.findIndex((valorEstudiante, i) =>
        !usados.has(i) && numerosCoinciden(valorEstudiante, valorCorrecto)
      );
      if (indice !== -1) {
        encontrados++;
        usados.add(indice);
      }
    });

    const proporcion = encontrados / correctosUnicos.length;
    const totalTexto = correctosUnicos.length === 1 ? 'la solución' : `las ${correctosUnicos.length} soluciones`;

    if (proporcion === 1) {
      cajaValores = construirCajaVerificacion(
        'correcta',
        '¡Excelente! El valor de tu respuesta es correcto.',
        correctosUnicos.length === 1
          ? 'El valor que calculaste coincide con la solución.'
          : `Identificaste correctamente ${totalTexto} de la ecuación.`
      );
    } else if (proporcion > 0) {
      cajaValores = construirCajaVerificacion(
        'parcial',
        'El valor de tu respuesta es parcialmente correcto.',
        `Identificaste correctamente ${encontrados} de ${correctosUnicos.length} solución(es). Revisa el desarrollo paso a paso para completar tu análisis.`
      );
    } else {
      cajaValores = construirCajaVerificacion(
        'incorrecta',
        'El valor de tu respuesta no coincide con la solución correcta.',
        'No te preocupes: compara tu procedimiento con el desarrollo detallado a continuación para identificar en qué paso ocurrió la diferencia.'
      );
    }
  }

  // 3) Verificación por SUSTITUCIÓN DIRECTA: se toma la respuesta del
  // estudiante y se reemplaza literalmente en la ecuación original
  // (con los coeficientes que él mismo registró en el Laboratorio
  // Virtual), en lugar de comparar contra el texto ya renderizado.
  const cajaSustitucion = verificarPorSustitucion(intento, tipoEcuacion);

  return cajaCantidad + cajaValores + cajaSustitucion;
}

/* =====================================================================
   MECANISMO DE VERIFICACIÓN POR SUSTITUCIÓN DIRECTA EN LA ECUACIÓN
   ===================================================================== */
// A diferencia de verificarCantidadSoluciones() y del bloque de VALOR de
// arriba (que comparan el intento contra el TEXTO ya renderizado de la
// respuesta correcta), este mecanismo relee los coeficientes reales que
// el estudiante ingresó en el Laboratorio Virtual, reconstruye la
// ecuación original y sustituye en ella el valor que el estudiante
// escribió como respuesta, comprobando matemáticamente si la satisface.

// Lee del DOM los coeficientes actuales del panel correspondiente al
// tipo de ecuación indicado. No modifica ni depende de las funciones
// resolverLineal, calcularEcuacion, etc.: solo vuelve a leer los mismos
// campos de entrada que ellas usan.
function obtenerCoeficientesPorTipo(tipoEcuacion) {
  const num = id => {
    const campo = document.getElementById(id);
    return campo ? (parseFloat(campo.value) || 0) : 0;
  };
  switch (tipoEcuacion) {
    case 'lineal':
      return { a: num('lin-a'), b: num('lin-b') };
    case 'fraccionaria':
      return { a: num('frac-a'), b: num('frac-b'), c: num('frac-c') };
    case 'cuadratica':
      return { a: num('coef-a'), b: num('coef-b'), c: num('coef-c') };
    case 'sistema':
      return {
        a1: num('sys-a1'), b1: num('sys-b1'), c1: num('sys-c1'),
        a2: num('sys-a2'), b2: num('sys-b2'), c2: num('sys-c2'),
      };
    case 'absoluto':
      return { a: num('abs-a'), b: num('abs-b'), c: num('abs-c') };
    case 'cubica':
      return { a: num('poly-a'), b: num('poly-b'), c: num('poly-c'), d: num('poly-d') };
    case 'cuartica':
      return { a: num('quart-a'), b: num('quart-b'), c: num('quart-c'), d: num('quart-d'), e: num('quart-e') };
    case 'quintica':
      return { a: num('quint-a'), b: num('quint-b'), c: num('quint-c'), d: num('quint-d'), e: num('quint-e'), f: num('quint-f') };
    case 'sextica':
      return { a: num('sext-a'), b: num('sext-b'), c: num('sext-c'), d: num('sext-d'), e: num('sext-e'), f: num('sext-f'), g: num('sext-g') };
    default:
      return null;
  }
}

// Evalúa el residuo de la ecuación original (tipo "expresión = 0", o su
// forma equivalente) en el valor x indicado. Un residuo cercano a cero
// significa que x satisface la ecuación. Devuelve null cuando x cae
// fuera del dominio de definición (por ejemplo, la asíntota vertical de
// la ecuación fraccionaria).
function evaluarResiduoEcuacion(tipoEcuacion, coef, x) {
  switch (tipoEcuacion) {
    case 'lineal':
      return coef.a * x + coef.b;
    case 'fraccionaria':
      if (Math.abs(x + coef.b) < 1e-6) return null; // anula el denominador
      return coef.a / (x + coef.b) + coef.c;
    case 'cuadratica':
      return coef.a * x * x + coef.b * x + coef.c;
    case 'absoluto':
      return Math.abs(coef.a * x + coef.b) - coef.c;
    case 'cubica':
      return coef.a * Math.pow(x, 3) + coef.b * Math.pow(x, 2) + coef.c * x + coef.d;
    case 'cuartica':
      return coef.a * Math.pow(x, 4) + coef.b * Math.pow(x, 3) + coef.c * Math.pow(x, 2) + coef.d * x + coef.e;
    case 'quintica':
      return coef.a * Math.pow(x, 5) + coef.b * Math.pow(x, 4) + coef.c * Math.pow(x, 3) + coef.d * Math.pow(x, 2) + coef.e * x + coef.f;
    case 'sextica':
      return coef.a * Math.pow(x, 6) + coef.b * Math.pow(x, 5) + coef.c * Math.pow(x, 4) + coef.d * Math.pow(x, 3) + coef.e * Math.pow(x, 2) + coef.f * x + coef.g;
    default:
      return null;
  }
}

// Tolerancia adaptativa para el residuo: se escala con la magnitud de
// los coeficientes de la propia ecuación, ya que un mismo margen de
// redondeo en x produce residuos mucho mayores en ecuaciones de grado
// alto o con coeficientes grandes que en una ecuación lineal sencilla.
function toleranciaResiduo(coef) {
  const suma = Object.values(coef).reduce((acc, v) => acc + Math.abs(v || 0), 0);
  return Math.max(0.5, suma * 0.05);
}

// Mecanismo de verificación por sustitución para el caso de UNA sola
// incógnita (todos los tipos salvo el sistema 2×2).
function verificarSustitucionUnaIncognita(intento, tipoEcuacion, coef) {
  const numeros = extraerNumerosDelIntento(intento);
  if (numeros.length === 0) return '';

  // Caso particular cuadrático: si el discriminante es negativo, las
  // raíces son complejas conjugadas y ningún número real puede anular
  // la ecuación al sustituirlo, por lo que la comprobación numérica
  // directa no aplica (no es un error del estudiante).
  if (tipoEcuacion === 'cuadratica' && (coef.b * coef.b - 4 * coef.a * coef.c) < 0) {
    return construirCajaVerificacion(
      'info',
      'Verificación por sustitución no aplicable en este caso.',
      'Esta ecuación tiene raíces complejas conjugadas, por lo que ningún número real anula $ax^2+bx+c$ al sustituirlo. Comprueba tu respuesta reemplazando el número complejo completo.'
    );
  }

  const tolerancia = toleranciaResiduo(coef);
  const evaluaciones = numeros.map(x => ({ x, residuo: evaluarResiduoEcuacion(tipoEcuacion, coef, x) }));
  const fueraDeDominio = evaluaciones.filter(e => e.residuo === null);
  const evaluables = evaluaciones.filter(e => e.residuo !== null);

  if (evaluables.length === 0) {
    if (fueraDeDominio.length > 0) {
      return construirCajaVerificacion(
        'incorrecta',
        'Verificación por sustitución: el valor que escribiste anula el denominador.',
        'Ese valor vuelve indefinida la expresión fraccionaria (coincide con la restricción del dominio), por lo que no puede ser la solución de la ecuación.'
      );
    }
    return '';
  }

  const satisfacen = evaluables.filter(e => Math.abs(e.residuo) <= tolerancia);

  if (satisfacen.length === evaluables.length) {
    return construirCajaVerificacion(
      'correcta',
      'Verificación por sustitución: tu respuesta satisface la ecuación original.',
      'Al reemplazar tu valor en la ecuación planteada con los coeficientes que registraste, el resultado se reduce a (aproximadamente) cero.'
    );
  } else if (satisfacen.length > 0) {
    return construirCajaVerificacion(
      'parcial',
      'Verificación por sustitución: solo parte de tu respuesta satisface la ecuación.',
      `Al sustituir tus valores en la ecuación original, ${satisfacen.length} de ${evaluables.length} sí la reducen a cero y el resto no. Revisa los que no cumplieron.`
    );
  }
  return construirCajaVerificacion(
    'incorrecta',
    'Verificación por sustitución: tu respuesta no satisface la ecuación original.',
    'Al reemplazar tu valor en la ecuación planteada con los coeficientes registrados, el resultado no se acerca a cero. Repasa el despeje paso a paso.'
  );
}

// Mecanismo de verificación por sustitución para el sistema 2×2, que
// tiene DOS incógnitas (x, y) y por lo tanto requiere que el estudiante
// las haya escrito explícitamente como "x = ..." y "y = ...".
function verificarSustitucionSistema(intento, coef) {
  const coincidenciaX = intento.match(/\bx\s*=\s*(-?\d+(?:[.,]\d+)?)/i);
  const coincidenciaY = intento.match(/\by\s*=\s*(-?\d+(?:[.,]\d+)?)/i);

  if (!coincidenciaX || !coincidenciaY) {
    return construirCajaVerificacion(
      'info',
      'No se pudo verificar por sustitución directa en las dos ecuaciones.',
      'Para comprobar tu respuesta reemplazándola en el sistema original, escríbela de forma explícita como "x = ..., y = ...".'
    );
  }

  const x = parseFloat(coincidenciaX[1].replace(',', '.'));
  const y = parseFloat(coincidenciaY[1].replace(',', '.'));
  const residuo1 = coef.a1 * x + coef.b1 * y - coef.c1;
  const residuo2 = coef.a2 * x + coef.b2 * y - coef.c2;
  const tolerancia = toleranciaResiduo(coef);
  const cumple1 = Math.abs(residuo1) <= tolerancia;
  const cumple2 = Math.abs(residuo2) <= tolerancia;

  if (cumple1 && cumple2) {
    return construirCajaVerificacion(
      'correcta',
      'Verificación por sustitución: tu punto satisface ambas ecuaciones.',
      `Al reemplazar x = ${x}, y = ${y} en las dos ecuaciones del sistema original, ambas igualdades se cumplen.`
    );
  } else if (cumple1 || cumple2) {
    return construirCajaVerificacion(
      'parcial',
      'Verificación por sustitución: tu punto satisface solo una de las dos ecuaciones.',
      `Al sustituir x = ${x}, y = ${y}: la ${cumple1 ? 'primera' : 'segunda'} ecuación se cumple, pero la ${cumple1 ? 'segunda' : 'primera'} no.`
    );
  }
  return construirCajaVerificacion(
    'incorrecta',
    'Verificación por sustitución: tu punto no satisface el sistema original.',
    `Al reemplazar x = ${x}, y = ${y} en las dos ecuaciones, ninguna igualdad se cumple. Revisa el despeje por Cramer.`
  );
}

// Punto de entrada del mecanismo de verificación por sustitución. Se
// encarga de obtener los coeficientes reales del panel activo y de
// derivar hacia el caso de una incógnita o hacia el caso del sistema.
function verificarPorSustitucion(intento, tipoEcuacion) {
  if (!intento || !tipoEcuacion) return '';
  const coef = obtenerCoeficientesPorTipo(tipoEcuacion);
  if (!coef) return '';

  if (tipoEcuacion === 'sistema') {
    return verificarSustitucionSistema(intento, coef);
  }
  return verificarSustitucionUnaIncognita(intento, tipoEcuacion, coef);
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
                   <div><strong>Paso 3: Despeje formal dividiendo para $a$ $a = ${a} \\neq 0$</strong> $x = \\frac{${-b}}{${a}}$</div>
                   <div class="resultado-final"><strong>Resultado Formateado:</strong> $x = ${x.toFixed(4)}$</div>`;
  renderizarMatematicasGlobal();
}

function resolverFraccionaria() {
  const a = parseFloat(document.getElementById('frac-a').value) || 0;
  const b = parseFloat(document.getElementById('frac-b').value) || 0;
  const c = parseFloat(document.getElementById('frac-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El numerador $a$ no puede ser cero en una ecuación fraccionaria racional.</span>';
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
  pasos += `<div>$${a} = ${-c}(x + (${b})) \\implies x + (${b}) = \\frac{${a}}{${-c}} \\implies x + (${b}) = ${numPaso2.toFixed(4)}$</div>`;

  pasos += `<div><strong>Paso 4: Despeje Final de $x$:</strong></div>`;
  pasos += `<div>$x = ${numPaso2.toFixed(4)} - (${b})$</div>`;

  if (Math.abs(x - restriccion) < 0.0001) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">La solución generada ($x = ${x.toFixed(4)}$) coincide con la restricción del dominio ($x \\neq ${restriccion}$). Por lo tanto, la ecuación no tiene solución válida en $\\mathbb{R}$.</div>`;
  } else {
    pasos += `<div class="resultado-final">$x = ${x.toFixed(4)}$ La solución válida es: $x \\neq ${restriccion}$</div>`;
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

  // 1. Discriminante y valores base
  let bCuadrado = b * b;
  let cuatroAC = 4 * a * c;
  let discriminante = bCuadrado - cuatroAC;
  let dosA = 2 * a;
  let menosB = -b;

  // 2. Propiedades de la Parábola (Vértice, Eje de Simetría, Concavidad y Rango)
  let h = -b / (2 * a);
  let k = a * h * h + b * h + c;
  let concavidad = a > 0 ? 'Cóncava hacia arriba ($\\cup$)' : 'Cóncava hacia abajo ($\\cap$)';
  let tipoExtremo = a > 0 ? 'Mínimo absoluto' : 'Máximo absoluto';
  let rangoStr = a > 0 ? `[${k.toFixed(4)}, +\\infty)` : `(-\\infty, ${k.toFixed(4)}]`;

  let pasos = `<div><strong>Explicación Analítica:</strong> Se evalúan tanto las raíces algebraicas de la ecuación como las propiedades geométricas de la parábola $f(x) = ${a}x^2 + (${b})x + (${c})$.</div>`;
  pasos += `<div><strong>Paso 1: Identificación de coeficientes:</strong> $a = ${a},\\; b = ${b},\\; c = ${c}$</div>`;
  
  // Paso 2: Desglose del discriminante
  pasos += `<div><strong>Paso 2: Cálculo Detallado del Discriminante $\\Delta = b^2 - 4ac$</strong></div>`;
  pasos += `<div style="margin-left: 1rem;">• Elevación al cuadrado de $b$: $(${b})^2 = ${bCuadrado.toFixed(2)}$</div>`;
  pasos += `<div style="margin-left: 1rem;">• Multiplicación de $4 \\cdot a \\cdot c$: $4 \\cdot (${a}) \\cdot (${c}) = ${cuatroAC.toFixed(2)}$</div>`;
  pasos += `<div style="margin-left: 1rem;">• Sustitución y resta final: $\\Delta = ${bCuadrado.toFixed(2)} - (${cuatroAC.toFixed(2)}) = ${discriminante.toFixed(2)}$</div>`;

  // Paso 3: Aplicación detallada de la Fórmula General (Raíces)
  if (discriminante > 0) {
    let raizDisc = Math.sqrt(discriminante);
    let num1 = menosB + raizDisc;
    let num2 = menosB - raizDisc;
    let x1 = num1 / dosA;
    let x2 = num2 / dosA;

    pasos += `<div><strong>Paso 3: Aplicación Detallada de la Fórmula General $\\Delta > 0$</strong></div>`;
    pasos += `<div style="margin-left: 1rem;">• Sustitución general: $x = \\frac{-(${b}) \\pm \\sqrt{${discriminante.toFixed(2)}}}{2(${a})}$</div>`;
    pasos += `<div style="margin-left: 1rem;">• Extracción de la raíz cuadrada: $\\sqrt{${discriminante.toFixed(2)}} = ${raizDisc.toFixed(4)}$</div>`;
    pasos += `<div style="margin-left: 1rem;">• <strong>Cálculo de $x_1$ ($+$):</strong> $x_1 = \\frac{${menosB.toFixed(2)} + ${raizDisc.toFixed(4)}}{${dosA.toFixed(2)}} = ${x1.toFixed(4)}$</div>`;
    pasos += `<div style="margin-left: 1rem;">• <strong>Cálculo de $x_2$ ($-$) :</strong> $x_2 = \\frac{${menosB.toFixed(2)} - ${raizDisc.toFixed(4)}}{${dosA.toFixed(2)}} = ${x2.toFixed(4)}$</div>`;
    pasos += `<div class="resultado-final">Soluciones reales distintas: $x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$</div>`;

  } else if (discriminante === 0) {
    let x = menosB / dosA;

    pasos += `<div><strong>Paso 3: Aplicación Detallada de la Fórmula General ($$\\Delta = 0$$):</strong></div>`;
    pasos += `<div style="margin-left: 1rem;">• Como $\\sqrt{0} = 0$: $x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$</div>`;
    pasos += `<div class="resultado-final">Solución real doble: $x = ${x.toFixed(4)}$</div>`;

  } else {
    let absDisc = -discriminante;
    let raizDisc = Math.sqrt(absDisc);
    let parteReal = menosB / dosA;
    let parteImaginaria = raizDisc / dosA;

    pasos += `<div><strong>Paso 3: Aplicación Detallada de la Fórmula General ($\\Delta < 0$):</strong></div>`;
    pasos += `<div style="margin-left: 1rem;">• Unidad imaginaria: $\\sqrt{${discriminante.toFixed(2)}} = ${raizDisc.toFixed(4)}i$</div>`;
    pasos += `<div class="resultado-final">Soluciones complejas conjugadas: $x_1 = ${parteReal.toFixed(4)} + ${parteImaginaria.toFixed(4)}i, \\quad x_2 = ${parteReal.toFixed(4)} - ${parteImaginaria.toFixed(4)}i$</div>`;
  }

  // Paso 4: ANÁLISIS PRÁCTICO DE LAS PROPIEDADES DE LA PARÁBOLA
  pasos += `<div style="margin-top: 1.25rem; border-top: 2px dashed #cbd5e1; padding-top: 0.85rem;"><strong>Paso 4: Análisis Completo de las Propiedades de la Parábola:</strong></div>`;
  
  // 1. Vértice
  pasos += `<div>• <strong>Coordenadas del Vértice $V(h, k)$:</strong></div>`;
  pasos += `<div style="margin-left: 1rem;">$h = -\\frac{b}{2a} = -\\frac{${b}}{2(${a})} = ${h.toFixed(4)}$</div>`;
  pasos += `<div style="margin-left: 1rem;">$k = f(${h.toFixed(4)}) = ${a}(${h.toFixed(4)})^2 + (${b})(${h.toFixed(4)}) + (${c}) = ${k.toFixed(4)}$</div>`;
  pasos += `<div style="margin-left: 1rem;">$\\implies V(${h.toFixed(4)}, ${k.toFixed(4)})$</div>`;

  // 2. Eje de Simetría
  pasos += `<div>• <strong>Eje de Simetría:</strong> Recta vertical $x = ${h.toFixed(4)}$</div>`;

  // 3. Concavidad y Extremo
  pasos += `<div>• <strong>Orientación / Concavidad:</strong> Como $a = ${a} ${a > 0 ? '> 0' : '< 0'}$, la parábola es ${concavidad} y presenta un <strong>${tipoExtremo}</strong> en $y = ${k.toFixed(4)}$.</div>`;

  // 4. Corte Eje Y
  pasos += `<div>• <strong>Intersección con Eje $Y$ ($x = 0$):</strong> Punto $(0, c) = (0, ${c})$</div>`;

  // 5. Corte Eje X
  if (discriminante > 0) {
    let x1 = (menosB + Math.sqrt(discriminante)) / dosA;
    let x2 = (menosB - Math.sqrt(discriminante)) / dosA;
    pasos += `<div>• <strong>Intersecciones con Eje $X$ ($y = 0$):</strong> Puntos $(${x1.toFixed(4)}, 0)$ y $(${x2.toFixed(4)}, 0)$</div>`;
  } else if (discriminante === 0) {
    let x = menosB / dosA;
    pasos += `<div>• <strong>Intersección con Eje $X$ ($y = 0$):</strong> Punto de tangencia en $(${x.toFixed(4)}, 0)$ (coincide con el Vértice).</div>`;
  } else {
    pasos += `<div>• <strong>Intersecciones con Eje $X$ ($y = 0$):</strong> No existen intersecciones reales con el eje horizontal ($\\Delta < 0$).</div>`;
  }

  // 6. Dominio y Recorrido
  pasos += `<div>• <strong>Dominio y Recorrido:</strong></div>`;
  pasos += `<div style="margin-left: 1rem;">$\\text{Dom}(f) = \\mathbb{R} = (-\\infty, +\\infty)$</div>`;
  pasos += `<div style="margin-left: 1rem;">$\\text{Rec}(f) = ${rangoStr}$</div>`;

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
  let pasos = `<div><strong>Explicación:</strong> Aplicación de la Regla de Cramer mediante cálculo de determinantes ordenados.</div>`;
  pasos += `<div><strong>Paso 1: Determinante del Sistema:</strong></div>
               <div>$\\text{Det}(S) = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1} \\cdot ${b2}) - (${a2} \\cdot ${b1}) = ${detS}$</div>`;

  if (detS === 0) {
    pasos += `<div style="color:#ef4444; font-weight:bold; margin-top:0.5rem;">El determinante es cero. El sistema es Incompatible o Indeterminado (rectas paralelas o coincidentes).</div>`;
  } else {
    let detX = (c1 * b2) - (c2 * b1);
    let detY = (a1 * c2) - (a2 * c1);
    let x = detX / detS;
    let y = detY / detS;
    pasos += `<div><strong>Paso 2: Determinantes de las Incógnitas:</strong></div>
              <div>$\\text{Det}(X) = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = (${c1} \\cdot ${b2}) - (${c2} \\cdot ${b1}) = ${detX}$</div>
              <div>$\\text{Det}(Y) = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = (${a1} \\cdot ${c2}) - (${a2} \\cdot ${c1}) = ${detY}$</div>
              <div><strong>Paso 3: Cálculo del punto de intersección $(x, y):$</strong></div>
              <div class="resultado-final">$x = \\frac{\\text{Det}(X)}{\\text{Det}(S)} = \\frac{${detX}}{${detS}} = ${x.toFixed(4)}$</div>
              <div class="resultado-final">$y = \\frac{\\text{Det}(Y)}{\\text{Det}(S)} = \\frac{${detY}}{${detS}} = ${y.toFixed(4)}$</div>`;
  }
  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente $$a$$ no puede ser cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación:</strong></div>`;
  pasos += `<div>|${a}x + (${b})| = ${c}</div>`;

  if (c < 0) {
    pasos += `<div><strong>Paso 2: Análisis de Restricción del Valor Absoluto:</strong></div>`;
    pasos += `<div>Puesto que, el valor absoluto representa una distancia, no puede ser igual a un número negativo ($c = ${c} < 0$).</div>`;
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Conjunto Solución: $\\mathcal{S} = \\emptyset$ (Sin solución en $\\mathbb{R}$)</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  if (c === 0) {
    let x = -b / a;
    pasos += `<div><strong>Paso 2: Caso Único ($c = 0$):</strong></div>`;
    pasos += `<div>$${a}x + (${b}) = 0$</div>`;
    pasos += `<div><strong>Paso 3: Transposición del Término Independiente $b$:</strong></div>`;
    pasos += `<div>$${a}x = ${-b}$</div>`;
    pasos += `<div><strong>Paso 4: Despeje de $x$:</strong></div>`;
    pasos += `<div>$x = \\frac{${-b}}{${a}}$</div>`;
    pasos += `<div class="resultado-final">$x = ${x.toFixed(4)}$</div>`;
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  let x1 = (c - b) / a;
  let x2 = (-c - b) / a;

  pasos += `<div><strong>Paso 2: Aplicación de la Propiedad Fundamental ($c > 0$):</strong></div>`;
  pasos += `<div>La ecuación con valor absoluto se descompone en dos ecuaciones lineales:</div>`;
  pasos += `<div>• Caso 1 Cuando c es positivo: $${a}x + (${b}) = ${c}$</div>`;
  pasos += `<div>• Caso 2 Cuando c es negativo: $${a}x + (${b}) = ${-c}$</div>`;

  pasos += `<div><strong>Paso 3: Transposición de Términos Independientes:</strong></div>`;
  pasos += `<div>• Caso 1: $${a}x = ${c} - (${b}) \\implies ${a}x = ${(c - b).toFixed(4)}$</div>`;
  pasos += `<div>• Caso 2: $${a}x = ${-c} - (${b}) \\implies ${a}x = ${(-c - b).toFixed(4)}$</div>`;

  pasos += `<div><strong>Paso 4: Despeje Final de la Incógnita $x$:</strong></div>`;
  pasos += `<div>• Caso 1: $x_1 = \\frac{${(c - b).toFixed(4)}}{${a}} = ${x1.toFixed(4)}$</div>`;
  pasos += `<div>• Caso 2: $x_2 = \\frac{${(-c - b).toFixed(4)}}{${a}} = ${x2.toFixed(4)}$</div>`;

  pasos += `<div class="resultado-final">$x_1 = ${x1.toFixed(4)}$</div>`;
  pasos += `<div class="resultado-final">$x_2 = ${x2.toFixed(4)}$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/* =========================================================================
   LÓGICA POLINÓMICA: CÚBICA, CUÁRTICA, QUÍNTICA, DE SEXTO GRADO CON RUFFINI
   ====================================================================== */
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Cúbica:</strong></div>`;
  pasos += `<div>$P(x) = ${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0$</div>`;

  if (d === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $x$:</strong></div>`;
    pasos += `<div>$P(x) = x \\cdot (${a}x^2 + (${b})x + (${c})) = 0$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $x_1 = 0$</div>`;
    pasos += resolverCuadraticaResidual(a, b, c, 2);
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(d);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Aplicación del Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores del término independiente $d = ${d}$ ($p$): $\\mathcal{\\{}${pList.join(', ')}\\mathcal{\\}}$</div>`;
  pasos += `<div>• Divisores del coeficiente principal $a = ${a}$ ($q$): $\\mathcal{\\{}${qList.join(', ')}\\mathcal{\\}}$</div>`;
  pasos += `<div>• Raíces candidatas ($\\pm p/q$): $\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$</div>`;

  const P = (x) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  let raizEncontrada = null;

  for (let r of candidatos) {
    if (Math.abs(P(r)) < 0.000001) {
      raizEncontrada = r;
      break;
    }
  }

  if (raizEncontrada === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> No se encontraron raíces racionales enteras simples.</div>`;
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
  pasos += `<div>Probando $x = ${k}$: $P(${k}) = 0$. <span class="resultado-final">$x_1 = ${k}$ es una raíz exacta.</span></div>`;
  
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

  pasos += `<div>Polinomio cuadrático reducido: $(${a})x^2 + (${coef2})x + (${coef3}) = 0$</div>`;
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ no puede ser cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Cuártica:</strong></div>`;
  pasos += `<div>$P(x) = ${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e}) = 0$</div>`;

  if (e === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $x$:</strong></div>`;
    pasos += `<div>$P(x) = x \\cdot (${a}x^3 + (${b})x^2 + (${c})x + (${d})) = 0$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $x_1 = 0$</div>`;
    res.innerHTML = pasos + resolverCubicaAuxiliar(a, b, c, d, 2);
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(e);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Raíces candidatas ($\\pm p/q$): $\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$</div>`;

  const P = (x) => a * Math.pow(x, 4) + b * Math.pow(x, 3) + c * Math.pow(x, 2) + d * x + e;
  let r1 = null;

  for (let cand of candidatos) {
    if (Math.abs(P(cand)) < 0.000001) {
      r1 = cand;
      break;
    }
  }

  if (r1 === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Nota:</strong> No se encontraron raíces racionales enteras exactas.</div>`;
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
  pasos += `<div>Raíz hallada: <span class="resultado-final">$x_1 = ${k1}$</span></div>`;
  
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
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación Quíntica:</strong></div>`;
  pasos += `<div>$P(x) = ${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f}) = 0$</div>`;

  if (f === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $x$:</strong></div>`;
    pasos += `<div>$P(x) = x \\cdot (${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e})) = 0$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $x_1 = 0$</div>`;
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
  pasos += `<div>• Raíces candidatas ($\\pm p/q$): $\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$</div>`;

  const P = (x) => a * Math.pow(x, 5) + b * Math.pow(x, 4) + c * Math.pow(x, 3) + d * Math.pow(x, 2) + e * x + f;
  let r1 = null;

  for (let cand of candidatos) {
    if (Math.abs(P(cand)) < 0.000001) {
      r1 = cand;
      break;
    }
  }

  if (r1 === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Fundamento Teórico (Teorema de Abel-Ruffini):</strong> Las ecuaciones de grado $\\ge 5$ carecen de fórmulas algebraicas generales por radicales si no presentan raíces racionales exactas.</div>`;
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

  pasos += `<div><strong>Paso 3: División Sintética (Ruffini):</strong></div>`;
  pasos += `<div>Raíz hallada: <span class="resultado-final">$x_1 = ${k1}$</span></div>`;
  
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

function resolverSextica() {
  const a = parseFloat(document.getElementById('sext-a').value) || 0;
  const b = parseFloat(document.getElementById('sext-b').value) || 0;
  const c = parseFloat(document.getElementById('sext-c').value) || 0;
  const d = parseFloat(document.getElementById('sext-d').value) || 0;
  const e = parseFloat(document.getElementById('sext-e').value) || 0;
  const f = parseFloat(document.getElementById('sext-f').value) || 0;
  const g = parseFloat(document.getElementById('sext-g').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error de definición: El coeficiente principal $$a$$ debe ser distinto de cero.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  let pasos = `<div><strong>Paso 1: Planteamiento de la Ecuación de Sexto Grado (Séxtica):</strong></div>`;
  pasos += `<div>$P(x) = ${a}x^6 + (${b})x^5 + (${c})x^4 + (${d})x^3 + (${e})x^2 + (${f})x + (${g}) = 0$</div>`;

  if (g === 0) {
    pasos += `<div><strong>Paso 2: Factorización por Término Común $x$:</strong></div>`;
    pasos += `<div>$P(x) = x \\cdot (${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f})) = 0$</div>`;
    pasos += `<div class="resultado-final">Primera raíz evidente: $x_1 = 0$</div>`;
    res.innerHTML = pasos + resolverQuinticaAuxiliar(a, b, c, d, e, f, 2);
    renderizarMatematicasGlobal();
    return;
  }

  const pList = obtenerDivisores(g);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));
  candidatos.sort((x, y) => x - y);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores del término independiente $g = ${g}$ ($p$): $\\mathcal{\\{}${pList.join(', ')}\\mathcal{\\}}$</div>`;
  pasos += `<div>• Divisores del coeficiente principal $a = ${a}$ ($q$): $\\mathcal{\\{}${qList.join(', ')}\\mathcal{\\}}$</div>`;
  pasos += `<div>• Raíces candidatas ($\\pm p/q$): $\\mathcal{\\{}${candidatos.map(v => Number(v.toFixed(2))).join(', ')}\\mathcal{\\}}$</div>`;

  const P = (x) => a * Math.pow(x, 6) + b * Math.pow(x, 5) + c * Math.pow(x, 4) + d * Math.pow(x, 3) + e * Math.pow(x, 2) + f * x + g;
  let r1 = null;

  for (let cand of candidatos) {
    if (Math.abs(P(cand)) < 0.000001) {
      r1 = cand;
      break;
    }
  }

  if (r1 === null) {
    pasos += `<div style="color:#b91c1c; margin-top:0.5rem;"><strong>Fundamento Teórico (Teorema de Abel-Ruffini):</strong> Las ecuaciones de grado $\\ge 5$ carecen de fórmulas algebraicas generales por radicales si no presentan raíces racionales exactas.</div>`;
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
  let c6 = f + m5;
  let m6 = c6 * k1;
  let residuo1 = g + m6;

  pasos += `<div><strong>Paso 3: División Sintética (Ruffini):</strong></div>`;
  pasos += `<div>Raíz hallada: <span class="resultado-final">$x_1 = ${k1}$</span></div>`;

  pasos += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${k1}</td>
        <td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${e}</td><td>${f}</td><td>${g}</td>
      </tr>
      <tr>
        <td class="col-raiz">↓</td>
        <td>—</td>
        <td>${m1 >= 0 ? '+' + m1 : m1}</td>
        <td>${m2 >= 0 ? '+' + m2 : m2}</td>
        <td>${m3 >= 0 ? '+' + m3 : m3}</td>
        <td>${m4 >= 0 ? '+' + m4 : m4}</td>
        <td>${m5 >= 0 ? '+' + m5 : m5}</td>
        <td>${m6 >= 0 ? '+' + m6 : m6}</td>
      </tr>
      <tr>
        <td class="col-raiz">Quíntico</td>
        <td><strong>${a}</strong></td>
        <td><strong>${c2}</strong></td>
        <td><strong>${c3}</strong></td>
        <td><strong>${c4}</strong></td>
        <td><strong>${c5}</strong></td>
        <td><strong>${c6}</strong></td>
        <td class="residuo-cero">${Math.abs(residuo1) < 0.0001 ? 0 : residuo1}</td>
      </tr>
    </table>
  </div>`;

  pasos += resolverQuinticaAuxiliar(a, c2, c3, c4, c5, c6, 2);
  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

function resolverQuinticaAuxiliar(a, b, c, d, e, f, indiceInicio) {
  let html = `<div style="margin-top:1rem;"><strong>Resolución del Polinomio Quíntico Reducido:</strong></div>`;
  const P5 = (x) => a * Math.pow(x, 5) + b * Math.pow(x, 4) + c * Math.pow(x, 3) + d * Math.pow(x, 2) + e * x + f;

  const pList = obtenerDivisores(f);
  const qList = obtenerDivisores(a);
  let candidatos = [];
  pList.forEach(p => qList.forEach(q => {
    let val = p / q;
    if (!candidatos.includes(val)) candidatos.push(val);
  }));

  let r2 = null;
  for (let cand of candidatos) {
    if (Math.abs(P5(cand)) < 0.000001) {
      r2 = cand;
      break;
    }
  }

  if (r2 === null) {
    return html + `<div style="color:#b91c1c;">No se encontraron más raíces racionales exactas para la sub-ecuación quíntica.</div>
      <div style="color:#b91c1c; margin-top:0.5rem;"><strong>Fundamento Teórico (Teorema de Abel-Ruffini):</strong> Las ecuaciones de grado $\\ge 5$ carecen de fórmulas algebraicas generales por radicales si no presentan raíces racionales exactas.</div>`;
  }

  let m1 = a * r2;
  let c2 = b + m1;
  let m2 = c2 * r2;
  let c3 = c + m2;
  let m3 = c3 * r2;
  let c4 = d + m3;
  let m4 = c4 * r2;
  let c5 = e + m4;
  let m5 = c5 * r2;
  let residuo2 = f + m5;

  html += `<div>Evaluando $x = ${r2}$: Raíz obtenida: <span class="resultado-final">$x_${indiceInicio} = ${r2}$</span></div>`;
  html += `<div class="tabla-ruffini-container">
    <table class="tabla-ruffini">
      <tr>
        <td class="col-raiz">x = ${r2}</td>
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
        <td class="residuo-cero">${Math.abs(residuo2) < 0.0001 ? 0 : residuo2}</td>
      </tr>
    </table>
  </div>`;

  html += resolverCuarticaAuxiliar(a, c2, c3, c4, c5, indiceInicio + 1);
  return html;
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

  html += `<div>Evaluando $x = ${r2}$: Raíz obtenida: <span class="resultado-final">$x_${indiceInicio} = ${r2}$</span></div>`;
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

  html += `<div>Evaluando $x = ${r2}$: Raíz obtenida: <span class="resultado-final">$x_${indiceInicio} = ${r2}$</span></div>`;
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
  html += `<div>Aplicando la fórmula general a $${a2}x^2 + (${b2})x + (${c2}) = 0$:</div>`;
  
  let disc = (b2 * b2) - (4 * a2 * c2);
  html += `<div>Discriminante: $\\Delta = (${b2})^2 - 4(${a2})(${c2}) = ${disc.toFixed(2)}$</div>`;

  if (disc > 0) {
    let x2 = (-b2 + Math.sqrt(disc)) / (2 * a2);
    let x3 = (-b2 - Math.sqrt(disc)) / (2 * a2);
    html += `<div class="resultado-final">$x_${indiceInicio} = \\frac{-(${b2}) + \\sqrt{${disc.toFixed(2)}}}{2(${a2})} = ${x2.toFixed(4)}$</div>`;
    html += `<div class="resultado-final">$x_${indiceInicio + 1} = \\frac{-(${b2}) - \\sqrt{${disc.toFixed(2)}}}{2(${a2})} = ${x3.toFixed(4)}$</div>`;
  } else if (disc === 0) {
    let x2 = -b2 / (2 * a2);
    html += `<div class="resultado-final">$x_${indiceInicio} = x_${indiceInicio + 1} = ${x2.toFixed(4)}$ (Raíz de multiplicidad 2)</div>`;
  } else {
    let pReal = -b2 / (2 * a2);
    let pImag = Math.sqrt(-disc) / (2 * a2);
    html += `<div class="resultado-final">$x_${indiceInicio} = ${pReal.toFixed(2)} + ${pImag.toFixed(2)}i$</div>`;
    html += `<div class="resultado-final">$x_${indiceInicio + 1} = ${pReal.toFixed(2)} - ${pImag.toFixed(2)}i$</div>`;
  }

  return html;
}
