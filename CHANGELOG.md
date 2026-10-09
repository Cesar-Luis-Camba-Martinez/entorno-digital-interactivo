# Changelog (Registro de Cambios)

Todos los cambios notables realizados en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a la versión semántica [Semantic Versioning](https://semver.org/lang/es/).

---
## [1.2.0] - 2026-10-09

### Añadido
Campos obligatorios (antes de ver la solución):
- Respuesta final: debe incluir un valor numérico, por ejemplo x = 2.
- Procedimiento: mínimo 30 caracteres y 5 palabras.
- Nivel de seguridad: debe seleccionarse una opción.
- Comprobación: debe incluir números y una igualdad.
Cada campo muestra un aviso claro si falta o está incompleto.
Reflexión (después de la solución): es obligatoria, con mínimo 20 caracteres, y se confirma con el botón “Guardar reflexión”.
Evaluación del procedimiento (rúbrica de 10 puntos): se califican cinco criterios, cada uno de 0 a 2 puntos:
1. Pasos ordenados.
2. Operaciones con números.
3. Método matemático.
4. Concepto propio del tipo de ecuación.
5. Cierre y verificación.
Cada criterio muestra si está logrado, en progreso o por desarrollar, con una sugerencia concreta para mejorar. La nota evalúa el proceso y no depende de que el resultado final sea correcto.

Pruebas: probé la rúbrica con cinco procedimientos de ejemplo. Un procedimiento completo obtuvo 10/10, uno con un error en el resultado final obtuvo 9/10 y uno breve pero real obtuvo 7/10. Un texto mínimo que solo expresa intención recibe 1/10, reconociendo que el estudiante describió su intento.

---

### [1.3.0] - 2026-09-014

### Añadido
 - En el entorno digital interactivo existe un proceso previo para el aprendizaje, como una sección en la que el mismo estudiante lleva a cabo los cálculos y luego se muestra la respuesta y el desarrollo como lo está en este momento.
 - Implementé un mecanismo que analica el intento del estudiante, lo compara automáticamente contra la(s) respuesta(s) correcta(s) ya calculadas, y muestra una retroalimentación visual (correcto / parcial / incorrecto) antes del desarrollo completo.
 - Además, compara ambos conjuntos con una tolerancia razonable (por redondeo) y genera una caja de retroalimentación:

   ✅ Correcta — si coinciden todas las raíces esperadas.
   
   🟡 Parcial — si el estudiante acertó algunas pero no todas (útil en cúbicas, cuárticas, etc. con varias raíces).
   
   ❌ Incorrecta — si no coincide ninguna.
   
   ℹ️ Info — si no escribió ningún valor numérico.
   
---

## [1.1.0] - 2026-09-02

### Añadido
- **Ampliación de Ecuaciones Polinómicas:** Incorporación de módulos interactivos y laboratorios virtuales para ecuaciones de mayor grado:
  - Ecuación Polinómica de Quinto Grado (Quíntica).
  - Ecuación Polinómica de Sexto Grado (Séxtica).
- **Fundamentación Teórica de Alto Nivel:**
  - Inclusión de la explicación analítica del Teorema de Abel-Ruffini sobre la imposibilidad de resolución por radicales para ecuaciones de grado $\ge 5$.
  - Detalle del teorema de la raíz racional y división sintética por Regla de Ruffini.
- **Mejoras de Accesibilidad:**
  - Atributos `aria-live="polite"` en el contenedor dinámico de resultados paso a paso para soporte de lectores de pantalla.
  - Etiquetas `aria-label` y roles semánticos (`role="img"`) en el lienzo dinámico del plano cartesiano (`<canvas>`).
- **Documentación del Repositorio:**
  - Creación del archivo `CHANGELOG.md` para el seguimiento del historial de versiones del proyecto.

### Cambiado
- Optimización en el renderizado en tiempo real sobre el plano cartesiano interactivo de $920 \times 460$ píxeles.
- Ajuste en los controles de escala (1.0x) para una mejor precisión visual al graficar raíces y puntos de corte.

---

## [1.0.0] - 2026-08-25

### Añadido
- **Lanzamiento Inicial del Entorno Digital Interactivo:**
  - Publicación en GitHub Pages para la Unidad Educativa Fiscomisional Francisco García Jiménez.
  - Dirigido a estudiantes de 14 años (Décimo Grado de Educación General Básica Superior, Asignatura de Matemáticas).
- **Tipologías Algebraicas Iniciales:**
  - Ecuación Lineal (Primer Grado) con despeje por propiedad uniforme.
  - Ecuación Fraccionaria con identificación de restricciones de dominio y asíntotas verticales ($x \neq -b$).
  - Ecuación Cuadrática (Segundo Grado) con análisis del discriminante ($\Delta = b^2 - 4ac$), vértice $V(h,k)$, eje de simetría y concavidad.
  - Sistema de Ecuaciones Lineales $2 \times 2$ mediante la Regla de Cramer.
  - Ecuación con Valor Absoluto y propiedades de distancia en la recta real.
  - Ecuación Polinómica de Tercer Grado (Cúbica) y Cuarto Grado (Cuártica).
- **Motor de Graficación y Cálculo:**
  - Graficador en tiempo real con Canvas de HTML5.
  - Despliegue interactivo de resolución paso a paso con rigor sintáctico y analítico.
  - Integración de notación matemática en LaTeX/MathJax.
- **Estructura Didáctica:**
  - Objetivos de la Unidad de Estudio N° 1 ("Ecuaciones Algebraicas").
  - Identificación de área de conocimiento, subnivel educativo y destinatarios.
