import json
import random


class GeneradorEcuaciones:
    """Generador dinámico de ejercicios algebraicos para el Entorno Digital Interactivo.

    Crea ecuaciones lineales y cuadráticas con soluciones enteras y sus
    respectivos pasos de resolución en formato compatible con JSON.
    """

    def __init__(self):
        self.banco_ejercicios = []

    def generar_lineal(self, id_ejercicio: int) -> dict:

        a = random.choice([i for i in range(-9, 10) if i != 0])
        x = random.randint(-10, 10)
        b = random.randint(-15, 15)
        c = a * x + b

        signo_b = f"+ {b}" if b >= 0 else f"- {abs(b)}"
        expresion = f"{a}x {signo_b} = {c}"

        pasos = [
            f"1. Aislar el término con la incógnita: {a}x = {c} - ({b})",
            f"2. Simplificar el lado derecho: {a}x = {c - b}",
            f"3. Despejar x: x = ({c - b}) / {a}",
            f"4. Solución obtenida: x = {x}",
        ]

        return {
            "id": id_ejercicio,
            "tipo": "lineal",
            "expresion": expresion,
            "solucion": [x],
            "pasos": pasos,
            "dificultad": "Básica" if abs(a) <= 4 else "Intermedia",
        }

    def generar_cuadratica(self, id_ejercicio: int) -> dict:

        r1 = random.randint(-7, 7)
        r2 = random.randint(-7, 7)

        b = -(r1 + r2)
        c = r1 * r2

        signo_b = f"+ {b}" if b >= 0 else f"- {abs(b)}"
        signo_c = f"+ {c}" if c >= 0 else f"- {abs(c)}"

        expresion = f"x² {signo_b}x {signo_c} = 0"

        pasos = [
            f"1. Identificar coeficientes: a = 1, b = {b}, c = {c}",
            f"2. Factorizar el trinomio: (x - ({r1}))(x - ({r2})) = 0",
            f"3. Igualar cada factor a cero: x - ({r1}) = 0  o  x - ({r2}) = 0",
            f"4. Raíces calculadas: x₁ = {r1}, x₂ = {r2}",
        ]

        return {
            "id": id_ejercicio,
            "tipo": "cuadratica",
            "expresion": expresion,
            "solucion": sorted(list(set([r1, r2]))),
            "pasos": pasos,
            "dificultad": "Avanzada",
        }

    def construir_banco(self, cant_lineales: int = 5, cant_cuadraticas: int = 5):
        id_counter = 1
        for _ in range(cant_lineales):
            self.banco_ejercicios.append(self.generar_lineal(id_counter))
            id_counter += 1
        for _ in range(cant_cuadraticas):
            self.banco_ejercicios.append(self.generar_cuadratica(id_counter))
            id_counter += 1

    def exportar_json(self, nombre_archivo: str = "ejercicios_entorno.json"):
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            json.dump(self.banco_ejercicios, f, ensure_ascii=False, indent=4)
        print(
            f"Proceso completado: {len(self.banco_ejercicios)} ejercicios exportados a '{nombre_archivo}'."
        )


if __name__ == "__main__":
    generador = GeneradorEcuaciones()
    generador.construir_banco(cant_lineales=5, cant_cuadraticas=5)
    generador.exportar_json()