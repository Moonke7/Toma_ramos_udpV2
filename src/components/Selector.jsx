"use client";
import "@/styles/selector.css";
import { useState } from "react";

const Selector = ({
  ramosTomados,
  ramos,
  indice,
  handleSelectorChange,
  handleSelectorDelete,
}) => {
  const [mouseOn, setMouseOn] = useState(false);

  const handleMouseEnter = () => {
    setMouseOn(true);
  };

  const handleMouseLeave = () => {
    setMouseOn(false);
  };

  return (
    <div className="RamoSelector">
      <select
        className="form-select mb-3 me-2"
        name={`ramo-${ramosTomados.length}`}
        id={`ramo-${ramosTomados.length}`}
        onChange={(e) => handleSelectorChange(e, indice)}
        value={ramosTomados[indice]}
      >
        <option value="" disabled>
          ---- Selecciona un ramo ----
        </option>
        {Object.keys(ramos).map((g) => (
          <optgroup label={g} key={g}>
            {ramos[g].map((r) => (
              <option
                value={r[0]}
                key={r[0]}
                disabled={
                  ramosTomados.includes(r[0]) && ramosTomados[indice] !== r[0]
                }
              >
                {r[1]} - {r[0]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <button
        className={"deleteButton"}
        type="button"
        onClick={(e) => handleSelectorDelete(e, indice)}
        disabled={ramosTomados.length <= 1}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          border: `solid 2px ${mouseOn ? "#ff9999" : "#ff2d2d"}`,
        }}
      >
        <i className="fas fa-trash" style={{ color: mouseOn ? "#ff9999" : "#ff2d2d" }} aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default Selector;
