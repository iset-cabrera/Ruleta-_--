import { useEffect, useState, useRef, memo } from "react";
import { Wheel } from "react-custom-roulette";
import { useNavigate } from "react-router-dom";
import "../App.css";
import tickSound from "../assets/tick.mp3";
import winSound from "../assets/WIN.mp3";
import { api } from "../config/api";

// 🎯 COMPONENTE MEMOIZADO
const Ruleta = memo(({ mustSpin, prizeNumber, data, onStopSpinning }) => {
  return (
    <div className="ruleta-wrapper">
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        backgroundColors={["#f2d7d5", "#82e0aa", "#f8f9f9", "#82e0aa"]}
        textColors={["#1f2937"]}
        fontSize={13}
        outerBorderWidth={2}
        outerBorderColor={"#d1d5db"}
        radiusLineWidth={0.5}
        radiusLineColor={"#d1d5db"}
        innerRadius={25}
        onStopSpinning={onStopSpinning}
      />
      <img src="/assets/centro.png" alt="logo" className="imagen-centro" />
    </div>
  );
});

const HomePage = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [ganador, setGanador] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [error, setError] = useState(null);

  const audioRef = useRef(new Audio(tickSound));
  const winSoundRef = useRef(new Audio(winSound));
  const nombreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current.volume = 0.3;
    audioRef.current.loop = true;
    winSoundRef.current.volume = 0.6;
  }, []);

  // ✅ MOSTRAR NOMBRES CON useRef SIN CAUSAR RENDER
  useEffect(() => {
    let intervalo = null;

    if (mustSpin && funcionarios.length > 0) {
      intervalo = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * funcionarios.length);
        if (nombreRef.current) {
          nombreRef.current.innerText = funcionarios[randomIndex].nombre_completo;
        }
      }, 40);
    } else if (nombreRef.current) {
      nombreRef.current.innerText = "";
    }

    return () => clearInterval(intervalo);
  }, [mustSpin, funcionarios]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener evento activo
      const eventoRes = await api.get('/api/eventos/activo');
      const evento = eventoRes.data;
      setEventoActivo(evento);

      // Obtener solo funcionarios activos
      const funcionariosRes = await api.get('/api/funcionarios?filtro=activos');

      // Obtener ganadores del evento activo
      const ganadoresRes = await api.get(
        `/api/ganadores?evento_id=${evento.id}`
      );

      const ganadoresCI = ganadoresRes.data.map((g) => g.ci);
      const disponibles = funcionariosRes.data
        .filter((f) => !ganadoresCI.includes(f.ci))
        .map((f) => ({
          option: " ",
          ci: f.ci,
          nombre_completo: f.nombre_completo,
          sucursal_codigo: f.sucursal_codigo,
          sucursal: f.sucursal_nombre,
          socio_numero: f.socio_numero,
        }));

      setFuncionarios(disponibles);
      setHistorial(ganadoresRes.data);
      setError(null);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      if (error.response?.status === 404) {
        setError("No hay un evento activo. Contacte al administrador.");
      } else {
        setError("Error al cargar datos del sistema.");
      }
    }
  };

  const handleSpinClick = () => {
    if (!eventoActivo) {
      alert("No hay un evento activo");
      return;
    }

    if (funcionarios.length === 0) {
      alert("No hay funcionarios disponibles para sortear");
      return;
    }

    const index = Math.floor(Math.random() * funcionarios.length);
    setPrizeNumber(index);
    setMustSpin(true);
    audioRef.current.play();
  };

  const registrarGanador = () => {
    const seleccionado = funcionarios[prizeNumber];
    if (seleccionado && eventoActivo) {
      api
        .post('/api/registrar_ganador', {
          nombre_completo: seleccionado.nombre_completo,
          ci: seleccionado.ci,
          sucursal_codigo: seleccionado.sucursal_codigo,
          socio_numero: seleccionado.socio_numero,
          concepto: eventoActivo.nombre,
          evento_id: eventoActivo.id,
        })
        .then(() => {
          winSoundRef.current.play();
          setGanador(seleccionado);
          setMustSpin(false);
          // Recargar datos
          fetchData();
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            alert(error.response.data.message);
          } else {
            console.error("Error desconocido al registrar ganador", error);
          }
        });
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state-container" >
          <div className="error-icon-wrapper">
            <div className="error-icon-circle">
              <svg 
                className="error-icon" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          
          <div className="error-content">
            <h1 className="error-title">No hay un evento activo</h1>
            <p className="error-message">
              Para poder usar la ruleta, primero debe crear un evento activo desde el panel de administración.
            </p>
          </div>

          <div className="error-actions">
            <button 
              className="error-btn-primary" 
              onClick={() => navigate("/admin")}
            >
              <svg 
                className="btn-icon" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              Ir al Panel de Administración
            </button>
          </div>

          <div className="error-footer">
            <p className="error-hint">
              💡 <strong>Tip:</strong> Un evento activo permite gestionar sorteos y registrar ganadores
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header-bar">
        <h1>Ruleta de Sorteo Reducto</h1>
        {eventoActivo && (
          <div className="evento-badge">
            <span>🎯 {eventoActivo.nombre}</span>
          </div>
        )}
        <button className="admin-link-btn" onClick={() => navigate("/admin")}>
          📊 Panel Admin
        </button>
      </div>

      {funcionarios.length > 0 && (
        <div className="main-flex">
          <div className="ruleta-wrapper">
            {mustSpin && (
              <div className="nombre-dinamico-overlay">
                <h2 ref={nombreRef}></h2>
              </div>
            )}

            <Ruleta
              mustSpin={mustSpin}
              prizeNumber={prizeNumber}
              data={funcionarios}
              onStopSpinning={registrarGanador}
            />
            <img src="/assets/centro.png" alt="logo" className="imagen-centro" />
          </div>
        </div>
      )}

      {funcionarios.length === 0 && eventoActivo && (
        <div className="no-funcionarios">
          <p>Ya no hay funcionarios disponibles para sortear en este evento</p>
        </div>
      )}

      {funcionarios.length > 0 && (
        <button className="girar-btn" onClick={handleSpinClick}>
          ¡Girar Ruleta!
        </button>
      )}

      {ganador && (
        <div className="modal-overlay">
          <div className="modal-ganador">
            <h2 className="brillante">🏆 ¡GANADOR!</h2>
            <h2 className="ci-ganador">{ganador.sucursal}</h2>
            <p className="nombre-ganador">{ganador.nombre_completo}</p>
            <p className="ci-ganador">CI: {ganador.ci}</p>
            <button className="cerrar-btn" onClick={() => setGanador(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className="tabla-historial">
          <h2>Ganadores del Evento</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CI</th>
                <th>Número de Socio</th>
                <th>Sucursal</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((g, i) => (
                <tr key={i}>
                  <td>{g.nombre_completo}</td>
                  <td>{g.ci}</td>
                  <td>{g.socio_numero}</td>
                  <td>{g.sucursal}</td>
                  <td>{g.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HomePage;

