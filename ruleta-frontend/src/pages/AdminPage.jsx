import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import './AdminPage.css';

/* ── Inline SVG icons ── */
const IconDashboard = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconUsers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconRoulette = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a10 10 0 0 1 0 20"/><path d="M2 12h20"/>
    <path d="M12 2c-2.76 4-4 6.67-4 10s1.24 6 4 10"/>
    <path d="M12 2c2.76 4 4 6.67 4 10s-1.24 6-4 10"/>
  </svg>
);
const IconLogout = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconToggleOn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="5" width="22" height="14" rx="7"/>
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconToggleOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="5" width="22" height="14" rx="7"/>
    <circle cx="8" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
  </svg>
);

/* ─────────────────────────────────────── */

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [filtroFuncionarios, setFiltroFuncionarios] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showGanadoresModal, setShowGanadoresModal] = useState(false);
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [ganadoresEvento, setGanadoresEvento] = useState(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '', descripcion: '', fecha_evento: '',
    cantidad_ganadores: 1, permite_reganar: false,
  });
  const [nuevoFuncionario, setNuevoFuncionario] = useState({
    cedula: '', nombre_completo: '', sucursal_codigo: '',
    socio_numero: '', activo: true, tipo: 'funcionario',
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { cargarDatos(); }, [activeTab]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showEventoModal) setShowEventoModal(false);
        if (showGanadoresModal) setShowGanadoresModal(false);
        if (showFuncionarioModal) setShowFuncionarioModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showEventoModal, showGanadoresModal, showFuncionarioModal]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.get('/api/admin/dashboard');
        setDashboard(res.data);
      } else if (activeTab === 'eventos') {
        const res = await api.get('/api/eventos');
        setEventos(res.data);
      } else if (activeTab === 'funcionarios') {
        const [funcRes, sucRes] = await Promise.all([
          api.get(`/api/funcionarios?filtro=${filtroFuncionarios}`),
          api.get('/api/sucursales'),
        ]);
        setFuncionarios(funcRes.data);
        setSucursales(sucRes.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'funcionarios') cargarDatos();
  }, [filtroFuncionarios]);

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/eventos', nuevoEvento);
      alert('Evento creado exitosamente');
      setShowEventoModal(false);
      setNuevoEvento({ nombre: '', descripcion: '', fecha_evento: '', cantidad_ganadores: 1, permite_reganar: false });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear evento');
    }
  };

  const handleCambiarEstadoEvento = async (eventoId, nuevoEstado) => {
    try {
      await api.put(`/api/eventos/${eventoId}`, { estado: nuevoEstado });
      alert('Estado actualizado exitosamente');
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar evento');
    }
  };

  const handleVerGanadores = async (evento) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/eventos/${evento.id}/ganadores`);
      setGanadoresEvento({ evento, ganadores: res.data.ganadores });
      setShowGanadoresModal(true);
    } catch (error) {
      alert('Error al cargar ganadores del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFuncionario = async (ci) => {
    try {
      const res = await api.patch(`/api/funcionarios/${ci}/toggle`);
      alert(res.data.message);
      cargarDatos();
    } catch (error) {
      alert('Error al cambiar estado del funcionario');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const res = await api.post('/api/funcionarios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message || 'Carga completada');
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al procesar el archivo Excel');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleCrearFuncionario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/funcionarios', nuevoFuncionario);
      alert('Funcionario creado exitosamente');
      setShowFuncionarioModal(false);
      setNuevoFuncionario({ cedula: '', nombre_completo: '', sucursal_codigo: '', socio_numero: '', activo: true, tipo: 'funcionario' });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear funcionario');
    }
  };

  const handleActualizarFuncionario = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/funcionarios/${funcionarioEditando.ci}`, nuevoFuncionario);
      alert('Funcionario actualizado exitosamente');
      setShowFuncionarioModal(false);
      setFuncionarioEditando(null);
      setNuevoFuncionario({ cedula: '', nombre_completo: '', sucursal_codigo: '', socio_numero: '', activo: true, tipo: 'funcionario' });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar funcionario');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleResetGanadoresEvento = async (evento) => {
    if (!window.confirm(`¿Eliminar TODOS los ganadores del evento "${evento.nombre}"?\nEsta acción es irreversible y se usa solo para pruebas.`)) return;
    try {
      const res = await api.delete(`/api/ganadores/reset?evento_id=${evento.id}`);
      alert(res.data.message || 'Ganadores eliminados');
      cargarDatos();
      if (showGanadoresModal) {
        const updated = await api.get(`/api/eventos/${evento.id}/ganadores`);
        setGanadoresEvento({ evento, ganadores: updated.data.ganadores });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al resetear ganadores');
    }
  };

  const handleEliminarGanador = async (ganadorId, eventoActual) => {
    if (!window.confirm('¿Eliminar este ganador? Esta acción es irreversible.')) return;
    try {
      await api.delete(`/api/ganadores/${ganadorId}`);
      const updated = await api.get(`/api/eventos/${eventoActual.id}/ganadores`);
      setGanadoresEvento({ evento: eventoActual, ganadores: updated.data.ganadores });
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar ganador');
    }
  };

  const fmtDate = (d) => d.toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const fmtTime = (d) => d.toLocaleTimeString('es-PY', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="admin-container">
      {/* ── SIDEBAR ── */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <div className="admin-header-logo">
            <IconRoulette />
            <h2>Panel Admin</h2>
          </div>
          <div className="admin-user-info">
            <div className="admin-user-avatar">{getInitials(user?.nombre_completo)}</div>
            <span className="admin-user-name">{user?.nombre_completo || 'Administrador'}</span>
          </div>

          <div className="admin-clock">
            <div className="admin-clock-time">{fmtTime(now)}</div>
            <div className="admin-clock-date">{fmtDate(now)}</div>
          </div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-label">Menú Principal</span>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <IconDashboard /> Dashboard
          </button>
          <button className={activeTab === 'eventos' ? 'active' : ''} onClick={() => setActiveTab('eventos')}>
            <IconCalendar /> Eventos
          </button>
          <button className={activeTab === 'funcionarios' ? 'active' : ''} onClick={() => setActiveTab('funcionarios')}>
            <IconUsers /> Funcionarios
          </button>
          <div className="nav-divider" />
          <span className="admin-nav-label">Acciones</span>
          <button onClick={() => navigate('/')}>
            <IconRoulette /> Ir a Ruleta
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <IconLogout /> Cerrar Sesión
          </button>
        </nav>
      </div>

      {/* ── CONTENT ── */}
      <div className="admin-content">
        <div className="content-inner">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner" />
              Cargando...
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && dashboard && (
                <div className="dashboard">
                  <div className="section-header">
                    <h1>Dashboard</h1>
                  </div>
                  <div className="stats-row">
                    <div className="stat-card">
                      <div className="stat-icon-box"><IconCalendar /></div>
                      <div className="stat-info">
                        <h3>{dashboard.estadisticas.total_eventos}</h3>
                        <p>Total Eventos</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-box"><IconTrophy /></div>
                      <div className="stat-info">
                        <h3>{dashboard.estadisticas.total_ganadores}</h3>
                        <p>Total Ganadores</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-box"><IconUsers /></div>
                      <div className="stat-info">
                        <h3>{dashboard.estadisticas.total_funcionarios}</h3>
                        <p>Funcionarios</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-box"><IconBuilding /></div>
                      <div className="stat-info">
                        <h3>{dashboard.estadisticas.total_sucursales}</h3>
                        <p>Sucursales</p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-grid">
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <IconBarChart />
                        <h2>Ganadores por Sucursal</h2>
                      </div>
                      <div className="dashboard-card-body">
                        {dashboard.ganadores_por_sucursal.map((s, i) => (
                          <div key={i} className="sucursal-item">
                            <span>{s.sucursal}</span>
                            <span className="badge">{s.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dashboard-card">
                      <div className="dashboard-card-header">
                        <IconClock />
                        <h2>Últimos Eventos</h2>
                      </div>
                      <div className="dashboard-card-body">
                        {dashboard.ultimos_eventos.map((evento) => (
                          <div key={evento.id} className="evento-item">
                            <div>
                              <strong>{evento.nombre}</strong>
                              <p>{evento.fecha_evento}</p>
                            </div>
                            <span className={`estado ${evento.estado}`}>{evento.estado}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EVENTS */}
              {activeTab === 'eventos' && (
                <div className="eventos-section">
                  <div className="section-header">
                    <h1>Gestión de Eventos</h1>
                    <button className="btn-primary" onClick={() => setShowEventoModal(true)}>
                      <IconPlus /> Crear Evento
                    </button>
                  </div>
                  <div className="eventos-grid">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="evento-card">
                        <div className="evento-card-header">
                          <h3>{evento.nombre}</h3>
                          <span className={`estado ${evento.estado}`}>{evento.estado}</span>
                        </div>
                        <div className="evento-card-body">
                          <p>{evento.descripcion || 'Sin descripción'}</p>
                          <div className="evento-info">
                            <span className="evento-info-item"><IconCalendar /> {evento.fecha_evento}</span>
                            <span className="evento-info-item"><IconTrophy /> {evento.total_ganadores} ganadores</span>
                          </div>
                        </div>
                        <div className="evento-card-actions">
                          {evento.estado === 'activo' && (
                            <>
                              <button onClick={() => handleCambiarEstadoEvento(evento.id, 'finalizado')} className="btn-secondary">
                                <IconCheck /> Finalizar
                              </button>
                              <button onClick={() => handleResetGanadoresEvento(evento)} className="btn-danger" title="Reset (Pruebas)">
                                <IconRefresh /> Reset
                              </button>
                            </>
                          )}
                          {evento.estado === 'finalizado' && (
                            <button onClick={() => handleVerGanadores(evento)} className="btn-secondary">
                              <IconEye /> Ver Ganadores
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPLOYEES */}
              {activeTab === 'funcionarios' && (
                <div className="funcionarios-section">
                  <div className="section-header">
                    <h1>Gestión de Funcionarios</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label className="btn-upload">
                        <IconUpload /> Carga Masiva (Excel)
                        <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileUpload} />
                      </label>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setFuncionarioEditando(null);
                          setNuevoFuncionario({ cedula: '', nombre_completo: '', sucursal_codigo: '', socio_numero: '', activo: true, tipo: 'funcionario' });
                          setShowFuncionarioModal(true);
                        }}
                      >
                        <IconPlus /> Agregar Funcionario
                      </button>
                    </div>
                  </div>

                  <div className="filtros-container">
                    <button className={`filtro-btn ${filtroFuncionarios === 'todos' ? 'active' : ''}`} onClick={() => setFiltroFuncionarios('todos')}>Todos</button>
                    <button className={`filtro-btn ${filtroFuncionarios === 'activos' ? 'active' : ''}`} onClick={() => setFiltroFuncionarios('activos')}>Activos</button>
                    <button className={`filtro-btn ${filtroFuncionarios === 'inactivos' ? 'active' : ''}`} onClick={() => setFiltroFuncionarios('inactivos')}>Inactivos</button>
                  </div>

                  <div className="tabla-funcionarios-container">
                    <table className="tabla-funcionarios">
                      <thead>
                        <tr>
                          <th>CI</th><th>Nombre Completo</th><th>Sucursal</th>
                          <th>N° Socio</th><th>Estado</th><th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funcionarios.length === 0 ? (
                          <tr><td colSpan="6" className="no-data">No hay funcionarios {filtroFuncionarios !== 'todos' ? filtroFuncionarios : ''} para mostrar</td></tr>
                        ) : (
                          funcionarios.map((func) => (
                            <tr key={func.ci} className={!func.activo ? 'row-inactivo' : ''}>
                              <td>{func.ci}</td>
                              <td className="nombre-cell">{func.nombre_completo}</td>
                              <td>{func.sucursal_nombre}</td>
                              <td>{func.socio_numero}</td>
                              <td>
                                <span className={`badge-estado ${func.activo ? 'activo' : 'inactivo'}`}>
                                  {func.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="acciones-cell">
                                <button onClick={() => handleToggleFuncionario(func.ci)} className="btn-action" title={func.activo ? 'Desactivar' : 'Activar'}>
                                  {func.activo ? <IconToggleOn /> : <IconToggleOff />}
                                </button>
                                <button
                                  onClick={() => {
                                    setFuncionarioEditando(func);
                                    setNuevoFuncionario({ cedula: func.ci, nombre_completo: func.nombre_completo, sucursal_codigo: func.sucursal_codigo, socio_numero: func.socio_numero, activo: func.activo, tipo: func.tipo || 'funcionario' });
                                    setShowFuncionarioModal(true);
                                  }}
                                  className="btn-action" title="Editar"
                                >
                                  <IconEdit />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: Crear Evento */}
      {showEventoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Evento</h2>
              <button type="button" className="modal-close" onClick={() => setShowEventoModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearEvento}>
              <div className="form-group">
                <label>Nombre del Evento *</label>
                <input type="text" value={nuevoEvento.nombre} onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })} placeholder="Ej: Sorteo de Fin de Año 2026" required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={nuevoEvento.descripcion} onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })} rows="3" placeholder="Descripción opcional..." />
              </div>
              <div className="form-group">
                <label>Fecha del Evento *</label>
                <input type="date" value={nuevoEvento.fecha_evento} onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_evento: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Cantidad de Ganadores</label>
                <input type="number" value={nuevoEvento.cantidad_ganadores} onChange={(e) => setNuevoEvento({ ...nuevoEvento, cantidad_ganadores: parseInt(e.target.value) })} min="1" />
              </div>
              <div className="form-group checkbox">
                <input type="checkbox" id="permite_reganar" checked={nuevoEvento.permite_reganar} onChange={(e) => setNuevoEvento({ ...nuevoEvento, permite_reganar: e.target.checked })} />
                <label htmlFor="permite_reganar">Permitir que una persona gane múltiples veces</label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEventoModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary"><IconPlus /> Crear Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ver Ganadores */}
      {showGanadoresModal && ganadoresEvento && (
        <div className="modal-overlay">
          <div className="modal-content modal-ganadores">
            <div className="modal-header">
              <h2>Ganadores del Evento</h2>
              <button className="modal-close" onClick={() => setShowGanadoresModal(false)}>✕</button>
            </div>
            <div className="evento-info-header">
              <h3>{ganadoresEvento.evento.nombre}</h3>
              <p>{ganadoresEvento.evento.fecha_evento}</p>
              <p className="total-ganadores">{ganadoresEvento.ganadores.length} ganadores registrados</p>
            </div>
            <div className="ganadores-list">
              {ganadoresEvento.ganadores.length === 0 ? (
                <p className="no-ganadores">No hay ganadores registrados aún</p>
              ) : (
                <ol className="ganadores-ordenados">
                  {ganadoresEvento.ganadores.map((ganador, index) => (
                    <li key={ganador.id} className="ganador-item">
                      <span className="ganador-numero">{index + 1}</span>
                      <div className="ganador-info">
                        <strong>{ganador.nombre_completo}</strong>
                        <div className="ganador-detalles">
                          <span>CI: {ganador.ci}</span>
                          <span>·</span>
                          <span>Socio: {ganador.socio_numero}</span>
                          <span>·</span>
                          <span>{ganador.sucursal}</span>
                        </div>
                      </div>
                      <button
                        className="btn-action btn-action-danger"
                        title="Eliminar ganador"
                        onClick={() => handleEliminarGanador(ganador.id, ganadoresEvento.evento)}
                      >
                        <IconTrash />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => handleResetGanadoresEvento(ganadoresEvento.evento)}
                className="btn-danger"
                style={{ marginRight: 'auto' }}
              >
                <IconRefresh /> Reset Ganadores
              </button>
              <button onClick={() => setShowGanadoresModal(false)} className="btn-primary">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Funcionario */}
      {showFuncionarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{funcionarioEditando ? 'Editar Funcionario' : 'Agregar Funcionario'}</h2>
              <button type="button" className="modal-close" onClick={() => { setShowFuncionarioModal(false); setFuncionarioEditando(null); }}>✕</button>
            </div>
            <form onSubmit={funcionarioEditando ? handleActualizarFuncionario : handleCrearFuncionario}>
              <div className="form-group">
                <label>Cédula (CI) *</label>
                <input type="text" value={nuevoFuncionario.cedula} onChange={(e) => setNuevoFuncionario({ ...nuevoFuncionario, cedula: e.target.value })} required disabled={!!funcionarioEditando} placeholder="Ej: 1234567" />
                {funcionarioEditando && <small>La cédula no puede modificarse</small>}
              </div>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input type="text" value={nuevoFuncionario.nombre_completo} onChange={(e) => setNuevoFuncionario({ ...nuevoFuncionario, nombre_completo: e.target.value })} required placeholder="Ej: Juan Pérez González" />
              </div>
              <div className="form-group">
                <label>Sucursal *</label>
                <select value={nuevoFuncionario.sucursal_codigo} onChange={(e) => setNuevoFuncionario({ ...nuevoFuncionario, sucursal_codigo: parseInt(e.target.value) })} required>
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map((suc) => (
                    <option key={suc.sucursal_codigo} value={suc.sucursal_codigo}>{suc.sucursal_nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Número de Socio *</label>
                <input type="number" value={nuevoFuncionario.socio_numero} onChange={(e) => setNuevoFuncionario({ ...nuevoFuncionario, socio_numero: e.target.value })} required placeholder="Ej: 12345" />
              </div>
              {funcionarioEditando && (
                <div className="form-group checkbox">
                  <input type="checkbox" id="funcionario_activo" checked={nuevoFuncionario.activo} onChange={(e) => setNuevoFuncionario({ ...nuevoFuncionario, activo: e.target.checked })} />
                  <label htmlFor="funcionario_activo">Funcionario activo</label>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowFuncionarioModal(false); setFuncionarioEditando(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {funcionarioEditando ? <><IconEdit /> Actualizar</> : <><IconPlus /> Crear</>} Funcionario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
