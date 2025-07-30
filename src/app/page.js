import "../styles/main.css";

export default function Home() {
  return (
    <div className="container">
      <div className="ButtonsContainer">
        <button>
          <a href="/selector">
            <span>Generador de horarios</span>
          </a>
        </button>

        <button>
          <a href="/comparar">
            <span>Comparar horarios</span>
          </a>
        </button>
      </div>
    </div>
  );
}
