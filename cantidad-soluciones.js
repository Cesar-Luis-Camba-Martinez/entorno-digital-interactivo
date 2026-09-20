/* =====================================================================
   CAMPO PEDAGÓGICO: CANTIDAD DE SOLUCIONES
   Añade un campo numérico a cada laboratorio y lo incorpora al intento
   previo del estudiante para que pueda comprobarse junto con sus valores.
   ===================================================================== */
(function () {
  'use strict';

  const paneles = [
    'lineal', 'fraccionaria', 'cuadratica', 'sistema', 'absoluto',
    'polinomica', 'cuartica', 'quintica', 'sextica'
  ];

  function crearCampo(panel) {
    const formulario = document.querySelector(`#panel-${panel} .formulario`);
    if (!formulario || formulario.querySelector('.control-cantidad-soluciones')) return;

    const control = document.createElement('div');
    control.className = 'control control-cantidad-soluciones';
    control.innerHTML = `
      <label for="cantidad-soluciones-${panel}">Número de soluciones:</label>
      <input type="number"
             id="cantidad-soluciones-${panel}"
             min="0"
             max="99"
             step="1"
             inputmode="numeric"
             placeholder="¿Cuántas?"
             aria-describedby="ayuda-cantidad-${panel}"
             autocomplete="off">
      <small id="ayuda-cantidad-${panel}" class="ayuda-cantidad-soluciones">
        Escribe cuántas respuestas tiene esta ecuación.
      </small>`;

    const boton = formulario.querySelector('.btn-resolver');
    formulario.insertBefore(control, boton || null);
  }

  function agregarCampos() {
    paneles.forEach(crearCampo);
  }

  function obtenerCampoActivo() {
    const panel = document.querySelector('.panel-contenido:not(.oculto)');
    return panel ? panel.querySelector('.control-cantidad-soluciones input') : null;
  }

  function envolverInicioResolucion() {
    if (typeof window.iniciarResolucion !== 'function' || window.iniciarResolucion.__cantidadSoluciones) return;

    const original = window.iniciarResolucion;
    const envuelta = function (resolver, tipoEcuacion) {
      const campo = document.getElementById(`cantidad-soluciones-${tipoEcuacion}`) || obtenerCampoActivo();
      const cantidad = campo ? campo.value.trim() : '';

      if (cantidad === '') {
        window.alert('Indica primero cuántas soluciones tiene esta ecuación.');
        if (campo) campo.focus();
        return;
      }

      const numero = Number(cantidad);
      if (!Number.isInteger(numero) || numero < 0) {
        window.alert('La cantidad de soluciones debe ser un número entero igual o mayor que cero.');
        if (campo) campo.focus();
        return;
      }

      window.cantidadSolucionesEstudiante = numero;
      original.call(this, resolver, tipoEcuacion);
    };

    envuelta.__cantidadSoluciones = true;
    window.iniciarResolucion = envuelta;
  }

  function iniciar() {
    agregarCampos();
    envolverInicioResolucion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
