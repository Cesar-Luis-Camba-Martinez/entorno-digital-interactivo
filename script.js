/* ==========================================================================
   ENTORNO DIGITAL DE ÁLGEBRA - LÓGICA PRINCIPAL Y RESOLUTOR MATEMÁTICO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  actualizarFormulario();
});

// Cambiar pestañas principales
function cambiarPestana(pestanaId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  if (pestanaId === 'resolutor') {
    document.getElementById('sec-resolutor').classList.add('active');
    event.currentTarget.classList.add('active');
  } else if (pestanaId === 'teoria') {
    document.getElementById('sec-teoria').classList.add('active');
    event.currentTarget.classList.add('active');
    renderKaTeXInTeoria();
  }
}

// Control de Modales
function abrirModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
  if (modalId === 'modalGraficadora') {
    setTimeout(dibujarGrafico2D, 200);
  }
  if (window.KaTeX) {
    renderMathInElement(document.getElementById(modalId));
  }
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

// Renderizado Auxiliar de KaTeX
function renderMathInElement(element) {
  if (!window.katex) return;
  // Utilizar el reemplazo seguro para renderizar KaTeX dinámicamente
  const html = element.innerHTML;
  // KaTeX render manual sobre elementos que contengan $$
}

function renderKaTeXInTeoria() {
  const elementos = document.querySelectorAll('.teoria-item .formula-box');
  elementos.forEach(el => {
    let txt = el.textContent.replace(/\$\$/g, '');
    try {
      katex.render(txt, el, { displayMode: true, throwOnError: false });
    } catch (e) {
      console.error(e);
    }
  });
}

// Generación Dinámica de Campos
function actualizarFormulario() {
  const tipo = document.getElementById('tipoProblema').value;
  const contenedor = document.getElementById('camposEntrada');
  contenedor.innerHTML = '';

  let html = '';

  switch (tipo) {
    case 'lineal':
      html = `
        <div class="form-group"><label>Coeficiente a (x):</label><input type="number" id="a" class="input-control" value="2"></div>
        <div class="form-group"><label>Término independiente b:</label><input type="number" id="b" class="input-control" value="-6"></div>
      `;
      break;
    case 'cuadratica':
      html = `
        <div class="form-group"><label>Coeficiente a (x²):</label><input type="number" id="a" class="input-control" value="1"></div>
        <div class="form-group"><label>Coeficiente b (x):</label><input type="number" id="b" class="input-control" value="-5"></div>
        <div class="form-group"><label>Término independiente c:</label><input type="number" id="c" class="input-control" value="6"></div>
      `;
      break;
    case 'cubica':
      html = `
        <div class="form-group"><label>a (x³):</label><input type="number" id="a" class="input-control" value="1"></div>
        <div class="form-group"><label>b (x²):</label><input type="number" id="b" class="input-control" value="-6"></div>
        <div class="form-group"><label>c (x):</label><input type="number" id="c" class="input-control" value="11"></div>
        <div class="form-group"><label>d (indep.):</label><input type="number" id="d" class="input-control" value="-6"></div>
      `;
      break;
    case 'cuartica':
      html = `
        <div class="form-group"><label>a (x⁴):</label><input type="number" id="a" class="input-control" value="1"></div>
        <div class="form-group"><label>b (x³):</label><input type="number" id="b" class="input-control" value="-2"></div>
        <div class="form-group"><label>c (x²):</label><input type="number" id="c" class="input-control" value="-1"></div>
        <div class="form-group"><label>d (x):</label><input type="number" id="d" class="input-control" value="2"></div>
        <div class="form-group"><label>e (indep.):</label><input type="number" id="e" class="input-control" value="0"></div>
      `;
      break;
    case 'quintica':
      html = `
        <div class="form-group"><label>a (x⁵):</label><input type="number" id="a" class="input-control" value="1"></div>
        <div class="form-group"><label>b (x⁴):</label><input type="number" id="b" class="input-control" value="-5"></div>
        <div class="form-group"><label>c (x³):</label><input type="number" id="c" class="input-control" value="5"></div>
        <div class="form-group"><label>d (x²):</label><input type="number" id="d" class="input-control" value="5"></div>
        <div class="form-group"><label>e (x):</label><input type="number" id="e" class="input-control" value="-6"></div>
        <div class="form-group"><label>f (indep.):</label><input type="number" id="f" class="input-control" value="0"></div>
      `;
      break;
    case 'sistema2x2':
      html = `
        <div class="form-group"><label>Ecuación 1: a1·x + b1·y = c1</label>
          <div class="form-inline">
            <input type="number" id="a1" class="input-control" placeholder="a1" value="2">
            <input type="number" id="b1" class="input-control" placeholder="b1" value="3">
            <input type="number" id="c1" class="input-control" placeholder="c1" value="12">
          </div>
        </div>
        <div class="form-group"><label>Ecuación 2: a2·x + b2·y = c2</label>
          <div class="form-inline">
            <input type="number" id="a2" class="input-control" placeholder="a2" value="1">
            <input type="number" id="b2" class="input-control" placeholder="b2" value="-1">
            <input type="number" id="c2" class="input-control" placeholder="c2" value="1">
          </div>
        </div>
      `;
      break;
    case 'sistema3x3':
      html = `
        <div class="form-group"><label>Ec 1: a1·x + b1·y + c1·z = d1</label>
          <div class="form-inline">
            <input type="number" id="a1" class="input-control" value="1">
            <input type="number" id="b1" class="input-control" value="2">
            <input type="number" id="c1" class="input-control" value="1">
            <input type="number" id="d1" class="input-control" value="8">
          </div>
        </div>
        <div class="form-group"><label>Ec 2: a2·x + b2·y + c2·z = d2</label>
          <div class="form-inline">
            <input type="number" id="a2" class="input-control" value="2">
            <input type="number" id="b2" class="input-control" value="1">
            <input type="number" id="c2" class="input-control" value="-1">
            <input type="number" id="d2" class="input-control" value="1">
          </div>
        </div>
        <div class="form-group"><label>Ec 3: a3·x + b3·y + c3·z = d3</label>
          <div class="form-inline">
            <input type="number" id="a3" class="input-control" value="1">
            <input type="number" id="b3" class="input-control" value="-1">
            <input type="number" id="c3" class="input-control" value="3">
            <input type="number" id="d3" class="input-control" value="8">
          </div>
        </div>
      `;
      break;
  }

  contenedor.innerHTML = html;
}

// Función principal de resolución
function resolver() {
  const tipo = document.getElementById('tipoProblema').value;
  let resHTML = '';

  switch (tipo) {
    case 'lineal':
      resHTML = resolverLineal();
      break;
    case 'cuadratica':
      resHTML = resolverCuadratica();
      break;
    case 'cubica':
      resHTML = resolverPolinomica(3);
      break;
    case 'cuartica':
      resHTML = resolverCuartica();
      break;
    case 'quintica':
      resHTML = resolverQuintica();
      break;
    case 'sistema2x2':
      resHTML = resolverSistema2x2();
      break;
    case 'sistema3x3':
      resHTML = resolverSistema3x3();
      break;
  }

  const divRes = document.getElementById('contenidoSolucion');
  divRes.innerHTML = resHTML;
  document.getElementById('areaResultado').classList.remove('hidden');

  // Renderizar KaTeX en las fórmulas inyectadas
  renderMathInContainer(divRes);
}

function renderMathInContainer(container) {
  const mathBlocks = container.querySelectorAll('.math');
  mathBlocks.forEach(el => {
    const tex = el.getAttribute('data-tex') || el.textContent;
    const isDisplay = el.classList.contains('display');
    try {
      katex.render(tex, el, { displayMode: isDisplay, throwOnError: false });
    } catch (e) {
      console.error(e);
    }
  });
}

// Helper para envolver código LaTeX que será renderizado por KaTeX sin escapar barras
function math(tex, display = false) {
  const cls = display ? 'math display' : 'math';
  return `<span class="${cls}" data-tex="${escapeHtml(tex)}"></span>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --------------------------------------------------------------------------
// RESOLUTORES MATEMÁTICOS ESPECÍFICOS (SINTAXIS KATEX CORREGIDA)
// --------------------------------------------------------------------------

function resolverLineal() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);

  if (isNaN(a) || isNaN(b)) return 'Por favor ingrese números válidos.';
  if (a === 0) {
    return b === 0 ? '<div>La ecuación es una identidad (infinitas soluciones).</div>' : '<div>La ecuación es una contradicción (sin solución).</div>';
  }

  const x = -b / a;
  let pasos = `<div class="paso-titulo">Ecuación Formulada:</div>`;
  pasos += `<div class="formula-box">${math(`${a}x + (${b}) = 0`, true)}</div>`;
  pasos += `<div><strong>Paso 1: Transposición del término independiente:</strong></div>`;
  pasos += `<div class="formula-box">${math(`${a}x = ${-b}`, true)}</div>`;
  pasos += `<div><strong>Paso 2: Despejar la variable x dividiendo entre el coeficiente a:</strong></div>`;
  pasos += `<div class="formula-box">${math(`x = \\frac{${-b}}{${a}} = ${x}`, true)}</div>`;
  pasos += `<div><strong style="color:var(--primary-color)">Solución Final:</strong> ${math(`x = ${x}`)}</div>`;

  return pasos;
}

function resolverCuadratica() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);

  if (isNaN(a) || isNaN(b) || isNaN(c)) return 'Por favor ingrese coeficientes válidos.';
  if (a === 0) return 'El coeficiente "a" no puede ser cero en una ecuación cuadrática.';

  const disc = b * b - 4 * a * c;
  let pasos = `<div class="paso-titulo">Ecuación Cuadrática:</div>`;
  pasos += `<div class="formula-box">${math(`${a}x^2 + (${b})x + (${c}) = 0`, true)}</div>`;
  pasos += `<div><strong>Paso 1: Cálculo del Discriminante (${math('\\Delta = b^2 - 4ac')}):</strong></div>`;
  pasos += `<div class="formula-box">${math(`\\Delta = (${b})^2 - 4(${a})(${c}) = ${disc}`, true)}</div>`;

  if (disc > 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    pasos += `<div>Como ${math('\\Delta > 0')}, existen dos soluciones reales distintas:</div>`;
    pasos += `<div class="formula-box">${math(`x_1 = \\frac{-(${b}) + \\sqrt{${disc}}}{2(${a})} = ${x1.toFixed(4)}`, true)}</div>`;
    pasos += `<div class="formula-box">${math(`x_2 = \\frac{-(${b}) - \\sqrt{${disc}}}{2(${a})} = ${x2.toFixed(4)}`, true)}</div>`;
  } else if (disc === 0) {
    const x = -b / (2 * a);
    pasos += `<div>Como ${math('\\Delta = 0')}, existe una única solución real doble:</div>`;
    pasos += `<div class="formula-box">${math(`x = \\frac{-(${b})}{2(${a})} = ${x}`, true)}</div>`;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
    pasos += `<div>Como ${math('\\Delta < 0')}, existen dos soluciones complejas conjugadas:</div>`;
    pasos += `<div class="formula-box">${math(`x_1 = ${real} + ${imag}i`, true)}</div>`;
    pasos += `<div class="formula-box">${math(`x_2 = ${real} - ${imag}i`, true)}</div>`;
  }

  return pasos;
}

// Obtener divisores enteros para Teorema de Raíz Racional
function obtenerDivisores(n) {
  n = Math.abs(n);
  const divs = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      divs.push(i);
      divs.push(-i);
    }
  }
  return [...new Set(divs)].sort((x, y) => x - y);
}

function resolverPolinomica(grado) {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);
  const d = parseFloat(document.getElementById('d').value);

  let pasos = `<div class="paso-titulo">Polinomio de Grado ${grado}:</div>`;
  pasos += `<div class="formula-box">${math(`${a}x^3 + (${b})x^2 + (${c})x + (${d}) = 0`, true)}</div>`;

  const pList = obtenerDivisores(d);
  const qList = obtenerDivisores(a);

  let candidatos = [];
  pList.forEach(p => {
    qList.forEach(q => {
      candidatos.push(p / q);
    });
  });
  candidatos = [...new Set(candidatos)].sort((x, y) => x - y);

  // CORRECCIÓN DE FORMATO KATEX SIN BARRAS SUELTAS
  pasos += `<div><strong>Paso 2: Aplicación del Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores del término independiente $d = ${d}$ ($p$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores del coeficiente principal $a = ${a}$ ($q$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Posibles raíces (${math('\\pm p/q')}): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  // Evaluación mediante Ruffini
  let raizEncontrada = null;
  for (let r of candidatos) {
    let evalVal = a * Math.pow(r, 3) + b * Math.pow(r, 2) + c * r + d;
    if (Math.abs(evalVal) < 1e-6) {
      raizEncontrada = r;
      break;
    }
  }

  if (raizEncontrada !== null) {
    pasos += `<div class="mt-2"><strong>Paso 3: Raíz encontrada por División Sintética (Ruffini):</strong></div>`;
    pasos += `<div>Se verifica que ${math(`x = ${raizEncontrada}`)} es raíz. Factorizando ${math(`(x - ${raizEncontrada})`)}:</div>`;
    
    // Coeficientes cuadráticos resultantes
    const a_cuad = a;
    const b_cuad = b + a * raizEncontrada;
    const c_cuad = c + b_cuad * raizEncontrada;

    pasos += `<div class="formula-box">${math(`(x - ${raizEncontrada})(${a_cuad}x^2 + (${b_cuad})x + (${c_cuad})) = 0`, true)}</div>`;
  } else {
    pasos += `<div class="mt-2">No se encontraron raíces racionales enteras simples. Se recomienda método numérico.</div>`;
  }

  return pasos;
}

function resolverCuartica() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);
  const d = parseFloat(document.getElementById('d').value);
  const e = parseFloat(document.getElementById('e').value);

  let pasos = `<div class="paso-titulo">Ecuación Cuártica (4to Grado):</div>`;
  pasos += `<div class="formula-box">${math(`${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e}) = 0`, true)}</div>`;

  const pList = obtenerDivisores(e === 0 ? 1 : e);
  const qList = obtenerDivisores(a);

  let candidatos = [];
  pList.forEach(p => qList.forEach(q => candidatos.push(p / q)));
  candidatos = [...new Set(candidatos)].sort((x, y) => x - y);

  // CORRECCIÓN DE FORMATO KATEX SIN BARRAS SUELTAS
  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores del término independiente $e = ${e}$ ($p$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores del coeficiente $a = ${a}$ ($q$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Raíces racionales candidatas (${math('\\pm p/q')}): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  if (e === 0) {
    pasos += `<div class="mt-2"><strong>Paso 3: Factorización del término común x:</strong></div>`;
    pasos += `<div class="formula-box">${math(`x(${a}x^3 + (${b})x^2 + (${c})x + (${d})) = 0`, true)}</div>`;
    pasos += `<div>Una raíz es ${math('x_1 = 0')}. Las demás se obtienen resolviendo la ecuación cúbica residual.</div>`;
  }

  return pasos;
}

function resolverQuintica() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);
  const d = parseFloat(document.getElementById('d').value);
  const e = parseFloat(document.getElementById('e').value);
  const f = parseFloat(document.getElementById('f').value);

  let pasos = `<div class="paso-titulo">Ecuación Quíntica (5to Grado):</div>`;
  pasos += `<div class="formula-box">${math(`${a}x^5 + (${b})x^4 + (${c})x^3 + (${d})x^2 + (${e})x + (${f}) = 0`, true)}</div>`;

  const pList = obtenerDivisores(f === 0 ? 1 : f);
  const qList = obtenerDivisores(a);

  let candidatos = [];
  pList.forEach(p => qList.forEach(q => candidatos.push(p / q)));
  candidatos = [...new Set(candidatos)].sort((x, y) => x - y);

  // CORRECCIÓN DE FORMATO KATEX SIN BARRAS SUELTAS
  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $f = ${f}$ ($p$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores de $a = ${a}$ ($q$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Posibles raíces (${math('\\pm p/q')}): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  if (f === 0) {
    pasos += `<div class="mt-2"><strong>Paso 3: Extracción de factor común x:</strong></div>`;
    pasos += `<div class="formula-box">${math(`x(${a}x^4 + (${b})x^3 + (${c})x^2 + (${d})x + (${e})) = 0`, true)}</div>`;
    pasos += `<div>Solución trivial: ${math('x_1 = 0')}.</div>`;
  }

  return pasos;
}

// Resolutor Sistema 2x2 mediante Regla de Cramer
function resolverSistema2x2() {
  const a1 = parseFloat(document.getElementById('a1').value);
  const b1 = parseFloat(document.getElementById('b1').value);
  const c1 = parseFloat(document.getElementById('c1').value);
  const a2 = parseFloat(document.getElementById('a2').value);
  const b2 = parseFloat(document.getElementById('b2').value);
  const c2 = parseFloat(document.getElementById('c2').value);

  const detS = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  let pasos = `<div class="paso-titulo">Sistema 2x2 planteado:</div>`;
  pasos += `<div class="formula-box">${math(`\\begin{cases} ${a1}x + ${b1}y = ${c1} \\\\ ${a2}x + ${b2}y = ${c2} \\end{cases}`, true)}</div>`;

  pasos += `<div><strong>Paso 1: Calculo del Determinante Principal (${math('\\Delta')}):</strong></div>`;
  pasos += `<div class="formula-box">${math(`\\Delta = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${a2})(${b1}) = ${detS}`, true)}</div>`;

  if (detS === 0) {
    if (detX === 0 && detY === 0) {
      pasos += `<div>Como ${math('\\Delta = 0')} y ${math('\\Delta_x = 0')}, el sistema es <strong>Compatible Indeterminado</strong> (infinitas soluciones).</div>`;
    } else {
      pasos += `<div>Como ${math('\\Delta = 0')} y ${math('\\Delta_x \\neq 0')}, el sistema es <strong>Incompatible</strong> (sin solución).</div>`;
    }
  } else {
    const x = detX / detS;
    const y = detY / detS;
    pasos += `<div><strong>Paso 2: Cálculo de determinantes específicos:</strong></div>`;
    pasos += `<div class="formula-box">${math(`\\Delta_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = ${detX}, \\quad \\Delta_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = ${detY}`, true)}</div>`;
    pasos += `<div><strong>Paso 3: Aplicación de la Regla de Cramer:</strong></div>`;
    pasos += `<div class="formula-box">${math(`x = \\frac{\\Delta_x}{\\Delta} = \\frac{${detX}}{${detS}} = ${x}`, true)}</div>`;
    pasos += `<div class="formula-box">${math(`y = \\frac{\\Delta_y}{\\Delta} = \\frac{${detY}}{${detS}} = ${y}`, true)}</div>`;
  }

  return pasos;
}

// Resolutor Sistema 3x3 por Cramer
function resolverSistema3x3() {
  const a1 = parseFloat(document.getElementById('a1').value), b1 = parseFloat(document.getElementById('b1').value), c1 = parseFloat(document.getElementById('c1').value), d1 = parseFloat(document.getElementById('d1').value);
  const a2 = parseFloat(document.getElementById('a2').value), b2 = parseFloat(document.getElementById('b2').value), c2 = parseFloat(document.getElementById('c2').value), d2 = parseFloat(document.getElementById('d2').value);
  const a3 = parseFloat(document.getElementById('a3').value), b3 = parseFloat(document.getElementById('b3').value), c3 = parseFloat(document.getElementById('c3').value), d3 = parseFloat(document.getElementById('d3').value);

  function det3x3(m) {
    return m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1]) -
           m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
           m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
  }

  const MS = [[a1,b1,c1],[a2,b2,c2],[a3,b3,c3]];
  const MX = [[d1,b1,c1],[d2,b2,c2],[d3,b3,c3]];
  const MY = [[a1,d1,c1],[a2,d2,c2],[a3,d3,c3]];
  const MZ = [[a1,b1,d1],[a2,b2,d2],[a3,b3,d3]];

  const dS = det3x3(MS);
  const dX = det3x3(MX);
  const dY = det3x3(MY);
  const dZ = det3x3(MZ);

  let pasos = `<div class="paso-titulo">Sistema 3x3 Planteado:</div>`;
  pasos += `<div class="formula-box">${math(`\\begin{cases} ${a1}x + ${b1}y + ${c1}z = ${d1} \\\\ ${a2}x + ${b2}y + ${c2}z = ${d2} \\\\ ${a3}x + ${b3}y + ${c3}z = ${d3} \\end{cases}`, true)}</div>`;

  pasos += `<div><strong>Determinante del Sistema (${math('\\Delta')}):</strong> ${dS}</div>`;

  if (dS !== 0) {
    pasos += `<div class="formula-box">${math(`x = \\frac{${dX}}{${dS}} = ${dX/dS}, \\quad y = \\frac{${dY}}{${dS}} = ${dY/dS}, \\quad z = \\frac{${dZ}}{${dS}} = ${dZ/dS}`, true)}</div>`;
  } else {
    pasos += `<div>El sistema no tiene solución única (Determinante igual a 0).</div>`;
  }

  return pasos;
}

// --------------------------------------------------------------------------
// LIMPIEZA Y EXPORTACIÓN
// --------------------------------------------------------------------------

function limpiarResolutor() {
  document.getElementById('areaResultado').classList.add('hidden');
  actualizarFormulario();
}

function exportarPDF() {
  const elemento = document.getElementById('contenidoSolucion');
  const opt = {
    margin:       0.5,
    filename:     'solucion_algebra_uefgj.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(elemento).save();
}

function exportarWord() {
  const contenido = document.getElementById('contenidoSolucion').innerText;
  const blob = new Blob(['\ufeff' + contenido], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solucion_algebra.doc';
  a.click();
}

// --------------------------------------------------------------------------
// FILTRADO DE MÓDULOS TEÓRICOS
// --------------------------------------------------------------------------

function filtrarTeoria() {
  const query = document.getElementById('inputBuscarTeoria').value.toLowerCase();
  const tarjetas = document.querySelectorAll('.teoria-item');

  tarjetas.forEach(card => {
    const texto = card.getAttribute('data-tema') + ' ' + card.innerText.toLowerCase();
    if (texto.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// --------------------------------------------------------------------------
// LÓGICA DE MODALES ADICIONALES (ERCA, MATRICES, GRAFICADORA, EVALUACIÓN)
// --------------------------------------------------------------------------

function validarErca() {
  const val = parseFloat(document.getElementById('inputErcaRes').value);
  const feedback = document.getElementById('feedbackErca');
  if (val === 4) {
    feedback.className = 'feedback-msg success';
    feedback.innerText = '¡Correcto! 2x + 3 = 11 => 2x = 8 => x = 4 kg por bolsa.';
  } else {
    feedback.className = 'feedback-msg error';
    feedback.innerText = 'Incorrecto. Intenta restando 3 a 11 y dividiendo entre 2.';
  }
}

function calcularMatriz2x2() {
  const m11 = parseFloat(document.getElementById('m11').value);
  const m12 = parseFloat(document.getElementById('m12').value);
  const m21 = parseFloat(document.getElementById('m21').value);
  const m22 = parseFloat(document.getElementById('m22').value);

  const det = m11 * m22 - m12 * m21;
  let res = `<div><strong>Determinante det(A):</strong> ${det}</div>`;

  if (det !== 0) {
    res += `<div><strong>Matriz Inversa A⁻¹:</strong></div>`;
    res += `<div class="formula-box">${math(`A^{-1} = \\frac{1}{${det}} \\begin{pmatrix} ${m22} & ${-m12} \\\\ ${-m21} & ${m11} \\end{pmatrix}`, true)}</div>`;
  } else {
    res += `<div>La matriz es singular (no tiene inversa).</div>`;
  }

  const contenedor = document.getElementById('resMatriz');
  contenedor.innerHTML = res;
  renderMathInContainer(contenedor);
}

function calcularMatriz3x3() {
  const a11 = parseFloat(document.getElementById('mb11').value), a12 = parseFloat(document.getElementById('mb12').value), a13 = parseFloat(document.getElementById('mb13').value);
  const a21 = parseFloat(document.getElementById('mb21').value), a22 = parseFloat(document.getElementById('mb22').value), a23 = parseFloat(document.getElementById('mb23').value);
  const a31 = parseFloat(document.getElementById('mb31').value), a32 = parseFloat(document.getElementById('mb32').value), a33 = parseFloat(document.getElementById('mb33').value);

  const det = a11*(a22*a33 - a23*a32) - a12*(a21*a33 - a23*a31) + a13*(a21*a32 - a22*a31);

  const contenedor = document.getElementById('resMatriz');
  contenedor.innerHTML = `<div><strong>Determinante por regla de Sarrus / Cofactores:</strong> det(B) = ${det}</div>`;
}

function dibujarGrafico2D() {
  const expr = document.getElementById('exprGrafico').value;
  const xValues = [];
  const yValues = [];

  for (let x = -10; x <= 10; x += 0.2) {
    xValues.push(x);
    try {
      // Evaluación simplificada de la expresión
      let res = eval(expr.replace(/x/g, `(${x})`).replace(/\^/g, '**'));
      yValues.push(res);
    } catch (e) {
      yValues.push(null);
    }
  }

  const trace = {
    x: xValues,
    y: yValues,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#1e3a8a', width: 2 }
  };

  const layout = {
    title: `Gráfica de f(x) = ${expr}`,
    xaxis: { title: 'Eje X', zeroline: true },
    yaxis: { title: 'Eje Y', zeroline: true },
    margin: { t: 40, b: 40, l: 40, r: 40 }
  };

  Plotly.newPlot('plot2D', [trace], layout);
}

function evaluarQuiz() {
  const form = document.getElementById('formQuiz');
  let nota = 0;

  if (form.q1.value === 'b') nota += 3.33;
  if (form.q2.value === 'c') nota += 3.33;
  if (form.q3.value === 'b') nota += 3.34;

  const res = document.getElementById('resQuiz');
  res.innerHTML = `
    <div style="padding:1rem; background-color:#e0f2fe; border-radius:8px;">
      <h4>Puntaje Obtenido: ${nota.toFixed(2)} / 10.00</h4>
      <p>${nota >= 7 ? '¡Excelente trabajo! Has demostrado dominio de los conceptos.' : 'Te sugerimos revisar los módulos teóricos para reforzar los conceptos.'}</p>
    </div>
  `;
}