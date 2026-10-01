# Política y Estándares de Calidad (QUALITY.md)

Este documento establece las pautas, principios y criterios de **Aseguramiento de Calidad (Quality Assurance - QA)** que rigen el desarrollo, mantenimiento y evolución del **Entorno Digital Interactivo para el Aprendizaje de Ecuaciones Algebraicas**.

El objetivo principal es garantizar que el recurso educativo sea preciso, accesible, intuitivo y técnicamente robusto para estudiantes y docentes.

---

## 1. Criterios de Calidad Pedagógica y Matemática

Dado que la aplicación está orientada al aprendizaje matemático, la precisión técnica de los contenidos es prioritaria:

* **Rigor y Exactitud Matemática:**
  * Todas las rutinas de cálculo (resolución de ecuaciones lineales, cuadráticas, fraccionarias, polinómicas de grado superior, sistemas $2 \times 2$ y valor absoluto) deben ofrecer resultados exactos y verificables.
  * El cálculo del discriminante, raíces e intercepciones en las gráficas debe manejar adecuadamente casos especiales (sin solución real, infinitas soluciones, números complejos si aplica).
* **Retroalimentación Didáctica:**
  * La retroalimentación en tiempo real debe ser clara, orientadora y libre de ambigüedades.
  * Los mensajes de error de entrada (sintaxis no válida, división por cero, etc.) deben guiar al estudiante de manera constructiva.

---

## 2. Calidad de Código y Estándares Técnicos

Para mantener una base de código limpia, sostenible y comprensible (JavaScript, HTML y CSS nativos):

* **JavaScript (`script.js`):**
  * Cumplimiento con estándares modernos de ECMAScript (ES6+).
  * Funciones puras y modulares para la lógica matemática y renderizado gráfico.
  * Nombres de variables y funciones descriptivos en español o inglés técnico consistente.
  * Manejo adecuado de excepciones mediante validaciones previas de entradas de usuario.
* **HTML (`index.html`):**
  * Estructura semántica adecuada (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  * Inclusión de atributos de accesibilidad (`aria-label`, `alt`, `role`).
* **CSS (`styles.css`):**
  * Organización modular del diseño.
  * Uso de variables CSS para consistencia de paleta de colores y tipografía.
  * Diseño responsivo nativo (Mobile-First / Adaptable a escritorio, tabletas y dispositivos móviles).

---

## 3. Accesibilidad y Experiencia de Usuario (UX/UI)

El proyecto busca garantizar un acceso equitativo y sin barreras:

* **Pautas WCAG 2.1 (Nivel AA):**
  * **Contraste de Color:** Relación de contraste suficiente entre texto y fondo para facilitar la lectura.
  * **Navegación por Teclado:** Todos los componentes interactivos y campos de entrada deben ser accesibles y operables mediante la tecla `Tab` y `Enter`.
  * **Lectores de Pantalla:** Etiquetas claras para que la representación simbólica de las ecuaciones sea interpretable por tecnologías de asistencia.
* **Usabilidad:**
  * Interfaz clara, sin saturación visual.
  * Tiempo de respuesta inmediato al interactuar con las gráficas y controles algebraicos.

---

## 4. Pruebas y Verificación de Calidad

Antes de publicar cualquier cambio en la rama principal (`main`) o en **GitHub Pages**, se deben realizar las siguientes validaciones:

1. **Pruebas de Funcionalidad y Regresión:**
   * Probar el ingreso de distintos tipos de ecuaciones (coeficientes positivos, negativos, fraccionarios y cero).
   * Verificar la correcta actualización dinámica de los canvas o elementos visuales al modificar parámetros.
2. **Pruebas de Compatibilidad:**
   * Comprobación en navegadores principales: Google Chrome, Mozilla Firefox, Microsoft Edge y Safari.
   * Verificación de visualización en pantallas móviles (Android / iOS) y resoluciones de escritorio.
3. **Revisión de Código (Code Review):**
   * Todo Pull Request debe ser revisado contrastándolo con la política del proyecto en `CONTRIBUTING.md` y `CODE_OF_CONDUCT.md`.

---

## 5. Reporte e Incidencias de Calidad

Si encuentras un error numérico, un fallo visual o un problema de accesibilidad:

* Abre una **Issue** en el repositorio utilizando la plantilla correspondiente.
* Describe el comportamiento esperado frente al obtenido, adjuntando la ecuación o datos con los que ocurrió el fallo.
* Si posees la corrección, puedes proponer un *Pull Request* haciendo referencia a la incidencia.

---

*Última actualización: Octubre de 2026*  
*Mantenido por:* **César Luis Camba Martínez**