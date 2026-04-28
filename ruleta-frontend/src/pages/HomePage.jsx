import { useEffect, useState, useRef, memo, useCallback } from "react";
import { Wheel } from "react-custom-roulette";
import { useNavigate } from "react-router-dom";
import "../App.css";
import tickSound from "../assets/tick.mp3";
import winSound from "../assets/WIN.mp3";
import { api } from "../config/api";

/* ── Anillo de bombillas titilando ── */
const LightsRing = memo(() => {
  const count = 28;
  return (
    <div className="lights-ring" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="light-bulb"
          style={{
            transform: `rotate(${(i * 360) / count}deg) translateY(-400px)`,
            animationDelay: `${(i % 4) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
});

/* ── Puntero triangular dorado ── */
const PointerArrow = memo(() => (
  <div className="pointer-arrow" aria-hidden="true">
    <div className="pointer-jewel" />
    <div className="pointer-triangle" />
  </div>
));

/* ── Confeti masivo ── */
const CONFETTI_COLORS = [
  "#FFD700", "#FF6B9D", "#4ECDC4", "#FF6B6B", "#C7CEEA",
  "#FFE66D", "#45B7D1", "#FFAAA5", "#A8E6CF", "#FF6BCB",
  "#F8B195", "#F67280", "#C06C84", "#6C5B7B", "#355C7D",
];

const Confetti = memo(() => {
  const pieces = Array.from({ length: 140 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 2.5;
    const duration = 3 + Math.random() * 4;
    const size = 8 + Math.random() * 10;
    const drift = (Math.random() - 0.5) * 200;
    const rotateEnd = 360 + Math.random() * 720;
    const isCircle = i % 5 === 0;
    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          backgroundColor: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size * (isCircle ? 1 : 1.5)}px`,
          borderRadius: isCircle ? "50%" : "2px",
          "--drift": `${drift}px`,
          "--rotate-end": `${rotateEnd}deg`,
        }}
      />
    );
  });
  return <div className="confetti-container">{pieces}</div>;
});

const Ruleta = memo(({ mustSpin, prizeNumber, data, onStopSpinning }) => {
  const dataRef = useRef(data);
  const prizeRef = useRef(prizeNumber);
  const hasFrozenRef = useRef(false);

  // Congelar datos y premio SOLO cuando empieza a girar
  if (mustSpin && !hasFrozenRef.current) {
    dataRef.current = data;
    prizeRef.current = prizeNumber;
    hasFrozenRef.current = true;
  }
  if (!mustSpin) {
    hasFrozenRef.current = false;
  }

  return (
    <Wheel
      mustStartSpinning={mustSpin}
      prizeNumber={prizeRef.current === -1 ? 0 : prizeRef.current}
      data={dataRef.current.length > 0 ? dataRef.current : [{ option: "Cargando..." }]}
      onStopSpinning={onStopSpinning}
      spinDuration={10}
      backgroundColors={[
        "#B8E6CF",
        "#FFE4E1",
        "#FFF4C2",
        "#D4E8FF",
        "#E8D9F5",
        "#FFD9B8",
        "#D8F3DC",
        "#FFE9C7",
      ]}
      textColors={["#1B3A2A"]}
      fontSize={42}
      outerBorderWidth={8}
      outerBorderColor={"#C59B27"}
      radiusLineWidth={0}
      radiusLineColor={"transparent"}
      innerRadius={45}
      innerBorderColor={"transparent"}
      innerBorderWidth={0}
      perpendicularText={false}
      textDistance={100}
    />
  );
});

/* ── COMPONENTE DE CARTEL AISLADO ── */
const OverlayGanador = memo(({ mustSpin, ganador, funcionarios, prizeNumber }) => {
  const [countdown, setCountdown] = useState(null);
  const nombreRef = useRef(null);

  useEffect(() => {
    if (!mustSpin || funcionarios.length === 0) return;

    setCountdown(null);
    const startTime = Date.now();
    let timerId;

    const c3 = setTimeout(() => setCountdown(3), 6500);
    const c2 = setTimeout(() => setCountdown(2), 7500);
    const c1 = setTimeout(() => setCountdown(1), 8500);

    const update = () => {
      const elapsed = Date.now() - startTime;
      let interval = 20;
      if (elapsed > 6000) {
        const factor = (elapsed - 6000) / 1000;
        interval = 20 + (factor * factor * 50);
      }

      if (funcionarios.length > 0) {
        const randomIndex = Math.floor(Math.random() * funcionarios.length);
        if (nombreRef.current) {
          nombreRef.current.innerText = funcionarios[randomIndex].nombre_completo;
        }
      }

      timerId = setTimeout(update, interval);
    };

    update();
    return () => {
      clearTimeout(timerId);
      clearTimeout(c3);
      clearTimeout(c2);
      clearTimeout(c1);
    };
  }, [mustSpin, funcionarios]);

  if (!mustSpin && !ganador && prizeNumber === -1) {
    return (
      <div className="nombre-dinamico-overlay">
        <h2 className="pre-spin-message">¿Quién será el próximo ganador?</h2>
      </div>
    );
  }

  return (
    <div className="nombre-dinamico-overlay">
      <span className={`overlay-pretitle ${countdown ? 'countdown-active' : ''}`}>
        {countdown ? `GANADOR EN ${countdown}...` : "¡Felicidades al ganador!"}
      </span>
      {(ganador || (prizeNumber !== -1 && !mustSpin)) ? (
        <h2 className="ganador-final-anim">
          {ganador ? ganador.nombre_completo : (funcionarios[prizeNumber]?.nombre_completo || "")}
        </h2>
      ) : (
        <h2 ref={nombreRef} />
      )}
    </div>
  );
});

const HomePage = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(-1);
  const [ganador, setGanador] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [duplicateWinner, setDuplicateWinner] = useState(null); // Nuevo estado para duplicados

  const audioRef = useRef(new Audio(tickSound));
  const winSoundRef = useRef(new Audio(winSound));
  const nombreRef = useRef(null);
  const isSpinningRef = useRef(false);
  const registeringRef = useRef(false);
  const isFetchingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    isSpinningRef.current = mustSpin;
  }, [mustSpin]);

  useEffect(() => {
    audioRef.current.volume = 0.3;
    audioRef.current.loop = true;
    winSoundRef.current.volume = 0.6;
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const eventoRes = await api.get('/api/eventos/activo');
      const evento = eventoRes.data;
      setEventoActivo(evento);

      const funcionariosRes = await api.get('/api/funcionarios?filtro=activos');
      const ganadoresRes = await api.get(`/api/ganadores?evento_id=${evento.id}`);

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
    } catch (err) {
      console.error("Error al cargar datos:", err);
      if (err.response?.status === 404) {
        setError("No hay un evento activo. Contacte al administrador.");
      } else {
        setError("Error al cargar datos del sistema.");
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const handleSpinClick = () => {
    if (!eventoActivo || funcionarios.length === 0 || mustSpin) return;
    const index = Math.floor(Math.random() * funcionarios.length);
    setPrizeNumber(index);
    setMustSpin(true);
    setGanador(null);
    registeringRef.current = false;
    audioRef.current.play();
  };

  const registrarGanador = useCallback((force = false) => {
    if (registeringRef.current && !force) return;
    registeringRef.current = true;
    
    const seleccionado = force ? duplicateWinner : funcionarios[prizeNumber];

    if (seleccionado && eventoActivo) {
      isSpinningRef.current = false;
      setMustSpin(false);

      if (nombreRef.current) {
        nombreRef.current.innerText = seleccionado.nombre_completo;
      }

      api
        .post('/api/registrar_ganador', {
          nombre_completo: seleccionado.nombre_completo,
          ci: seleccionado.ci,
          sucursal_codigo: seleccionado.sucursal_codigo,
          socio_numero: seleccionado.socio_numero,
          concepto: eventoActivo.nombre,
          evento_id: eventoActivo.id,
          force: force, // Pasamos el flag de override
        })
        .then(() => {
          setDuplicateWinner(null);
          if (!ganador) {
            setTimeout(() => {
              winSoundRef.current.play();
              setGanador(seleccionado);
            }, 1500);
            fetchData();
          }
        })
        .catch((err) => {
          registeringRef.current = false;
          if (err.response?.data?.type === 'DUPLICATE_WINNER') {
            setDuplicateWinner(seleccionado);
          } else if (err.response?.status === 400) {
            alert(err.response.data.message);
          } else {
            console.error("Error al registrar ganador", err);
          }
        });
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [prizeNumber, funcionarios, eventoActivo, fetchData, duplicateWinner, ganador]);

  useEffect(() => {
    if (mustSpin) {
      const timer = setTimeout(() => {
        if (isSpinningRef.current) {
          registrarGanador();
        }
      }, 11500);
      return () => clearTimeout(timer);
    }
  }, [mustSpin, registrarGanador]);

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state-container">
          <div className="error-icon-wrapper">
            <div className="error-icon-circle">
              <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <div className="error-content">
            <h1 className="error-title">Sin evento activo</h1>
            <p className="error-message">
              Para utilizar la ruleta es necesario crear un evento activo desde el panel de administración.
            </p>
          </div>

          <div className="error-actions">
            <button className="error-btn-primary" onClick={() => navigate("/admin")}>
              <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Ir al Panel de Administración
            </button>
          </div>

          <div className="error-footer">
            <p className="error-hint">
              <strong>Tip:</strong> Un evento activo permite gestionar sorteos y registrar ganadores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button className={`admin-toggle-btn ${showAdmin ? 'active' : ''}`} onClick={() => setShowAdmin(!showAdmin)} title="Panel de Administración">
        {showAdmin ? '✕' : '⚙️'}
      </button>

      <div className={`header-bar ${showAdmin ? 'show' : 'hide'}`}>
        <h1>Ruleta de Sorteo</h1>
        {eventoActivo && (
          <div className="evento-badge">
            {eventoActivo.nombre}
          </div>
        )}
        <button className="admin-link-btn" onClick={() => navigate("/admin")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Panel Admin
        </button>
      </div>

      {funcionarios.length > 0 && (
        <div className="ruleta-stage">
          <div className="spotlight spotlight-left" aria-hidden="true" />
          <div className="spotlight spotlight-right" aria-hidden="true" />
          <div className="stage-floor-glow" aria-hidden="true">
            <div className="floor-light-spot" style={{ left: '20%' }} />
            <div className="floor-light-spot" style={{ left: '40%' }} />
            <div className="floor-light-spot" style={{ left: '60%' }} />
            <div className="floor-light-spot" style={{ left: '80%' }} />
          </div>

          <div className="main-flex">
            <div className={`ruleta-wrapper ${mustSpin ? 'spinning' : ''}`}>
              <OverlayGanador 
                mustSpin={mustSpin} 
                ganador={ganador} 
                funcionarios={funcionarios} 
                prizeNumber={prizeNumber} 
              />
              <PointerArrow />
              <LightsRing />
              <Ruleta
                mustSpin={mustSpin}
                prizeNumber={prizeNumber === -1 ? 0 : prizeNumber}
                data={funcionarios}
                onStopSpinning={registrarGanador}
              />
              <img src="/assets/centro.png" alt="logo" className="imagen-centro" />
            </div>
          </div>

          <div className="ruleta-podium" aria-hidden="true">
            <div className="podium-stand" />
            <div className="podium-tier podium-tier-1">
              <div className="podium-light" style={{ left: '25%', top: '15%' }} />
              <div className="podium-light" style={{ right: '25%', top: '15%' }} />
            </div>
            <div className="podium-tier podium-tier-2">
              <div className="podium-light" style={{ left: '15%', top: '25%' }} />
              <div className="podium-light" style={{ right: '15%', top: '25%' }} />
            </div>
            <div className="podium-tier podium-tier-3">
              <div className="podium-light" style={{ left: '10%', top: '35%' }} />
              <div className="podium-light" style={{ right: '10%', top: '35%' }} />
            </div>
          </div>

          <button className="girar-btn" onClick={handleSpinClick}>
            GIRAR
          </button>
        </div>
      )}

      {funcionarios.length === 0 && eventoActivo && (
        <div className="no-funcionarios">
          <p>No hay participantes disponibles para este evento.</p>
        </div>
      )}

      {duplicateWinner && (
        <div className="modal-overlay duplicate-overlay">
          <div className="modal-ganador duplicate-modal">
            <div className="duplicate-icon">🔄</div>
            <h2 className="duplicate-title">¡Repetición Detectada!</h2>
            <p className="duplicate-message">
              <strong>{duplicateWinner.nombre_completo}</strong> ya ganó anteriormente en este evento.
            </p>
            <div className="duplicate-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setDuplicateWinner(null);
                  setPrizeNumber(-1);
                  registeringRef.current = false;
                }}
              >
                Volver a Girar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => registrarGanador(true)}
              >
                Le damos el premio
              </button>
            </div>
          </div>
        </div>
      )}

      {ganador && (
        <>
          <Confetti />
          <div className="modal-overlay celebration-overlay">
            <div className="modal-ganador celebration-modal">
              <div className="celebration-rays" aria-hidden="true" />

              <div className="celebration-trophy">🏆</div>

              <div className="celebration-stars" aria-hidden="true">
                <span style={{ '--i': 0 }}>✦</span>
                <span style={{ '--i': 1 }}>★</span>
                <span style={{ '--i': 2 }}>✧</span>
                <span style={{ '--i': 3 }}>✨</span>
                <span style={{ '--i': 4 }}>✦</span>
                <span style={{ '--i': 5 }}>★</span>
              </div>

              <h2 className="brillante celebration-title">¡GANADOR!</h2>

              <div className="celebration-sucursal">{ganador.sucursal}</div>
              <p className="nombre-ganador celebration-name">{ganador.nombre_completo}</p>
              <p className="ci-ganador">
                {ganador.sucursal === 'DIRECTIVO' || ganador.sucursal === 'DIRECTIVOS' ? 'Nro de Socio' : 'CI'}: {ganador.ci}
              </p>

              <button
                className="cerrar-btn"
                onClick={() => {
                  setGanador(null);
                  setPrizeNumber(-1);
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </>
      )}

      {historial.length > 0 && (
        <div className="tabla-historial">
          <h2>Ganadores del Evento</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CI / Socio</th>
                <th>Sucursal</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((g, i) => (
                <tr key={i}>
                  <td>{g.nombre_completo}</td>
                  <td>{g.ci}</td>
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
