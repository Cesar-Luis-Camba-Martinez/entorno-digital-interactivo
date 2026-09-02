"""
===============================================================================
CALCULADORA NUMÉRICO-ANALÍTICA DE ECUACIONES ALGEBRAICAS
===============================================================================
Desarrollada para complementar el Entorno Digital Interactivo de Aprendizaje
Unidad Educativa Fiscomisional "Francisco García Jiménez"
Asignatura: Matemáticas | Subnivel: Educación General Básica Superior (10.° EGB)
===============================================================================
"""

import math
import cmath

def menu_principal():
    print("=" * 70)
    print("  CALCULADORA NUMÉRICO-ANALÍTICA DE ECUACIONES ALGEBRAICAS")
    print("=======================================================================")
    print("1. Ecuación Lineal (Primer Grado) [a*x + b = 0]")
    print("2. Ecuación Fraccionaria [a / (x + b) + c = 0]")
    print("3. Ecuación Cuadrática (Segundo Grado) [a*x² + b*x + c = 0]")
    print("4. Sistema de Ecuaciones Lineales 2x2 [Regla de Cramer]")
    print("5. Ecuación con Valor Absoluto [|a*x + b| = c]")
    print("6. Ecuación Polinómica de Tercer Grado (Cúbica)")
    print("7. Ecuación Polinómica de Cuarto Grado (Cuártica)")
    print("8. Ecuación Polinómica de Quinto Grado (Quíntica)")
    print("9. Ecuación Polinómica de Sexto Grado (Séxtica)")
    print("10. Calculadora Aritmética y Científica Básica")
    print("0. Salir")
    print("=" * 70)

def resolver_lineal():
    print("\n--- 1. ECUACIÓN LINEAL (PRIMER GRADO) ---")
    print("Estructura: a*x + b = 0")
    try:
        a = float(input("Ingrese el coeficiente a: "))
        b = float(input("Ingrese el término independiente b: "))
        
        print("\n[PASO A PASO]")
        print(f"1. Ecuación formulada: {a}*x + ({b}) = 0")
        if a == 0:
            if b == 0:
                print("2. Resultado: La ecuación tiene infinitas soluciones (Identidad 0 = 0).")
            else:
                print(f"2. Resultado: Contradicción ({b} = 0). La ecuación NO tiene solución.")
        else:
            print(f"2. Despeje del término independiente: {a}*x = {-b}")
            x = -b / a
            print(f"3. Despeje de la incógnita x = (-{b}) / {a}")
            print(f"✔ RESULTADO: x = {x:.4f}")
    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")

def resolver_fraccionaria():
    print("\n--- 2. ECUACIÓN FRACCIONARIA ---")
    print("Estructura: a / (x + b) + c = 0")
    try:
        a = float(input("Ingrese el numerador a: "))
        b = float(input("Ingrese el desplazamiento b (denominador x + b): "))
        c = float(input("Ingrese el término constante c: "))
        
        print("\n[PASO A PASO]")
        print(f"1. Ecuación formulada: {a} / (x + ({b})) + ({c}) = 0")
        print(f"2. Restricción de Dominio: El denominador no puede ser cero -> x + ({b}) ≠ 0  =>  x ≠ {-b}")
        print(f"   Asíntota Vertical en x = {-b:.4f}")
        
        if c == 0:
            if a == 0:
                print("3. Resultado: Indeterminación o infinitas soluciones válidas en el dominio.")
            else:
                print("3. Resultado: {a} = 0 es una contradicción. Sin solución.")
        else:
            # a / (x+b) = -c => x + b = -a / c => x = -a/c - b
            print(f"3. Transposición de término constante: {a} / (x + ({b})) = {-c}")
            print(f"4. Despeje del denominador: x + ({b}) = {a} / ({-c})")
            div = -a / c
            x = div - b
            print(f"5. Solución calculada: x = {div:.4f} - ({b}) = {x:.4f}")
            
            if math.isclose(x, -b):
                print("⚠ ATENCIÓN: La solución coincide con la restricción de dominio. La ecuación carece de solución real.")
            else:
                print(f"✔ RESULTADO: x = {x:.4f}")
    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")

def resolver_cuadratica():
    print("\n--- 3. ECUACIÓN CUADRÁTICA Y PARÁBOLA ---")
    print("Estructura: a*x² + b*x + c = 0")
    try:
        a = float(input("Ingrese el coeficiente a: "))
        b = float(input("Ingrese el coeficiente b: "))
        c = float(input("Ingrese el coeficiente c: "))
        
        if a == 0:
            print("⚠ Como a = 0, se reduce a una ecuación lineal.")
            return
        
        print("\n[PASO A PASO Y ANÁLISIS GEOMÉTRICO]")
        print(f"1. Ecuación: {a}*x² + ({b})*x + ({c}) = 0")
        
        # Discriminante
        disc = b**2 - 4*a*c
        print(f"2. Cálculo del Discriminante (Δ = b² - 4ac):")
        print(f"   Δ = ({b})² - 4*({a})*({c}) = {disc:.4f}")
        
        # Vértice
        h = -b / (2*a)
        k = a*(h**2) + b*h + c
        print(f"3. Vértice V(h, k):")
        print(f"   h = -b / (2a) = -({b}) / (2*{a}) = {h:.4f}")
        print(f"   k = f(h) = {k:.4f}")
        print(f"   Punto Extremo: V({h:.4f}, {k:.4f})")
        
        # Concavidad
        orientacion = "Cóncava hacia arriba (Mínimo)" if a > 0 else "Cóncava hacia abajo (Máximo)"
        print(f"4. Orientación de la Parábola: {orientacion}")
        print(f"5. Eje de Simetría: Recta x = {h:.4f}")
        
        # Raíces
        if disc > 0:
            x1 = (-b + math.sqrt(disc)) / (2*a)
            x2 = (-b - math.sqrt(disc)) / (2*a)
            print("6. Naturaleza de las raíces: Dos raíces reales distintas (Δ > 0)")
            print(f"✔ RESULTADO: x₁ = {x1:.4f}, x₂ = {x2:.4f}")
        elif disc == 0:
            x1 = -b / (2*a)
            print("6. Naturaleza de las raíces: Una raíz real doble (Δ = 0)")
            print(f"✔ RESULTADO: x₁ = x₂ = {x1:.4f}")
        else:
            part_real = -b / (2*a)
            part_imag = math.sqrt(-disc) / (2*a)
            print("6. Naturaleza de las raíces: Dos raíces complejas conjugadas (Δ < 0)")
            print(f"✔ RESULTADO: x₁ = {part_real:.4f} + {part_imag:.4f}i, x₂ = {part_real:.4f} - {part_imag:.4f}i")
            
    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")

def resolver_sistema_2x2():
    print("\n--- 4. SISTEMA DE ECUACIONES LINEALES 2x2 ---")
    print("Ecuación 1: a1*x + b1*y = c1")
    print("Ecuación 2: a2*x + b2*y = c2")
    try:
        a1 = float(input("Ingrese a1: "))
        b1 = float(input("Ingrese b1: "))
        c1 = float(input("Ingrese c1: "))
        a2 = float(input("Ingrese a2: "))
        b2 = float(input("Ingrese b2: "))
        c2 = float(input("Ingrese c2: "))
        
        print("\n[RESOLUCIÓN MEDIANTE REGLA DE CRAMER]")
        det_s = a1*b2 - a2*b1
        det_x = c1*b2 - c2*b1
        det_y = a1*c2 - a2*c1
        
        print(f"1. Determinante del Sistema (Det S) = ({a1})*({b2}) - ({a2})*({b1}) = {det_s:.4f}")
        print(f"2. Determinante de X (Det X)       = ({c1})*({b2}) - ({c2})*({b1}) = {det_x:.4f}")
        print(f"3. Determinante de Y (Det Y)       = ({a1})*({c2}) - ({a2})*({c1}) = {det_y:.4f}")
        
        if det_s != 0:
            x = det_x / det_s
            y = det_y / det_s
            print("4. Clasificación: Sistema Compatible Determinado (Solución Única).")
            print(f"✔ RESULTADO: Punto de Intersección P(x, y) = ({x:.4f}, {y:.4f})")
        else:
            if det_x == 0 and det_y == 0:
                print("4. Clasificación: Sistema Compatible Indeterminado (Rectas coincidentes, infinitas soluciones).")
            else:
                print("4. Clasificación: Sistema Incompatible (Rectas paralelas, sin solución).")
    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")

def resolver_valor_absoluto():
    print("\n--- 5. ECUACIÓN CON VALOR ABSOLUTO ---")
    print("Estructura: |a*x + b| = c")
    try:
        a = float(input("Ingrese el coeficiente a: "))
        b = float(input("Ingrese el término b: "))
        c = float(input("Ingrese el valor constante c: "))
        
        print("\n[PASO A PASO]")
        print(f"1. Ecuación: |{a}*x + ({b})| = {c}")
        
        if c < 0:
            print("2. El valor absoluto de un número real no puede ser negativo.")
            print("✔ RESULTADO: Conjunto Solución S = ∅ (Sin solución real).")
        elif c == 0:
            x = -b / a
            print(f"2. Caso c = 0: {a}*x + ({b}) = 0")
            print(f"✔ RESULTADO: Única solución x = {x:.4f}")
        else:
            x1 = (c - b) / a
            x2 = (-c - b) / a
            print(f"2. Caso positivo (+c): {a}*x + ({b}) = {c}  =>  x₁ = ({c} - ({b})) / {a} = {x1:.4f}")
            print(f"3. Caso negativo (-c): {a}*x + ({b}) = -{c} =>  x₂ = (-{c} - ({b})) / {a} = {x2:.4f}")
            print(f"✔ RESULTADO: Raíces x₁ = {x1:.4f}, x₂ = {x2:.4f}")
    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")

def resolver_polinomial_generica(grado):
    nombres = {3: "CÚBICA", 4: "CUÁRTICA", 5: "QUÍNTICA", 6: "SÉXTICA"}
    nombre = nombres.get(grado, f"DE GRADO {grado}")
    print(f"\n--- ECUACIÓN POLINÓMICA {nombre} (GRADO {grado}) ---")
    
    coeficientes = []
    print(f"Ingrese los {grado + 1} coeficientes desde el grado mayor hasta el término independiente:")
    try:
        for i in range(grado, -1, -1):
            val = float(input(f" Coeficiente x^{i}: "))
            coeficientes.append(val)
            
        if coeficientes[0] == 0:
            print("⚠ El coeficiente principal no puede ser 0 para este grado.")
            return

        print("\n[ANÁLISIS NUMÉRICO DE RAÍCES POLINÓMICAS]")
        # Representación sintáctica del polinomio
        terminos = []
        for idx, coef in enumerate(coeficientes):
            pwr = grado - idx
            if coef != 0:
                if pwr == 0:
                    terminos.append(f"{coef:+g}")
                elif pwr == 1:
                    terminos.append(f"{coef:+g}*x")
                else:
                    terminos.append(f"{coef:+g}*x^{pwr}")
        poly_str = " ".join(terminos).lstrip("+")
        print(f"Polinomio P(x) = {poly_str} = 0")

        # Cálculo de raíces usando el método numérico de Numpy (compañero de matriz)
        import numpy as np
        raices = np.roots(coeficientes)

        print("\n✔ RAÍCES CALCULADAS (Cálculo Analítico/Numérico):")
        for idx, r in enumerate(raices, 1):
            if abs(r.imag) < 1e-7:
                print(f"   Raíz {idx} (Real)     : x = {r.real:.4f}")
            else:
                signo = "+" if r.imag >= 0 else "-"
                print(f"   Raíz {idx} (Compleja) : x = {r.real:.4f} {signo} {abs(r.imag):.4f}i")

    except ValueError:
        print(" Error: Ingrese valores numéricos válidos.")
    except Exception as e:
        print(f" Ocurrió un error al calcular las raíces: {e}")

def calculadora_aritmetica():
    print("\n--- 10. CALCULADORA ARITMÉTICA Y CIENTÍFICA BÁSICA ---")
    print("Operaciones disponibles: +, -, *, /, ^ (potencia), sqrt (raíz cuadrada), log (logaritmo decimal)")
    expr = input("Ingrese la expresión matemática (ej. 2**3 + math.sqrt(16)): ")
    try:
        # Contexto seguro para evaluación
        contexto = {
            "math": math,
            "sqrt": math.sqrt,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "log": math.log10,
            "ln": math.log,
            "pi": math.pi,
            "e": math.e
        }
        res = eval(expr, {"__builtins__": None}, contexto)
        print(f"✔ RESULTADO: {res}")
    except Exception as e:
        print(f" Error evaluando la expresión: {e}")

def main():
    while True:
        menu_principal()
        opc = input("Seleccione una opción (0-10): ").strip()
        if opc == "1":
            resolver_lineal()
        elif opc == "2":
            resolver_fraccionaria()
        elif opc == "3":
            resolver_cuadratica()
        elif opc == "4":
            resolver_sistema_2x2()
        elif opc == "5":
            resolver_valor_absoluto()
        elif opc in ["6", "7", "8", "9"]:
            grados = {"6": 3, "7": 4, "8": 5, "9": 6}
            resolver_polinomial_generica(grados[opc])
        elif opc == "10":
            calculadora_aritmetica()
        elif opc == "0":
            print("\n¡Gracias por utilizar la Calculadora Numérico-Analítica de Ecuaciones Algebraicas!")
            break
        else:
            print("⚠ Opción no válida. Intente nuevamente.")
        
        input("\nPresione ENTER para continuar...")

if __name__ == "__main__":
    main()
