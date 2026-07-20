"use client";
import "@/styles/selector.css";
import { useState, useRef, useEffect, useMemo } from "react";

const Selector = ({
  ramosTomados,
  ramos,
  indice,
  handleSelectorChange,
  handleSelectorDelete,
}) => {
  const [mouseOn, setMouseOn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);

  const selectedCode = ramosTomados[indice];

  const selectedName = useMemo(() => {
    if (!selectedCode) return "";
    for (const [, courses] of Object.entries(ramos)) {
      for (const [code, name] of courses) {
        if (code === selectedCode) return name;
      }
    }
    return "";
  }, [selectedCode, ramos]);

  const filtered = useMemo(() => {
    if (!inputValue) return ramos;
    const search = inputValue.toLowerCase();
    const result = {};
    Object.entries(ramos).forEach(([category, courses]) => {
      const matched = courses.filter(
        ([code, name]) =>
          code.toLowerCase().includes(search) ||
          name.toLowerCase().includes(search)
      );
      if (matched.length > 0) result[category] = matched;
    });
    return result;
  }, [ramos, inputValue]);

  const selectableItems = useMemo(() => {
    const items = [];
    Object.entries(filtered).forEach(([category, courses]) => {
      courses.forEach(([code, name]) => {
        const isDisabled =
          ramosTomados.includes(code) && ramosTomados[indice] !== code;
        if (!isDisabled) items.push({ code, name, category });
      });
    });
    return items;
  }, [filtered, ramosTomados, indice]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (code) => {
    if (ramosTomados.includes(code) && ramosTomados[indice] !== code) return;
    setInputValue("");
    setIsOpen(false);
    handleSelectorChange({ target: { value: code } }, indice);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : selectableItems.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectableItems[highlightedIndex]) {
          handleSelect(selectableItems[highlightedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleMouseEnterDelete = () => setMouseOn(true);
  const handleMouseLeaveDelete = () => setMouseOn(false);

  const displayValue = inputValue || selectedName;

  return (
    <div className="RamoSelector" ref={wrapperRef}>
      <div className="selector-wrapper">
        <input
          className="searchInput"
          type="text"
          placeholder={!selectedName ? "Selecciona un ramo..." : ""}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />
        {isOpen && (
          <div className="dropdown">
            {Object.entries(filtered).map(([category, courses]) => (
              <div className="dropdown-group" key={category}>
                <div className="dropdown-group-header">{category}</div>
                {courses.map(([code, name]) => {
                  const isDisabled =
                    ramosTomados.includes(code) &&
                    ramosTomados[indice] !== code;
                  const highlightedCode =
                    selectableItems[highlightedIndex]?.code;
                  const isHighlighted = highlightedCode === code;

                  return (
                    <div
                      key={code}
                      className={`dropdown-item${isHighlighted ? " highlighted" : ""}${isDisabled ? " disabled" : ""}`}
                      onMouseDown={() => handleSelect(code)}
                      onMouseEnter={() => {
                        const idx = selectableItems.findIndex(
                          (item) => item.code === code
                        );
                        if (idx !== -1) setHighlightedIndex(idx);
                      }}
                    >
                      {name} - {code}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="deleteButton"
        type="button"
        onClick={(e) => handleSelectorDelete(e, indice)}
        disabled={ramosTomados.length <= 1}
        onMouseEnter={handleMouseEnterDelete}
        onMouseLeave={handleMouseLeaveDelete}
        style={{
          border: `solid 2px ${mouseOn ? "#ff9999" : "#ff2d2d"}`,
        }}
      >
        <i
          className="fas fa-trash"
          style={{ color: mouseOn ? "#ff9999" : "#ff2d2d" }}
          aria-hidden="true"
        ></i>
      </button>
    </div>
  );
};

export default Selector;
