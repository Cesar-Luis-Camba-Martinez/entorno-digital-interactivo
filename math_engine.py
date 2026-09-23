# =====================================================================
# MOTOR DE CÁLCULO SIMBÓLICO Y ANALÍTICO - EDUCA-MATH PYTHON (UEFGJ)
# =====================================================================

import random

def calcular_derivada_polinomio(coeficientes):
    """
    Calcula los coeficientes de la derivada de un polinomio dado.
    Ejemplo: [1, -3, 2] -> x^2 - 3x + 2 su derivada es 2x - 3 -> [2, -3]
    """
    grado = len(coeficientes) - 1
    derivada = []
    for i, c in enumerate(coeficientes[:-1]):
        potencia = grado - i
        derivada.append(c * potencia)
    return derivada

def calcular_integral_indefinida(coeficientes, constante_c=0):
    """
    Calcula los coeficientes de la integral indefinida de un polinomio.
    Añade la constante de integración C al final.
    """
    grado = len(coeficientes) - 1
    integral = []
    for i, c in enumerate(coeficientes):
        potencia = grado - i + 1
        integral.append(c / potencia)
    integral.append(constante_c)
    return integral

def evaluar_polinomio(coeficientes, x):
    """Evalúa un polinomio dado sus coeficientes en un valor numérico x."""
    total = 0
    grado = len(coeficientes) - 1
    for i, c in enumerate(coeficientes):
        total += c * (x ** (grado - i))
    return total

def calcular_area_bajo_curva(coeficientes, a, b, particiones=1000):
    """
    Calcula el área bajo la curva de la función polinómica en el intervalo [a, b]
    utilizando el método numérico de los trapecios.
    """
    if a >= b:
        return 0.0
    h = (b - a) / particiones
    suma = 0.5 * (evaluar_polinomio(coeficientes, a) + evaluar_polinomio(coeficientes, b))
    for i in range(1, particiones):
        x = a + i * h
        suma += evaluar_polinomio(coeficientes, x)
    return suma * h

def generar_quiz_ecuacion_cuadratica():
    """
    Genera un ejercicio aleatorio de ecuación cuadrática con soluciones enteras exactas
    para fomentar la práctica autónoma de los estudiantes de la UEFGJ.
    """
    r1 = random.randint(-6, 6)
    r2 = random.randint(-6, 6)
    # Forma expandida: (x - r1)(x - r2) = x^2 - (r1 + r2)x + r1*r2 = 0
    a = 1
    b = -(r1 + r2)
    c = r1 * r2
    
    return {
        "enunciado": f"Resuelve la ecuación cuadrática: {a}x^2 {'+ ' if b >= 0 else '- '}{abs(b)}x {'+ ' if c >= 0 else '- '}{abs(c)} = 0",
        "coeficientes": [a, b, c],
        "raices_esperadas": sorted(list(set([r1, r2])))
    }

def validar_respuesta_estudiante(respuesta_usuario, raices_correctas):
    """Valida si el conjunto de respuestas ingresadas por el alumno coincide con las raíces reales."""
    try:
        limpia = [float(x.strip()) for x in respuesta_usuario.split(',') if x.strip()]
        limpia_ordenada = sorted(list(set([round(x, 3) for x in limpia])))
        correctas_red = sorted(list(set([round(x, 3) for x in raices_correctas])))
        return limpia_ordenada == correctas_red
    except ValueError:
        return False