async function loadJSON(filename) {
  try {
    const mod = await import(`../data/${filename}.json`);
    return mod.default;
  } catch {
    return {};
  }
}

let _ramosTotales = null;
async function getRamosTotales() {
  if (_ramosTotales) return _ramosTotales;
  const [informatica, industrias] = await Promise.all([
    loadJSON("informatica"),
    loadJSON("industrias"),
  ]);
  _ramosTotales = { ...informatica, ...industrias };
  return _ramosTotales;
}

let _cfg = null;
async function getCFG() {
  if (_cfg) return _cfg;
  _cfg = await loadJSON("cfg");
  return _cfg;
}

const diasOrden = { LU: 0, MA: 1, MI: 2, JU: 3, VI: 4 };
const bloquesOrden = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8 };

function slotLibre(horario, dia, bloque) {
  return !horario?.[dia]?.[bloque];
}

export async function getCompatibleAyudantias(horario) {
  const ramosTotales = await getRamosTotales();
  const results = [];
  const seen = new Set();

  for (const [id_ramo, sections] of Object.entries(ramosTotales)) {
    for (const s of sections) {
      if (!s.horarios) continue;
      for (const h of s.horarios) {
        const [dia, bloque, tipo] = h;
        if (!tipo?.includes("AYUDANTÍA")) continue;
        if (!bloque) continue;
        if (!slotLibre(horario, dia, bloque)) continue;

        const key = `${id_ramo}|${dia}|${bloque}`;
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          tipo: "ayudantia",
          id_ramo,
          nombre: s.nombre,
          profesor: s.profesor || "Sin profesor",
          seccion: s.seccion,
          dia,
          bloque,
          horarios: [[dia, bloque, tipo]],
        });
      }
    }
  }

  results.sort((a, b) => {
    if (diasOrden[a.dia] !== diasOrden[b.dia])
      return diasOrden[a.dia] - diasOrden[b.dia];
    return bloquesOrden[a.bloque] - bloquesOrden[b.bloque];
  });

  return results;
}

export async function getCompatibleCFGs(horario) {
  const cfg = await getCFG();
  const results = [];

  for (const [id_ramo, sections] of Object.entries(cfg)) {
    for (const s of sections) {
      if (!s.horarios || s.horarios.length === 0) continue;

      const horariosConBloque = s.horarios.filter((h) => h[1]);
      if (horariosConBloque.length === 0) continue;

      const compatible = horariosConBloque.every(
        ([dia, bloque]) => slotLibre(horario, dia, bloque)
      );
      if (!compatible) continue;

      results.push({
        tipo: "cfg",
        id_ramo,
        nombre: s.nombre,
        profesor: s.profesor || "Sin profesor",
        seccion: s.seccion,
        horarios: s.horarios,
      });
    }
  }

  results.sort((a, b) => a.id_ramo.localeCompare(b.id_ramo));

  return results;
}
