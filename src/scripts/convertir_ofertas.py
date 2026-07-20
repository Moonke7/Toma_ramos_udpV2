import os, json, re, sys
from collections import OrderedDict

OFERTAS_DIR = os.path.join(os.path.dirname(__file__), "..", "ofertas")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

BLOQUE_POR_HORARIO = {
    "08:30 - 09:50": "A",
    "10:00 - 11:20": "B",
    "11:30 - 12:50": "C",
    "13:00 - 14:20": "D",
    "14:30 - 15:50": "E",
    "16:00 - 17:20": "F",
    "17:25 - 18:45": "G",
    "18:50 - 20:10": "H",
    "20:15 - 21:35": "I",
}

PATRON_HORARIO = re.compile(
    r"^\s*((?:(?:LU|MA|MI|JU|VI|SA|DO)\s+)*)"  # one or more days
    r"(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})?"          # optional time range
    r"\s*$"
)

DIAS_SEMANA = ["LU", "MA", "MI", "JU", "VI"]


def parsear_nombre_archivo(filename):
    name, ext = os.path.splitext(filename)
    if ext.lower() not in (".xls", ".xlsx"):
        return None
    parts = name.split("-")
    if len(parts) < 3:
        return None
    escuela = parts[0]
    year_str = parts[1]
    semester_str = parts[2]
    if not year_str.isdigit() or not semester_str.isdigit():
        return None
    return escuela, int(year_str), int(semester_str), filename


def obtener_archivos_por_escuela():
    archivos = []
    for f in os.listdir(OFERTAS_DIR):
        parsed = parsear_nombre_archivo(f)
        if parsed:
            archivos.append(parsed)

    grupos = {}
    for escuela, year, semester, filename in archivos:
        if escuela not in grupos:
            grupos[escuela] = []
        grupos[escuela].append((year, semester, filename))

    for escuela in grupos:
        grupos[escuela].sort(key=lambda x: (-x[0], -x[1]))

    return grupos


def parsear_horario(horario_str):
    horario_str = horario_str.strip()
    if not horario_str:
        return []

    resultados = []
    partes = [p.strip() for p in horario_str.split(";")]

    for parte in partes:
        m = PATRON_HORARIO.match(parte)
        if not m:
            continue

        dias_str = m.group(1).strip()
        time_range = m.group(2)

        dias = re.findall(r"\b(LU|MA|MI|JU|VI|SA|DO)\b", dias_str)
        if not dias:
            continue

        bloque = ""
        if time_range:
            time_range = time_range.strip()
            bloque = BLOQUE_POR_HORARIO.get(time_range, "")

        for dia in dias:
            resultados.append((dia, bloque))

    return resultados


def convertir_excel_a_json(filepath):
    import xlrd

    wb = xlrd.open_workbook(filepath)
    sheet = wb.sheet_by_index(0)

    secciones = []

    current = None

    for r in range(1, sheet.nrows):
        raw = [str(sheet.cell(r, c).value).strip() for c in range(12)]

        id_ramo = raw[0]
        nombre = raw[1]
        creditos = raw[2]
        asig_ref = raw[3]
        seccion = raw[4]
        evento = raw[5]
        horario_str = raw[6]
        profesor = raw[7]
        sede = raw[8]
        cat_paquete = raw[9]
        paquete = raw[10]
        vacantes = raw[11]

        if not id_ramo and not seccion:
            current = None
            continue

        if not id_ramo or not seccion:
            continue

        section_key = (id_ramo, seccion, paquete)

        if current and current["_key"] == section_key:
            pass
        else:
            current = {
                "_key": section_key,
                "id_ramo": id_ramo,
                "nombre": nombre,
                "creditos_asignatura": creditos,
                "asignatura_referenciada": asig_ref,
                "seccion": seccion,
                "horarios": [],
                "sede": sede,
                "categoria_paquete": cat_paquete,
                "paquete": paquete,
                "vacantes_paquete": vacantes,
                "profesor": profesor,
            }
            secciones.append(current)

        horarios_parsed = parsear_horario(horario_str)
        for dia, bloque in horarios_parsed:
            entry = [dia, bloque, evento]
            if entry not in current["horarios"]:
                current["horarios"].append(entry)

    for s in secciones:
        del s["_key"]

    resultado = OrderedDict()
    for s in secciones:
        ramo = s["id_ramo"]
        if ramo not in resultado:
            resultado[ramo] = []
        s_copy = {
            "id_ramo": s["id_ramo"],
            "nombre": s["nombre"],
            "creditos_asignatura": s["creditos_asignatura"],
            "asignatura_referenciada": s["asignatura_referenciada"],
            "seccion": s["seccion"],
            "horarios": s["horarios"],
            "sede": s["sede"],
            "categoria_paquete": s["categoria_paquete"],
            "paquete": s["paquete"],
            "vacantes_paquete": s["vacantes_paquete"],
            "profesor": s["profesor"],
        }
        resultado[ramo].append(s_copy)

    resultado[""] = [
        {
            "id_ramo": "",
            "nombre": "",
            "creditos_asignatura": "",
            "asignatura_referenciada": "",
            "seccion": "",
            "horarios": [],
            "sede": "",
            "categoria_paquete": "",
            "paquete": "",
            "vacantes_paquete": "",
            "profesor": "",
        }
    ]

    return resultado


def procesar_escuela(escuela):
    grupos = obtener_archivos_por_escuela()

    if escuela not in grupos:
        print(f"No se encontraron archivos para la escuela '{escuela}' en {OFERTAS_DIR}/")
        return False

    archivos = grupos[escuela]
    _, _, nombre_archivo = archivos[0]

    if len(archivos) > 1:
        print(
            f"Múltiples archivos para '{escuela}': "
            + ", ".join(f"{y}-{s}" for y, s, _ in archivos)
        )
    print(f"Usando: {nombre_archivo}")

    filepath = os.path.join(OFERTAS_DIR, nombre_archivo)
    data = convertir_excel_a_json(filepath)

    output_path = os.path.join(DATA_DIR, f"{escuela}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        f.write("\n")

    total_ramos = len([k for k in data if k])
    total_secciones = sum(len(v) for k, v in data.items() if k)
    print(f"Guardado: {output_path}")
    print(f"  {total_ramos} ramos, {total_secciones} secciones")
    return True


def main():
    args = sys.argv[1:]

    if not args or "--all" in args:
        grupos = obtener_archivos_por_escuela()
        if not grupos:
            print(f"No se encontraron archivos de oferta en {OFERTAS_DIR}/")
            return
        for escuela in sorted(grupos.keys()):
            print(f"\n=== {escuela} ===")
            procesar_escuela(escuela)
    else:
        for escuela in args:
            if escuela.startswith("--"):
                continue
            print(f"\n=== {escuela} ===")
            procesar_escuela(escuela)


if __name__ == "__main__":
    main()
