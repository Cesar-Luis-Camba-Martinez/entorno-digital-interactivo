# Changelog (Registro de Cambios)

Todos los cambios notables realizados en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a la versión semántica [Semantic Versioning](https://semver.org/lang/es/).

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
