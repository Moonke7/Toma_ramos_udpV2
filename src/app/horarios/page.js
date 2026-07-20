"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import Horario from "@/components/Horario";
import generarHorarios from "@/functions/generarHorario";
import ordenarHorariosSegunVentanas from "@/functions/ordenarPorVentana";
import InfoSeccion from "@/components/InfoSeccion";
import {
  getCompatibleAyudantias,
  getCompatibleCFGs,
} from "@/functions/getCompatibles";

// estilos
import "@/styles/horario.css";
import ChangeColor from "@/components/ChangeColor";

const diasLabels = { LU: "Lun", MA: "Mar", MI: "Mié", JU: "Jue", VI: "Vie" };

const Horarios = () => {
  let [ramos, setRamos] = useState([]);
  const [combinacionActual, setCombinacionActual] = useState(0);
  const [combinaciones, setCombinaciones] = useState([]);
  const [catedraColor, setCatedraColor] = useState("#faf6f2");
  const [ayudantiaColor, setAyudantiaColor] = useState("#f3f0ff");
  const [labColor, setLabColor] = useState("#ebf8ff");

  const [showAyudantias, setShowAyudantias] = useState(false);
  const [showCFGs, setShowCFGs] = useState(false);
  const [compatiblesAyudantias, setCompatiblesAyudantias] = useState([]);
  const [compatiblesCFGs, setCompatiblesCFGs] = useState([]);
  const [complementos, setComplementos] = useState([]);

  useEffect(() => {
    ramos = setRamos(JSON.parse(window.localStorage.getItem("ramos")));
  }, []);
  useEffect(() => {
    setCombinaciones(
      ordenarHorariosSegunVentanas(generarHorarios(ramos?.filter((x) => x)))
    );
  }, [ramos]);

  useEffect(() => {
    setComplementos([]);
    setShowAyudantias(false);
    setShowCFGs(false);
  }, [combinacionActual]);

  const horarioActual = combinaciones[combinacionActual]?.horario;

  useEffect(() => {
    if (!horarioActual) return;
    getCompatibleAyudantias(horarioActual).then(setCompatiblesAyudantias);
    getCompatibleCFGs(horarioActual).then(setCompatiblesCFGs);
  }, [horarioActual]);

  const toggleAyudantias = useCallback(() => {
    setShowAyudantias((p) => !p);
    setShowCFGs(false);
  }, []);

  const toggleCFGs = useCallback(() => {
    setShowCFGs((p) => !p);
    setShowAyudantias(false);
  }, []);

  const addComplemento = useCallback((item) => {
    setComplementos((prev) => {
      const exists = prev.some(
        (c) =>
          c.tipo === item.tipo &&
          c.id_ramo === item.id_ramo &&
          c.seccion === item.seccion
      );
      if (exists) return prev;
      return [...prev, item];
    });
    setShowAyudantias(false);
    setShowCFGs(false);
  }, []);

  const removeComplemento = useCallback((item) => {
    setComplementos((prev) =>
      prev.filter(
        (c) =>
          !(c.tipo === item.tipo && c.id_ramo === item.id_ramo && c.seccion === item.seccion)
      )
    );
  }, []);

  if (ramos && combinaciones.length === 0) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  if (!ramos || ramos.every((x) => !x) || combinaciones.length === 0) {
    console.log("No hay ramos seleccionados");
  }
  const secciones = combinaciones[combinacionActual]?.secciones;
  const combinationChange = (combinationId) => {
    setCombinacionActual(Number.parseInt(combinationId));
  };

  const guardarHorario = () => {
    const horario = {
      ...combinaciones[combinacionActual],
      complementos,
    };

    const horariosGuardados = JSON.parse(
      window.localStorage.getItem("horariosGuardados") || "[]"
    );

    horariosGuardados.push(horario);

    window.localStorage.setItem(
      "horariosGuardados",
      JSON.stringify(horariosGuardados)
    );

    alert("Horario guardado exitosamente");
  };

  const descargarExcel = async () => {
    const response = await fetch("/api/descargar-excel", {
      method: "POST",
      body: JSON.stringify({
        horario: combinaciones[combinacionActual]?.horario,
        complementos,
        colorCatedra: catedraColor,
        colorAyudantia: ayudantiaColor,
        colorLab: labColor,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      alert("Error al generar el archivo");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "horario.xlsx";
    a.click();
    a.remove();
  };

  return (
    <>
      <div className="compatibles-bar">
        <div className="compButtonWrapper">
          <button
            className={`compButton ${showAyudantias ? "active" : ""}`}
            onClick={toggleAyudantias}
          >
            <span className="compButtonIcon">🧑‍🏫</span>
            <span className="compButtonLabel">Ver Ayudantías Compatibles</span>
            <span className="compCount">{compatiblesAyudantias.length}</span>
          </button>
          {showAyudantias && (
            <div className="compDropdown">
              {compatiblesAyudantias.length === 0 ? (
                <div className="compDropdownEmpty">
                  No hay ayudantías disponibles
                </div>
              ) : (
                compatiblesAyudantias.map((item, i) => {
                  const added = complementos.some(
                    (c) =>
                      c.tipo === item.tipo &&
                      c.id_ramo === item.id_ramo &&
                      c.seccion === item.seccion
                  );
                  return (
                    <div
                      className={`compDropdownItem ${added ? "added" : ""}`}
                      key={`ay-${item.id_ramo}-${item.dia}-${item.bloque}-${i}`}
                      onClick={() => {
                        if (added) {
                          removeComplemento(item);
                        } else {
                          addComplemento(item);
                        }
                      }}
                    >
                      <div className="compDropdownItem-main">
                        <span className="compDropdownItem-code">
                          {item.id_ramo}
                        </span>
                        <span className="compDropdownItem-name">
                          {item.nombre}
                        </span>
                      </div>
                      <div className="compDropdownItem-sub">
                        <span className="compDropdownItem-prof">
                          {item.profesor}
                        </span>
                        <span className="compDropdownItem-slot">
                          {diasLabels[item.dia]} {item.bloque}
                        </span>
                      </div>
                      <div className="compDropdownItem-badge">
                        {added ? "✓ Agregado" : "Agregar"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="compButtonWrapper">
          <button
            className={`compButton ${showCFGs ? "active" : ""}`}
            onClick={toggleCFGs}
          >
            <span className="compButtonIcon">📚</span>
            <span className="compButtonLabel">Ver CFGs Compatibles</span>
            <span className="compCount">{compatiblesCFGs.length}</span>
          </button>
          {showCFGs && (
            <div className="compDropdown">
              {compatiblesCFGs.length === 0 ? (
                <div className="compDropdownEmpty">
                  No hay CFGs disponibles
                </div>
              ) : (
                compatiblesCFGs.map((item, i) => {
                  const added = complementos.some(
                    (c) =>
                      c.tipo === item.tipo &&
                      c.id_ramo === item.id_ramo &&
                      c.seccion === item.seccion
                  );
                  return (
                    <div
                      className={`compDropdownItem ${added ? "added" : ""}`}
                      key={`cfg-${item.id_ramo}-${item.seccion}-${i}`}
                      onClick={() => {
                        if (added) {
                          removeComplemento(item);
                        } else {
                          addComplemento(item);
                        }
                      }}
                    >
                      <div className="compDropdownItem-main">
                        <span className="compDropdownItem-code">
                          {item.id_ramo}
                        </span>
                        <span className="compDropdownItem-name">
                          {item.nombre}
                        </span>
                      </div>
                      <div className="compDropdownItem-sub">
                        <span className="compDropdownItem-prof">
                          {item.profesor}
                        </span>
                        <span className="compDropdownItem-slot">
                          {item.horarios
                            .filter((h) => h[1])
                            .map(
                              (h) =>
                                `${diasLabels[h[0]]} ${h[1]}`
                            )
                            .join(", ")}
                        </span>
                      </div>
                      <div className="compDropdownItem-badge">
                        {added ? "✓ Agregado" : "Agregar"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className="colorChanger">
        <ul>
          <li>
            Catedra:{" "}
            <ChangeColor color={catedraColor} setColor={setCatedraColor} />
          </li>
          <li>
            Ayudantia:{" "}
            <ChangeColor color={ayudantiaColor} setColor={setAyudantiaColor} />
          </li>
          <li>
            Laboratorio: <ChangeColor color={labColor} setColor={setLabColor} />
          </li>
        </ul>
      </div>

      {complementos.length > 0 && (
        <div className="complementos-activos">
          <span className="complementos-activos-title">
            Añadidos ({complementos.length})
          </span>
          {complementos.map((c, i) => (
            <span key={`comp-${i}`} className="complemento-chip">
              <span>
                {c.id_ramo} - {c.nombre.slice(0, 30)}
                {c.nombre.length > 30 ? "…" : ""}
              </span>
              <button
                className="complemento-chip-remove"
                onClick={() => removeComplemento(c)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="horarioContainer">
        <div className="col-8" style={{ paddingRight: 0 }}>
          <Horario
            secciones={secciones}
            horario={horarioActual}
            complementos={complementos}
            catedraColor={catedraColor}
            ayudantiaColor={ayudantiaColor}
            labColor={labColor}
          />

          <div style={{ width: "fit-content", margin: "auto" }}>
            <ul className="pagination">
              <li
                className={`page-item ${combinacionActual === 0 && "disabled"}`}
              >
                <button
                  disabled={combinacionActual === 0}
                  className="page-link disabled"
                  onClick={() => {
                    setCombinacionActual(combinacionActual - 1);
                  }}
                >
                  &laquo;
                </button>
              </li>
              <li className="page-item active">
                <span className="page-link">
                  {combinacionActual + 1} / {combinaciones.length}
                </span>
              </li>
              <li
                className={`page-item ${
                  combinacionActual + 1 === combinaciones.length && "disabled"
                }`}
              >
                <button
                  disabled={combinacionActual + 1 === combinaciones.length}
                  className="page-link disabled"
                  onClick={() => {
                    setCombinacionActual(combinacionActual + 1);
                  }}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </div>
          <p className="text-muted" style={{ fontSize: "12px" }}>
            (Los horarios están ordenados según el numero de ventanas)
          </p>
        </div>
        <div className="seccSelector">
          <div className="list-group">
            {secciones?.map((s, index) => (
              <InfoSeccion
                seccion={s}
                key={s.paquete}
                combinaciones={combinaciones}
                secciones={secciones}
                handleCombinationChange={combinationChange}
                combinacionActual={combinacionActual}
                index={index}
              />
            ))}
          </div>

          <div className="buttons">
            <Link href="/">Volver al inicio</Link>
            <Link href="/selector">Volver al selector de ramos</Link>
            <Link href="" id="saveButton" onClick={guardarHorario}>
              Guardar este horario
            </Link>
          </div>
        </div>
      </div>

      <button id="downloadButton" onClick={descargarExcel}>Descargar Excel con el horario</button>
    </>
  );
};

export default Horarios;
