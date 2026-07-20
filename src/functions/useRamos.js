'use client';

import { useState, useEffect } from "react";

const useRamos = () => {
  const [ramos, setRamos] = useState({});
  const [ramosTotales, setRamosTotales] = useState({});

  useEffect(() => {
    const loadAll = async () => {
      let combined = {};
      for (const file of ["informatica", "industrias", "cfg"]) {
        try {
          const mod = await import(`../data/${file}.json`);
          combined = { ...combined, ...mod.default };
        } catch { /* archivo no encontrado, se omite */ }
      }
      setRamosTotales(combined);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (Object.keys(ramosTotales).length === 0) return;
    let opcionesRamos = Object.keys(ramosTotales);
    opcionesRamos = opcionesRamos.map((p) => [p, ramosTotales[p][0].nombre]);
    const ramosSegunTematica = {
      "Ciencias básicas": [],
      Ingenieria: [],
      Informática: [],
      Ingles: [],
      "Formación general": [],
      Desconocido: [],
    };
    opcionesRamos.forEach((r) => {
      let codigo = r[0].slice(0, 3);
      if (codigo.includes("CB")) {
        ramosSegunTematica["Ciencias básicas"].push(r);
      } else if (codigo === "CIT") {
        ramosSegunTematica["Informática"].push(r);
      } else if (codigo === "CFG") {
        ramosSegunTematica["Formación general"].push(r);
      } else if (codigo === "CII") {
        ramosSegunTematica["Ingenieria"].push(r);
      } else if (codigo === "CIG") {
        ramosSegunTematica["Ingles"].push(r);
      } else {
        ramosSegunTematica["Desconocido"].push(r);
      }
    });
    setRamos(ramosSegunTematica);
  }, [ramosTotales]);
  return [ramos, setRamos, ramosTotales];
};
export default useRamos;
