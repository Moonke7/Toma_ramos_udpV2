"use client";
import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useRamos from "@/functions/useRamos";
import Selector from "@/components/Selector";
import "@/styles/selector.css";
import industriasMalla from "@/data/industrias-malla.json";
import informaticaMalla from "@/data/informatica-malla.json";

const mallas = { industrias: industriasMalla, informatica: informaticaMalla };

const carreras = [
  { value: "industrias", label: "Ingeniería Industrial" },
  { value: "informatica", label: "Ingeniería Informática" },
];

const semestres = Array.from({ length: 10 }, (_, i) => `${
  ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i]
} SEMESTRE`);

const Home = () => {
  const [ramos, , ramosTotales] = useRamos();
  const [ramosTomados, setRamosTomados] = useState([]);
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const router = useRouter();

  const handleCarreraChange = useCallback((e) => {
    setCarrera(e.target.value);
    setSemestre("");
    setRamosTomados([]);
  }, []);

  const handleSemestreChange = useCallback((e) => {
    const sem = e.target.value;
    setSemestre(sem);
    if (carrera && sem) {
      const codes = mallas[carrera][sem];
      const validCodes = codes.filter((c) => ramosTotales[c]);
      setRamosTomados(validCodes.length ? validCodes : [""]);
    }
  }, [carrera, ramosTotales]);

  const handleSelectorChange = useCallback((e, index) => {
    setRamosTomados((prev) => [
      ...prev.slice(0, index),
      e.target.value,
      ...prev.slice(index + 1),
    ]);
  }, []);

  const handleSelectorDelete = useCallback((e, index) => {
    setRamosTomados((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const validos = ramosTomados.filter((r) => r && ramosTotales[r]);
    if (!validos.length) return;
    router.push("/horarios");
    localStorage.setItem(
      "ramos",
      JSON.stringify(validos.map((r) => ramosTotales[r]))
    );
  }, [ramosTomados, ramosTotales, router]);

  const agregarRamo = useCallback(() => {
    setRamosTomados((prev) => [...prev, ""]);
  }, []);

  const hayCodigos = useMemo(
    () => ramosTomados.some((r) => r && ramosTotales[r]),
    [ramosTomados, ramosTotales]
  );

  return (
    <div className="container">
      <h1>Elige tus ramos</h1>
      <hr />

      <div className="malla-selectors">
        <div className="malla-field">
          <label htmlFor="carrera">Carrera</label>
          <select id="carrera" value={carrera} onChange={handleCarreraChange}>
            <option value="">Selecciona carrera</option>
            {carreras.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="malla-field">
          <label htmlFor="semestre">Semestre</label>
          <select id="semestre" value={semestre} onChange={handleSemestreChange} disabled={!carrera}>
            <option value="">Selecciona semestre</option>
            {semestres.map((s) => (
              <option key={s} value={s}>{s.replace(" SEMESTRE", "")}</option>
            ))}
          </select>
        </div>
      </div>

      {!carrera && (
        <p className="malla-hint">Selecciona una carrera y semestre para cargar los ramos sugeridos, o agrega ramos manualmente.</p>
      )}

      <hr />

      <form onSubmit={handleSubmit}>
        {ramosTomados.length === 0 ? (
          <button className="button" type="button" onClick={agregarRamo}>
            + Agregar Ramo
          </button>
        ) : (
          ramosTomados.map((_, i) => (
            <Selector
              ramos={ramos}
              ramosTomados={ramosTomados}
              key={i}
              indice={i}
              handleSelectorChange={handleSelectorChange}
              handleSelectorDelete={handleSelectorDelete}
            />
          ))
        )}

        <button className="button" type="button" onClick={agregarRamo}>
          + Otro Ramo
        </button>

        <hr />
        <div className="buttonsContainer">
          <button className="generate" type="submit" disabled={!hayCodigos}>
            Generar Horarios
          </button>
          <Link className="button" href="/">Volver al inicio</Link>
        </div>
      </form>
    </div>
  );
};

export default Home;
