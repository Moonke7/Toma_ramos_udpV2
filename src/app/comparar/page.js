"use client";
import Horario from "@/components/Horario";
import { useEffect, useState } from "react";

//estilos
import "@/styles/comparador.css";
import Link from "next/link";

function Comparar() {
  const [horarios, setHorarios] = useState([]);
  const [catedraColor, setCatedraColor] = useState("#faf6f2");
  const [ayudantiaColor, setAyudantiaColor] = useState("#f3f0ff");
  const [labColor, setLabColor] = useState("#ebf8ff");

  useEffect(() => {
    const horariosGuardados = JSON.parse(
      window.localStorage.getItem("horariosGuardados") || "[]"
    );
    console.log("Horarios guardados", horariosGuardados);
    setHorarios(horariosGuardados);
  }, []);

  return (
    <div className="compararContainer">
      <h1>Horarios guardados</h1>
      <div className="buttons">
        <Link href="/">
          <button>
            Volver al inicio <i class="fa-solid fa-house"></i>
          </button>
        </Link>
        <Link href="/selector">
          <button>
            Volver a generar horarios <i class="fa-solid fa-calendar-days"></i>
          </button>
        </Link>
        <button
          onClick={() => {
            localStorage.clear();
            setHorarios([]);
          }}
        >
          Limpiar horarios <i class="fa-solid fa-trash"></i>
        </button>
      </div>

      {horarios.map((horario, index) => (
        <Horario
          key={index}
          secciones={horario.secciones}
          horario={horario.horario}
          catedraColor={catedraColor}
          ayudantiaColor={ayudantiaColor}
          labColor={labColor}
        />
      ))}
    </div>
  );
}

export default Comparar;
