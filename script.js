/* ==========================================================================
   Entorno Digital de Álgebra - Unidades Educativas / Módulo de Ecuaciones
   Script Principal JavaScript (script.js)
   Soporte completo para renderizado KaTeX de expresiones matemáticas
   ========================================================================== */

/**
 * Función auxiliar global para ejecutar el renderizado KaTeX en el contenedor indicado
 * o en todo el documento.
 */
function renderizarMatematicasGlobal() {
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\\\(', right: '\\\\)', display: false },
        { left: '\\\\[', right: '\\\\]', display: true }
      ],
      throwOnError: false
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarMatematicasGlobal();
});

/**
 * RESOLVER ECUACIÓN LINEAL SIMPLE: a*x + b = c
 */
function resolverLineal() {
  const a = parseFloat(document.getElementById('lin-a').value) || 0;
  const b = parseFloat(document.getElementById('lin-b').value) || 0;
  const c = parseFloat(document.getElementById('lin-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    if (b === c) {
      res.innerHTML = `
        <div><strong>Paso 1: Análisis de Identidad:</strong></div>
        <div>$$0 \\cdot x + (${b}) = ${c} \\implies ${b} = ${c}$$</div>
        <div class="resultado-final">Infinitas Soluciones (Identidad): La igualdad se cumple para cualquier $$x \\in \\mathbb{R}$$.</div>
      `;
    } else {
      res.innerHTML = `
        <div><strong>Paso 1: Análisis de Inconsistencia:</strong></div>
        <div>$$0 \\cdot x + (${b}) = ${c} \\implies ${b} \\neq ${c}$$</div>
        <div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Sin Solución (Inconsistencia): No existe ningún valor de $$x$$ que satisfaga la igualdad.</div>
      `;
    }
    renderizarMatematicasGlobal();
    return;
  }

  const num = c - b;
  const x = num / a;

  let pasos = `<div><strong>Paso 1: Identificación de la Ecuación Forma Estándar:</strong></div>`;
  pasos += `<div>$$${a}x + (${b}) = ${c}$$</div>`;
  
  pasos += `<div><strong>Paso 2: Transposición de Términos Independientes:</strong></div>`;
  pasos += `<div>Restamos $$(${b})$$ en ambos miembros de la ecuación:</div>`;
  pasos += `<div>$$${a}x = ${c} - (${b}) \\implies ${a}x = ${num.toFixed(4)}$$</div>`;

  pasos += `<div><strong>Paso 3: Despeje de la Incógnita $$x$$:</strong></div>`;
  pasos += `<div>Dividimos ambos lados entre $$${a}$$:</div>`;
  pasos += `<div>$$x = \\frac{${num.toFixed(4)}}{${a}}$$</div>`;

  pasos += `<div class="resultado-final">$$x = ${x.toFixed(4)}$$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/**
 * RESOLVER ECUACIÓN CUADRÁTICA: a*x^2 + b*x + c = 0
 */
function resolverCuadratica() {
  const a = parseFloat(document.getElementById('quad-a').value) || 0;
  const b = parseFloat(document.getElementById('quad-b').value) || 0;
  const c = parseFloat(document.getElementById('quad-c').value) || 0;
  const res = document.getElementById('resultado');

  if (a === 0) {
    res.innerHTML = '<span style="color:#ef4444; font-weight:bold;">Error: No es una ecuación cuadrática porque el coeficiente $$a$$ es cero. Utilice la sección de ecuaciones lineales.</span>';
    renderizarMatematicasGlobal();
    return;
  }

  const discriminante = b * b - 4 * a * c;

  let pasos = `<div><strong>Paso 1: Identificación de Coeficientes y Ecuación General:</strong></div>`;
  pasos += `<div>$$${a}x^2 + (${b})x + (${c}) = 0$$</div>`;
  pasos += `<div>$$a = ${a},\\quad b = ${b},\\quad c = ${c}$$</div>`;

  pasos += `<div><strong>Paso 2: Cálculo del Discriminante ($\\Delta = b^2 - 4ac$):</strong></div>`;
  pasos += `<div>$$\\Delta = (${b})^2 - 4(${a})(${c}) = ${b*b} - (${4*a*c}) = ${discriminante.toFixed(4)}$$</div>`;

  pasos += `<div><strong>Paso 3: Aplicación de la Fórmula General ($x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$):</strong></div>`;

  if (discriminante > 0) {
    const x1 = (-b + Math.sqrt(discriminante)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminante)) / (2 * a);
    
    pasos += `<div>Dado que $$\\Delta > 0$$, existen dos soluciones reales distintas:</div>`;
    pasos += `<div>$$x_1 = \\frac{-(${b}) + \\sqrt{${discriminante.toFixed(4)}}}{2(${a})} = ${x1.toFixed(4)}$$</div>`;
    pasos += `<div>$$x_2 = \\frac{-(${b}) - \\sqrt{${discriminante.toFixed(4)}}}{2(${a})} = ${x2.toFixed(4)}$$</div>`;
    
    pasos += `<div class="resultado-final">$$x_1 = ${x1.toFixed(4)}, \\quad x_2 = ${x2.toFixed(4)}$$</div>`;
  } else if (discriminante === 0) {
    const x = -b / (2 * a);
    
    pasos += `<div>Dado que $$\\Delta = 0$$, existe una solución real única (raíz doble):</div>`;
    pasos += `<div>$$x = \\frac{-(${b})}{2(${a})} = ${x.toFixed(4)}$$</div>`;
    
    pasos += `<div class="resultado-final">$$x_1 = x_2 = ${x.toFixed(4)}$$</div>`;
  } else {
    const real = (-b / (2 * a)).toFixed(4);
    const imag = (Math.sqrt(-discriminante) / (2 * a)).toFixed(4);

    pasos += `<div>Dado que $$\\Delta < 0$$, no existen soluciones en el conjunto de los números reales ($\\mathbb{R}$). Las soluciones son números complejos conjugados:</div>`;
    pasos += `<div>$$x_1 = ${real} + ${imag}i$$</div>`;
    pasos += `<div>$$x_2 = ${real} - ${imag}i$$</div>`;

    pasos += `<div class="resultado-final">$$x_1 = ${real} + ${imag}i, \\quad x_2 = ${real} - ${imag}i$$</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/**
 * RESOLVER ECUACIÓN FRACCIONARIA / RACIONAL: a / (x + b) + c = 0
 */
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
  // Corrección en Paso 1: \\neq y \\implies
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
  // Corrección en Paso 3: \\implies
  pasos += `<div>$$${a} = ${-c}(x + (${b})) \\implies x + (${b}) = \\frac{${a}}{${-c}} \\implies x + (${b}) = ${numPaso2.toFixed(4)}$$</div>`;

  pasos += `<div><strong>Paso 4: Despeje Final de $$x$$:</strong></div>`;
  pasos += `<div>$$x = ${numPaso2.toFixed(4)} - (${b})$$</div>`;

  if (Math.abs(x - restriccion) < 0.0001) {
    pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">La solución generada ($$x = ${x.toFixed(4)}$$) coincide con la restricción del dominio ($$x \\neq ${restriccion}$$). Por lo tanto, la ecuación no tiene solución válida.</div>`;
  } else {
    // Corrección en el resultado final: \\neq
    pasos += `<div class="resultado-final">$$x = ${x.toFixed(4)}$$ (Solución válida, pues $$x \\neq ${restriccion}$$)</div>`;
  }

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}

/**
 * RESOLVER SISTEMA DE ECUACIONES LINEALES 2x2:
 *  a1*x + b1*y = c1
 *  a2*x + b2*y = c2
 *  Mediante la Regla de Cramer (Determinantes)
 */
function resolverSistema2x2() {
  const a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
  const b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
  const c1 = parseFloat(document.getElementById('sys-c1').value) || 0;
  const a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
  const b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
  const c2 = parseFloat(document.getElementById('sys-c2').value) || 0;
  const res = document.getElementById('resultado');

  const detS = a1 * b2 - a2 * b1;
  const detX = c1 * b2 - c2 * b1;
  const detY = a1 * c2 - a2 * c1;

  let pasos = `<div><strong>Paso 1: Planteamiento del Sistema 2x2:</strong></div>`;
  pasos += `<div>$$\\begin{cases} ${a1}x + (${b1})y = ${c1} \\\\ ${a2}x + (${b2})y = ${c2} \\end{cases}$$</div>`;

  pasos += `<div><strong>Paso 2: Cálculo del Determinante del Sistema ($\\Delta_s$):</strong></div>`;
  pasos += `<div>$$\\Delta_s = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${a2})(${b1}) = ${detS.toFixed(4)}$$</div>`;

  if (Math.abs(detS) < 0.000001) {
    if (Math.abs(detX) < 0.000001 && Math.abs(detY) < 0.000001) {
      pasos += `<div class="resultado-final">Dado que $$\\Delta_s = 0$$, $$\\Delta_x = 0$$ y $$\\Delta_y = 0$$, el sistema es <strong>Compatible Indeterminado</strong> (Tiene infinitas soluciones, las dos rectas son coincidentes).</div>`;
    } else {
      pasos += `<div class="resultado-final" style="background-color:#fef2f2; border-color:#fecaca; color:#991b1b;">Dado que $$\\Delta_s = 0$$ y al menos un determinante de variable es diferente de cero ($$\\Delta_x = ${detX.toFixed(4)}$$, $$\\Delta_y = ${detY.toFixed(4)}$$), el sistema es <strong>Incompatible</strong> (No tiene solución, las dos rectas son paralelas).</div>`;
    }
    res.innerHTML = pasos;
    renderizarMatematicasGlobal();
    return;
  }

  pasos += `<div><strong>Paso 3: Cálculo del Determinante de $$x$$ ($\\Delta_x$):</strong></div>`;
  pasos += `<div>$$\\Delta_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = (${c1})(${b2}) - (${c2})(${b1}) = ${detX.toFixed(4)}$$</div>`;

  pasos += `<div><strong>Paso 4: Cálculo del Determinante de $$y$$ ($\\Delta_y$):</strong></div>`;
  pasos += `<div>$$\\Delta_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = (${a1})(${c2}) - (${a2})(${c1}) = ${detY.toFixed(4)}$$</div>`;

  const x = detX / detS;
  const y = detY / detS;

  pasos += `<div><strong>Paso 5: Aplicación de la Regla de Cramer ($x = \\frac{\\Delta_x}{\\Delta_s}$, $y = \\frac{\\Delta_y}{\\Delta_s}$):</strong></div>`;
  pasos += `<div>$$x = \\frac{${detX.toFixed(4)}}{${detS.toFixed(4)}} = ${x.toFixed(4)}$$</div>`;
  pasos += `<div>$$y = \\frac{${detY.toFixed(4)}}{${detS.toFixed(4)}} = ${y.toFixed(4)}$$</div>`;

  pasos += `<div class="resultado-final">Sistema Compatible Determinado: $$x = ${x.toFixed(4)}, \\quad y = ${y.toFixed(4)}$$</div>`;

  res.innerHTML = pasos;
  renderizarMatematicasGlobal();
}