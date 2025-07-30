"use client";

import { useEffect, useState } from "react";

const Card = ({ info, bloque, catedraColor, ayudantiaColor, labColor }) => {
  const [ayudantia, setAyudantia] = useState(false);
  const [catedra, setCatedra] = useState(false);
  const [laboratorio, setLaboratorio] = useState(false);

  useEffect(() => {
    const verificarAyudantia = () => {
      if (
        info?.horarios
          ?.find((h) => h[0] === bloque[0] && h[1] === bloque[1])[2]
          .includes("AYUDANTÍA")
      ) {
        setAyudantia(true);
      } else {
        setAyudantia(false);
      }
      if (
        info?.horarios
          ?.find((h) => h[0] === bloque[0] && h[1] === bloque[1])[2]
          .includes("CÁTEDRA")
      ) {
        setCatedra(true);
      } else {
        setCatedra(false);
      }
      if (
        info?.horarios
          ?.find((h) => h[0] === bloque[0] && h[1] === bloque[1])[2]
          .includes("LABORATORIO")
      ) {
        setLaboratorio(true);
      } else {
        setLaboratorio(false);
      }
    };

    verificarAyudantia();
  }, [info, bloque]);

  return (
    <td
      style={{
        backgroundColor: ayudantia ? ayudantiaColor : catedra ? catedraColor : laboratorio ? labColor : "",
      }}
    >
      <div style={{}}>
        {/* <p style={{ fontSize: "15px", marginBottom: "1px" }}>{info?.id_ramo}</p> */}
        <p style={{ fontSize: "15px", marginBottom: "2px" }}>{info?.nombre}</p>
        <p style={{ fontSize: "13px", marginBottom: "2px" }}>
          {
            info?.horarios?.find(
              (h) => h[0] === bloque[0] && h[1] === bloque[1]
            )[2]
          }
        </p>
        <p style={{ fontSize: "12px", marginBottom: "0px", color: "gray" }}>
          {info?.profesor}
        </p>
        <span style={{ color: "gray", fontSize: "12px" }}>
          <small>{info?.seccion}</small>
        </span>
      </div>
    </td>
  );
};

export default Card;
