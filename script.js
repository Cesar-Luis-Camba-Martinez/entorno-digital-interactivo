/* ==========================================================================
   Entorno Digital de Álgebra - UEFGJ
   Lógica de solución, generación de pasos y renderizado matemático vía KaTeX
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  cambiarTipoEcuacion();
});

/**
  Genera los campos de entrada según el grado seleccionado.
 */
function cambiarTipoEcuacion() {
  const tipo = document.getElementById("tipoEcuacion").value;
  const container = document.getElementById("coeficientesContainer");
  container.innerHTML = "";

  let campos = [];
  if (tipo === "lineal") {
    campos = [{ id: "coefA", label: "Coeficiente a (x):", default: 2 },
              { id: "coefB", label: "Término b:", default: -4 }];
  } else if (tipo === "cuadratica") {
    campos = [{ id: "coefA", label: "Coeficiente a (x²):", default: 1 },
              { id: "coefB", label: "Coeficiente b (x):", default: -3 },
              { id: "coefC", label: "Término c:", default: 2 }];
  } else if (tipo === "cubica") {
    campos = [{ id: "coefA", label: "Coeficiente a (x³):", default: 1 },
              { id: "coefB", label: "Coeficiente b (x²):", default: -6 },
              { id: "coefC", label: "Coeficiente c (x):", default: 11 },
              { id: "coefD", label: "Término d:", default: -6 }];
  } else if (tipo === "cuartica") {
    campos = [{ id: "coefA", label: "Coeficiente a (x⁴):", default: 1 },
              { id: "coefB", label: "Coeficiente b (x³):", default: -2 },
              { id: "coefC", label: "Coeficiente c (x²):", default: -1 },
              { id: "coefD", label: "Coeficiente d (x):", default: 2 },
              { id: "coefE", label: "Término e:", default: 0 }];
  } else if (tipo === "quintica") {
    campos = [{ id: "coefA", label: "Coeficiente a (x⁵):", default: 1 },
              { id: "coefB", label: "Coeficiente b (x⁴):", default: -5 },
              { id: "coefC", label: "Coeficiente c (x³):", default: 5 },
              { id: "coefD", label: "Coeficiente d (x²):", default: 5 },
              { id: "coefE", label: "Coeficiente e (x):", default: -6 },
              { id: "coefF", label: "Término f:", default: 0 }];
  }

  campos.forEach(c => {
    const div = document.createElement("div");
    div.className = "input-item";
    div.innerHTML = `
      <label for="${c.id}">${c.label}</label>
      <input type="number" id="${c.id}" value="${c.default}" step="any" oninput="actualizarPrevisualizacion()">
    `;
    container.appendChild(div);
  });

  actualizarPrevisualizacion();
}

/**
  Actualiza la caja de la ecuación mostrada en notación LaTeX.
 */
function actualizarPrevisualizacion() {
  const tipo = document.getElementById("tipoEcuacion").value;
  let latex = "";

  if (tipo === "lineal") {
    const a = parseFloat(document.getElementById("coefA")?.value) || 0;
    const b = parseFloat(document.getElementById("coefB")?.value) || 0;
    latex = `$$${armarPolinomio([a, b])} = 0$$`;
  } else if (tipo === "cuadratica") {
    const a = parseFloat(document.getElementById("coefA")?.value) || 0;
    const b = parseFloat(document.getElementById("coefB")?.value) || 0;
    const c = parseFloat(document.getElementById("coefC")?.value) || 0;
    latex = `$$${armarPolinomio([a, b, c])} = 0$$`;
  } else if (tipo === "cubica") {
    const a = parseFloat(document.getElementById("coefA")?.value) || 0;
    const b = parseFloat(document.getElementById("coefB")?.value) || 0;
    const c = parseFloat(document.getElementById("coefC")?.value) || 0;
    const d = parseFloat(document.getElementById("coefD")?.value) || 0;
    latex = `$$${armarPolinomio([a, b, c, d])} = 0$$`;
  } else if (tipo === "cuartica") {
    const a = parseFloat(document.getElementById("coefA")?.value) || 0;
    const b = parseFloat(document.getElementById("coefB")?.value) || 0;
    const c = parseFloat(document.getElementById("coefC")?.value) || 0;
    const d = parseFloat(document.getElementById("coefD")?.value) || 0;
    const e = parseFloat(document.getElementById("coefE")?.value) || 0;
    latex = `$$${armarPolinomio([a, b, c, d, e])} = 0$$`;
  } else if (tipo === "quintica") {
    const a = parseFloat(document.getElementById("coefA")?.value) || 0;
    const b = parseFloat(document.getElementById("coefB")?.value) || 0;
    const c = parseFloat(document.getElementById("coefC")?.value) || 0;
    const d = parseFloat(document.getElementById("coefD")?.value) || 0;
    const e = parseFloat(document.getElementById("coefE")?.value) || 0;
    const f = parseFloat(document.getElementById("coefF")?.value) || 0;
    latex = `$$${armarPolinomio([a, b, c, d, e, f])} = 0$$`;
  }

  const elem = document.getElementById("ecuacionFormateada");
  elem.innerHTML = latex;
  renderizarKaTeX(elem);
}

/**
  Controlador principal para resolver según el grado seleccionado.
 */
function resolverEcuacion() {
  const tipo = document.getElementById("tipoEcuacion").value;
  const contenedorPasos = document.getElementById("pasosResolucion");

  if (tipo === "lineal") {
    resolverLineal();
  } else if (tipo === "cuadratica") {
    resolverCuadratica();
  } else if (tipo === "cubica") {
    resolverPolinomica();
  } else if (tipo === "cuartica") {
    resolverCuartica();
  } else if (tipo === "quintica") {
    resolverQuintica();
  }

  renderizarKaTeX(contenedorPasos);
}

/* ==========================================================================
   Algoritmos de Resolución Paso a Paso
   ========================================================================== */

function resolverLineal() {
  const a = parseFloat(document.getElementById("coefA").value) || 0;
  const b = parseFloat(document.getElementById("coefB").value) || 0;
  const contenedor = document.getElementById("pasosResolucion");

  if (a === 0) {
    contenedor.innerHTML = b === 0 
      ? "<div><strong>Paso 1:</strong> La ecuación $$0 = 0$$ tiene infinitas soluciones.</div>"
      : "<div><strong>Paso 1:</strong> La ecuación $$" + b + " = 0$$ es una contradicción (sin solución).</div>";
    return;
  }

  const x = -b / a;
  let pasos = `<div><strong>Paso 1: Identificación de la ecuación lineal:</strong> $$${armarPolinomio([a, b])} = 0$$</div>`;
  pasos += `<div><strong>Paso 2: Transposición del término independiente:</strong> $$${a}x = ${-b}$$</div>`;
  pasos += `<div><strong>Paso 3: Despeje de la incógnita $$x$$:</strong> $$x = \\frac{${-b}}{${a}}$$</div>`;
  pasos += `<div><strong>Solución final:</strong> $$x = ${Number(x.toFixed(4))}$$</div>`;

  contenedor.innerHTML = pasos;
}

function resolverCuadratica() {
  const a = parseFloat(document.getElementById("coefA").value) || 0;
  const b = parseFloat(document.getElementById("coefB").value) || 0;
  const c = parseFloat(document.getElementById("coefC").value) || 0;
  const contenedor = document.getElementById("pasosResolucion");

  if (a === 0) {
    contenedor.innerHTML = "<div><strong>Nota:</strong> Como $$a = 0$$, la ecuación se resuelve como lineal.</div>";
    return;
  }

  const disc = b * b - 4 * a * c;
  let pasos = `<div><strong>Paso 1: Fórmula general cuadrática:</strong> $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</div>`;
  pasos += `<div><strong>Paso 2: Sustitución de coeficientes:</strong> $$x = \\frac{-(${b}) \\pm \\sqrt{(${b})^2 - 4(${a})(${c})}}{2(${a})}$$</div>`;
  pasos += `<div><strong>Paso 3: Cálculo del discriminante (\\Delta):</strong> $$\\Delta = ${disc}$$</div>`;

  if (disc > 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    pasos += `<div><strong>Paso 4: Dos raíces reales distintas:</strong></div>`;
    pasos += `<div>$$x_1 = ${Number(x1.toFixed(4))}$$</div>`;
    pasos += `<div>$$x_2 = ${Number(x2.toFixed(4))}$$</div>`;
  } else if (disc === 0) {
    const x = -b / (2 * a);
    pasos += `<div><strong>Paso 4: Raíz real única (multiplicidad 2):</strong> $$x = ${Number(x.toFixed(4))}$$</div>`;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
    pasos += `<div><strong>Paso 4: Soluciones complejas conjugadas:</strong></div>`;
    pasos += `<div>$$x_1 = ${real} + ${imag}i$$</div>`;
    pasos += `<div>$$x_2 = ${real} - ${imag}i$$</div>`;
  }

  contenedor.innerHTML = pasos;
}

function resolverPolinomica() {
  const a = parseFloat(document.getElementById("coefA").value) || 0;
  const b = parseFloat(document.getElementById("coefB").value) || 0;
  const c = parseFloat(document.getElementById("coefC").value) || 0;
  const d = parseFloat(document.getElementById("coefD").value) || 0;
  const contenedor = document.getElementById("pasosResolucion");

  let pasos = `<div><strong>Paso 1: Ecuación Cúbica:</strong> $$${armarPolinomio([a, b, c, d])} = 0$$</div>`;
  
  const pList = obtenerDivisores(Math.abs(d));
  const qList = obtenerDivisores(Math.abs(a));
  const candidatos = obtenerCandidatos(pList, qList);

  pasos += `<div><strong>Paso 2: Aplicación del Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$d = ${d}$$ ($$p$$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Posibles raíces ($$\\pm p/q$$): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  const raizEncontrada = candidatos.find(r => Math.abs(a*r*r*r + b*r*r + c*r + d) < 1e-5);

  if (raizEncontrada !== undefined) {
    pasos += `<div><strong>Paso 3: Evaluación y Regla de Ruffini con $$x = ${raizEncontrada}$$:</strong></div>`;
    const coefReducidos = ruffini([a, b, c, d], raizEncontrada);
    pasos += `<div>Coeficientes del polinomio reducido (Grado 2): $$${coefReducidos[0]}x^2 + ${coefReducidos[1]}x + ${coefReducidos[2]}$$</div>`;
    pasos += `<div><strong>Paso 4: Solución de la ecuación de segundo grado sobrante:</strong></div>`;
    
    const disc = coefReducidos[1]*coefReducidos[1] - 4*coefReducidos[0]*coefReducidos[2];
    if (disc >= 0) {
      const x2 = (-coefReducidos[1] + Math.sqrt(disc)) / (2 * coefReducidos[0]);
      const x3 = (-coefReducidos[1] - Math.sqrt(disc)) / (2 * coefReducidos[0]);
      pasos += `<div><strong>Conjunto Solución:</strong> $$x_1 = ${raizEncontrada}$$, $$x_2 = ${Number(x2.toFixed(4))}$$, $$x_3 = ${Number(x3.toFixed(4))}$$</div>`;
    } else {
      pasos += `<div><strong>Conjunto Solución:</strong> $$x_1 = ${raizEncontrada}$$ y dos raíces complejas.</div>`;
    }
  } else {
    pasos += `<div><strong>Paso 3:</strong> No se encontraron raíces racionales enteras simples. Se sugiere método numérico o de Cardano.</div>`;
  }

  contenedor.innerHTML = pasos;
}

function resolverCuartica() {
  const a = parseFloat(document.getElementById("coefA").value) || 0;
  const b = parseFloat(document.getElementById("coefB").value) || 0;
  const c = parseFloat(document.getElementById("coefC").value) || 0;
  const d = parseFloat(document.getElementById("coefD").value) || 0;
  const e = parseFloat(document.getElementById("coefE").value) || 0;
  const contenedor = document.getElementById("pasosResolucion");

  let pasos = `<div><strong>Paso 1: Ecuación Cuártica:</strong> $$${armarPolinomio([a, b, c, d, e])} = 0$$</div>`;
  
  const pList = obtenerDivisores(Math.abs(e));
  const qList = obtenerDivisores(Math.abs(a));
  const candidatos = obtenerCandidatos(pList, qList);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$e = ${e}$$ ($$p$$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Raíces racionales candidatas ($$\\pm p/q$$): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  const raizEncontrada = candidatos.find(r => Math.abs(a*Math.pow(r,4) + b*Math.pow(r,3) + c*r*r + d*r + e) < 1e-5);

  if (raizEncontrada !== undefined) {
    pasos += `<div><strong>Paso 3: Reducción por Regla de Ruffini con $$x_1 = ${raizEncontrada}$$:</strong></div>`;
    const reducidos = ruffini([a, b, c, d, e], raizEncontrada);
    pasos += `<div>Polinomio resultante de Grado 3: $$${armarPolinomio(reducidos)} = 0$$</div>`;
  } else {
    pasos += `<div><strong>Paso 3:</strong> No se hallaron raíces racionales evidentes.</div>`;
  }

  contenedor.innerHTML = pasos;
}

function resolverQuintica() {
  const a = parseFloat(document.getElementById("coefA").value) || 0;
  const b = parseFloat(document.getElementById("coefB").value) || 0;
  const c = parseFloat(document.getElementById("coefC").value) || 0;
  const d = parseFloat(document.getElementById("coefD").value) || 0;
  const e = parseFloat(document.getElementById("coefE").value) || 0;
  const f = parseFloat(document.getElementById("coefF").value) || 0;
  const contenedor = document.getElementById("pasosResolucion");

  let pasos = `<div><strong>Paso 1: Ecuación Quíntica:</strong> $$${armarPolinomio([a, b, c, d, e, f])} = 0$$</div>`;
  
  const pList = obtenerDivisores(Math.abs(f));
  const qList = obtenerDivisores(Math.abs(a));
  const candidatos = obtenerCandidatos(pList, qList);

  pasos += `<div><strong>Paso 2: Teorema de la Raíz Racional:</strong></div>`;
  pasos += `<div>• Divisores de $$f = ${f}$$ ($$p$$): {${pList.join(', ')}}</div>`;
  pasos += `<div>• Divisores de $$a = ${a}$$ ($$q$$): {${qList.join(', ')}}</div>`;
  pasos += `<div>• Posibles raíces ($$\\pm p/q$$): {${candidatos.map(v => Number(v.toFixed(2))).join(', ')}}</div>`;

  const raizEncontrada = candidatos.find(r => Math.abs(a*Math.pow(r,5) + b*Math.pow(r,4) + c*Math.pow(r,3) + d*r*r + e*r + f) < 1e-5);

  if (raizEncontrada !== undefined) {
    pasos += `<div><strong>Paso 3: Depuración mediante Ruffini con $$x_1 = ${raizEncontrada}$$:</strong></div>`;
    const reducidos = ruffini([a, b, c, d, e, f], raizEncontrada);
    pasos += `<div>Polinomio grado 4 resultante: $$${armarPolinomio(reducidos)} = 0$$</div>`;
  } else {
    pasos += `<div><strong>Paso 3:</strong> Aplicando el Teorema de Abel-Ruffini, esta quíntica se analiza con aproximaciones numéricas.</div>`;
  }

  contenedor.innerHTML = pasos;
}

/* ==========================================================================
   Funciones Auxiliares y Matemáticas
   ========================================================================== */

function armarPolinomio(coefs) {
  const gradoMax = coefs.length - 1;
  let str = "";

  coefs.forEach((c, idx) => {
    if (c === 0) return;
    const grado = gradoMax - idx;
    const signo = (c > 0 && str !== "") ? " + " : (c < 0 ? " - " : "");
    const absC = Math.abs(c);
    const coefStr = (absC === 1 && grado > 0) ? "" : absC;

    let varStr = "";
    if (grado === 1) varStr = "x";
    else if (grado > 1) varStr = `x^{${grado}}`;

    str += `${signo}${coefStr}${varStr}`;
  });

  return str === "" ? "0" : str;
}

function obtenerDivisores(n) {
  if (n === 0) return [1];
  const divs = [];
  for (let i = 1; i <= Math.abs(n); i++) {
    if (n % i === 0) divs.push(i);
  }
  return divs;
}

function obtenerCandidatos(pList, qList) {
  const cand = new Set();
  pList.forEach(p => {
    qList.forEach(q => {
      cand.add(p / q);
      cand.add(-p / q);
    });
  });
  return Array.from(cand).sort((a, b) => a - b);
}

function ruffini(coefs, r) {
  const res = [coefs[0]];
  for (let i = 1; i < coefs.length - 1; i++) {
    res.push(coefs[i] + res[i - 1] * r);
  }
  return res;
}

function renderizarKaTeX(elemento) {
  if (window.renderMathInElement) {
    renderMathInElement(elemento, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }
}

function limpiarTodo() {
  document.getElementById("pasosResolucion").innerHTML = `
    <p class="placeholder-text">Ingrese los coeficientes y haga clic en "Resolver Ecuación" para ver el procedimiento paso a paso.</p>
  `;
  cambiarTipoEcuacion();
}