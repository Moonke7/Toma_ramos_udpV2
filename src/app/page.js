import "../styles/main.css";

export default function Home() {
  return (
    <div className="container">
      <div className="ButtonsContainer">
        <button>
          <a href="/about">
            <span>Generador de horarios</span>
          </a>
        </button>

        <button>
          <a href="/about">
            <span>Comparar horarios</span>
          </a>
        </button>
      </div>
    </div>
  );
}
