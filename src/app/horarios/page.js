"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import Horario from "@/components/Horario";
import generarHorarios from "@/functions/generarHorario";
import ordenarHorariosSegunVentanas from "@/functions/ordenarPorVentana";
import InfoSeccion from "@/components/InfoSeccion";

// estilos
import "@/styles/horario.css";
import ChangeColor from "@/components/ChangeColor";

const Horarios = () => {
  let [ramos, setRamos] = useState([]);
  const [combinacionActual, setCombinacionActual] = useState(0);
  const [combinaciones, setCombinaciones] = useState([]);
  const [catedraColor, setCatedraColor] = useState("#faf6f2");
  const [ayudantiaColor, setAyudantiaColor] = useState("#f3f0ff");
  const [labColor, setLabColor] = useState("#ebf8ff");

  useEffect(() => {
    ramos = setRamos(JSON.parse(window.localStorage.getItem("ramos")));
  }, []);
  useEffect(() => {
    console.log("ramos", ramos);

    setCombinaciones(
      ordenarHorariosSegunVentanas(generarHorarios(ramos?.filter((x) => x)))
    );
  }, [ramos]);

  if (ramos && combinaciones.length === 0) {
    console.log(combinaciones);
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
    const horario = combinaciones[combinacionActual];
    console.log("Horario guardado", horario);

    // recuperar los horarios guardados
    const horariosGuardados = JSON.parse(
      window.localStorage.getItem("horariosGuardados") || "[]"
    );

    // agregar el nuevo horario
    horariosGuardados.push(horario);
    console.log("Horarios guardados", horariosGuardados);

    //console.log("Horario en json:", JSON.stringify(horario));

    // guardar los horarios actualizados
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

      <div className="horarioContainer">
        <div className="col-8" style={{ paddingRight: 0 }}>
          <Horario
            secciones={secciones}
            horario={combinaciones[combinacionActual]?.horario}
            catedraColor={catedraColor}
            ayudantiaColor={ayudantiaColor}
            labColor={labColor}
          />
          {/* <p className="">También puedes probar otras combinaciones:</p> */}

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
        <div className="seccSelector" style={{ paddingLeft: 0 }}>
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
