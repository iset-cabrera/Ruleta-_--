import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import './AdminPage.css';

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
    nombre: '',
    descripcion: '',
    fecha_evento: '',
    cantidad_ganadores: 1,
    permite_reganar: false
  });
  const [nuevoFuncionario, setNuevoFuncionario] = useState({
    cedula: '',
    nombre_completo: '',
    sucursal_codigo: '',
    socio_numero: '',
    activo: true,
    tipo: 'funcionario'
  });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  // Manejar tecla ESC para cerrar modales
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
          api.get('/api/sucursales')
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

  // Recargar cuando cambia el filtro de funcionarios
  useEffect(() => {
    if (activeTab === 'funcionarios') {
      cargarDatos();
    }
  }, [filtroFuncionarios]);

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/eventos', nuevoEvento);
      alert('Evento creado exitosamente');
      setShowEventoModal(false);
      setNuevoEvento({
        nombre: '',
        descripcion: '',
        fecha_evento: '',
        cantidad_ganadores: 1,
        permite_reganar: false
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al crear evento:', error);
      alert(error.response?.data?.error || 'Error al crear evento');
    }
  };

  const handleCambiarEstadoEvento = async (eventoId, nuevoEstado) => {
    try {
      await api.put(`/api/eventos/${eventoId}`, {
        estado: nuevoEstado
      });
      alert('Estado actualizado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      alert('Error al actualizar evento');
    }
  };

  const handleVerGanadores = async (evento) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/eventos/${evento.id}/ganadores`);
      setGanadoresEvento({
        evento: evento,
        ganadores: res.data.ganadores
      });
      setShowGanadoresModal(true);
    } catch (error) {
      console.error('Error al cargar ganadores:', error);
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
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado del funcionario');
    }
  };

  const handleCrearFuncionario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/funcionarios', nuevoFuncionario);
      alert('Funcionario creado exitosamente');
      setShowFuncionarioModal(false);
      setNuevoFuncionario({
        cedula: '',
        nombre_completo: '',
        sucursal_codigo: '',
        socio_numero: '',
        activo: true,
        tipo: 'funcionario'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al crear funcionario:', error);
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
      setNuevoFuncionario({
        cedula: '',
        nombre_completo: '',
        sucursal_codigo: '',
        socio_numero: '',
        activo: true,
        tipo: 'funcionario'
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar funcionario:', error);
      alert(error.response?.data?.error || 'Error al actualizar funcionario');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Panel Admin</h2>
          <p>{user?.nombre_completo}</p>
        </div>

        <nav className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'eventos' ? 'active' : ''}
            onClick={() => setActiveTab('eventos')}
          >
            🎯 Eventos
          </button>
          <button 
            className={activeTab === 'funcionarios' ? 'active' : ''}
            onClick={() => setActiveTab('funcionarios')}
          >
            👥 Funcionarios
          </button>
          <button onClick={() => navigate('/')}>
            🎰 Ir a Ruleta
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Cerrar Sesión
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && dashboard && (
              <div className="dashboard">
                <h1>Dashboard</h1>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                      <h3>{dashboard.estadisticas.total_eventos}</h3>
                      <p>Total Eventos</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <h3>{dashboard.estadisticas.total_ganadores}</h3>
                      <p>Total Ganadores</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>{dashboard.estadisticas.total_funcionarios}</h3>
                      <p>Funcionarios</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                      <h3>{dashboard.estadisticas.total_sucursales}</h3>
                      <p>Sucursales</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Ganadores por Sucursal</h2>
                  <div className="sucursales-list">
                    {dashboard.ganadores_por_sucursal.map((s, i) => (
                      <div key={i} className="sucursal-item">
                        <span>{s.sucursal}</span>
                        <span className="badge">{s.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-section">
                  <h2>Últimos Eventos</h2>
                  <div className="eventos-recientes">
                    {dashboard.ultimos_eventos.map((evento) => (
                      <div key={evento.id} className="evento-item">
                        <div>
                          <strong>{evento.nombre}</strong>
                          <p>{evento.fecha_evento}</p>
                        </div>
                        <span className={`estado ${evento.estado}`}>
                          {evento.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'eventos' && (
              <div className="eventos-section">
                <div className="section-header">
                  <h1>Gestión de Eventos</h1>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowEventoModal(true)}
                  >
                    ➕ Crear Evento
                  </button>
                </div>

                <div className="eventos-grid">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="evento-card">
                      <div className="evento-card-header">
                        <h3>{evento.nombre}</h3>
                        <span className={`estado ${evento.estado}`}>
                          {evento.estado}
                        </span>
                      </div>
                      
                      <div className="evento-card-body">
                        <p>{evento.descripcion || 'Sin descripción'}</p>
                        <div className="evento-info">
                          <span>📅 {evento.fecha_evento}</span>
                          <span>🏆 {evento.total_ganadores} ganadores</span>
                        </div>
                      </div>
                      
                      <div className="evento-card-actions">
                        {evento.estado === 'activo' && (
                          <button 
                            onClick={() => handleCambiarEstadoEvento(evento.id, 'finalizado')}
                            className="btn-secondary"
                          >
                            Finalizar
                          </button>
                        )}
                        {evento.estado === 'finalizado' && (
                          <button 
                            onClick={() => handleVerGanadores(evento)}
                            className="btn-secondary"
                          >
                            👁️ Ver Ganadores
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'funcionarios' && (
              <div className="funcionarios-section">
                <div className="section-header">
                  <h1>Gestión de Funcionarios</h1>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setFuncionarioEditando(null);
                      setNuevoFuncionario({
                        cedula: '',
                        nombre_completo: '',
                        sucursal_codigo: '',
                        socio_numero: '',
                        activo: true,
                        tipo: 'funcionario'
                      });
                      setShowFuncionarioModal(true);
                    }}
                  >
                    ➕ Agregar Funcionario
                  </button>
                </div>

                {/* Filtros */}
                <div className="filtros-container">
                  <button 
                    className={`filtro-btn ${filtroFuncionarios === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroFuncionarios('todos')}
                  >
                    📊 Todos
                  </button>
                  <button 
                    className={`filtro-btn ${filtroFuncionarios === 'activos' ? 'active' : ''}`}
                    onClick={() => setFiltroFuncionarios('activos')}
                  >
                    ✅ Activos
                  </button>
                  <button 
                    className={`filtro-btn ${filtroFuncionarios === 'inactivos' ? 'active' : ''}`}
                    onClick={() => setFiltroFuncionarios('inactivos')}
                  >
                    ❌ Inactivos
                  </button>
                </div>

                {/* Tabla de Funcionarios */}
                <div className="tabla-funcionarios-container">
                  <table className="tabla-funcionarios">
                    <thead>
                      <tr>
                        <th>CI</th>
                        <th>Nombre Completo</th>
                        <th>Sucursal</th>
                        <th>N° Socio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-data">
                            No hay funcionarios {filtroFuncionarios !== 'todos' ? filtroFuncionarios : ''} para mostrar
                          </td>
                        </tr>
                      ) : (
                        funcionarios.map((func) => (
                          <tr key={func.ci} className={!func.activo ? 'row-inactivo' : ''}>
                            <td>{func.ci}</td>
                            <td className="nombre-cell">{func.nombre_completo}</td>
                            <td>{func.sucursal_nombre}</td>
                            <td>{func.socio_numero}</td>
                            <td>
                              <span className={`badge-estado ${func.activo ? 'activo' : 'inactivo'}`}>
                                {func.activo ? '✅ Activo' : '❌ Inactivo'}
                              </span>
                            </td>
                            <td className="acciones-cell">
                              <button 
                                onClick={() => handleToggleFuncionario(func.ci)}
                                className="btn-action"
                                title={func.activo ? 'Desactivar' : 'Activar'}
                              >
                                {func.activo ? '⏸️' : '▶️'}
                              </button>
                              <button 
                                onClick={() => {
                                  setFuncionarioEditando(func);
                                  setNuevoFuncionario({
                                    cedula: func.ci,
                                    nombre_completo: func.nombre_completo,
                                    sucursal_codigo: func.sucursal_codigo,
                                    socio_numero: func.socio_numero,
                                    activo: func.activo,
                                    tipo: func.tipo || 'funcionario'
                                  });
                                  setShowFuncionarioModal(true);
                                }}
                                className="btn-action"
                                title="Editar"
                              >
                                ✏️
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

      {showEventoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Evento</h2>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setShowEventoModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCrearEvento}>
              <div className="form-group">
                <label>Nombre del Evento *</label>
                <input
                  type="text"
                  value={nuevoEvento.nombre}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Fecha del Evento *</label>
                <input
                  type="date"
                  value={nuevoEvento.fecha_evento}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, fecha_evento: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cantidad de Ganadores</label>
                <input
                  type="number"
                  value={nuevoEvento.cantidad_ganadores}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, cantidad_ganadores: parseInt(e.target.value)})}
                  min="1"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={nuevoEvento.permite_reganar}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, permite_reganar: e.target.checked})}
                  />
                  Permitir que una persona gane múltiples veces
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEventoModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGanadoresModal && ganadoresEvento && (
        <div className="modal-overlay">
          <div className="modal-content modal-ganadores">
            <div className="modal-header">
              <h2>🏆 Ganadores del Evento</h2>
              <button 
                className="modal-close"
                onClick={() => setShowGanadoresModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="evento-info-header">
              <h3>{ganadoresEvento.evento.nombre}</h3>
              <p>📅 {ganadoresEvento.evento.fecha_evento}</p>
              <p className="total-ganadores">Total: {ganadoresEvento.ganadores.length} ganadores</p>
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
                          <span>•</span>
                          <span>Socio: {ganador.socio_numero}</span>
                          <span>•</span>
                          <span>{ganador.sucursal}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowGanadoresModal(false)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFuncionarioModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{funcionarioEditando ? 'Editar Funcionario' : 'Agregar Funcionario'}</h2>
              <button 
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowFuncionarioModal(false);
                  setFuncionarioEditando(null);
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={funcionarioEditando ? handleActualizarFuncionario : handleCrearFuncionario}>
              <div className="form-group">
                <label>Cédula (CI) *</label>
                <input
                  type="text"
                  value={nuevoFuncionario.cedula}
                  onChange={(e) => setNuevoFuncionario({...nuevoFuncionario, cedula: e.target.value})}
                  required
                  disabled={!!funcionarioEditando}
                  placeholder="Ej: 1234567"
                />
                {funcionarioEditando && (
                  <small style={{color: '#6b7280', fontSize: '12px'}}>
                    La cédula no se puede modificar
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={nuevoFuncionario.nombre_completo}
                  onChange={(e) => setNuevoFuncionario({...nuevoFuncionario, nombre_completo: e.target.value})}
                  required
                  placeholder="Ej: Juan Pérez González"
                />
              </div>

              <div className="form-group">
                <label>Sucursal *</label>
                <select
                  value={nuevoFuncionario.sucursal_codigo}
                  onChange={(e) => setNuevoFuncionario({...nuevoFuncionario, sucursal_codigo: parseInt(e.target.value)})}
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map((suc) => (
                    <option key={suc.sucursal_codigo} value={suc.sucursal_codigo}>
                      {suc.sucursal_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Número de Socio *</label>
                <input
                  type="number"
                  value={nuevoFuncionario.socio_numero}
                  onChange={(e) => setNuevoFuncionario({...nuevoFuncionario, socio_numero: e.target.value})}
                  required
                  placeholder="Ej: 12345"
                />
              </div>

              {funcionarioEditando && (
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={nuevoFuncionario.activo}
                      onChange={(e) => setNuevoFuncionario({...nuevoFuncionario, activo: e.target.checked})}
                    />
                    Funcionario activo
                  </label>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowFuncionarioModal(false);
                    setFuncionarioEditando(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {funcionarioEditando ? 'Actualizar' : 'Crear'} Funcionario
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

