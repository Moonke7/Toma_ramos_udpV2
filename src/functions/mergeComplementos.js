const DIAS = ["LU", "MA", "MI", "JU", "VI"];

export default function mergeComplementos(horario, complementos) {
  if (!complementos || complementos.length === 0) return horario;

  const merged = {};
  for (const dia of DIAS) {
    merged[dia] = { ...(horario?.[dia] || {}) };
  }

  for (const comp of complementos) {
    for (const h of comp.horarios) {
      const [dia, bloque] = h;
      if (!dia || !bloque) continue;
      if (merged[dia][bloque]) continue;
      merged[dia][bloque] = comp;
    }
  }

  return merged;
}
