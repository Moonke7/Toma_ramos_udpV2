"use client";
//hooks
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useRamos from "@/functions/useRamos";

//components
import Selector from "@/components/Selector";

// estilos
import "@/styles/selector.css";

const Home = () => {
  const [ramos, , ramosTotales] = useRamos();
  const [ramosTomados, setRamosTomados] = useState([""]);
  const router = useRouter();

  const handleSelectorChange = (e, index) =>
    setRamosTomados([
      ...ramosTomados.slice(0, index),
      e.target.value,
      ...ramosTomados.slice(index + 1),
    ]);
  const handleSelectorDelete = (e, index) => {
    setRamosTomados([
      ...ramosTomados.slice(0, index),
      ...ramosTomados.slice(index + 1),
    ]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/horarios");
    localStorage.setItem(
      "ramos",
      JSON.stringify(ramosTomados.map((r) => ramosTotales[r]))
    );
  };

  return (
    <div className="container">
      <h1>Elige tus ramos</h1>
      <hr />
      <div className="">
        <form className="" onSubmit={handleSubmit}>
          {ramosTomados.map((_, i) => (
            <Selector
              ramos={ramos}
              ramosTomados={ramosTomados}
              key={i}
              indice={i}
              handleSelectorChange={handleSelectorChange}
              handleSelectorDelete={handleSelectorDelete}
            />
          ))}
          <button
            className="button"
            onClick={() => setRamosTomados([...ramosTomados, ""])}
            type="button"
          >
            {" "}
            + Otro Ramo
          </button>
          <hr />
          <div className="buttonsContainer">
            <button className="generate">
              Generar Horarios
            </button>
            <Link className="button" href="/">Volver al inicio</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
