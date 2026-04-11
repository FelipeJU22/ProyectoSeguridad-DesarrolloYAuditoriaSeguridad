import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';
import './Asistente.css';

const ESTADOS = ['programada', 'pendiente', 'completada', 'cancelada'];

function Asistente() {
  const [cirugias, setCirugias] = useState([]);
  const [tabActiva, setTabActiva] = useState('citas');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const asistenteId   = usuarioActual.id || 5;
  const iniciales     = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  useEffect(() => {
    const filtered = cirugiasData.filter(c =>
      c.asistentes.some(a => a.asistenteId === asistenteId)
    );
    setCirugias(filtered);
  }, [asistenteId]);

  const getUsuarioNombre = (id) => {
    const u = usuariosData.find(u => u.id === id);
    return u ? u.nombre : `ID ${id}`;
  };

  const getBadgeClass = (estado) => {
    const map = {
      programada: 'badge-programada',
      completada: 'badge-completada',
      cancelada:  'badge-cancelada',
      pendiente:  'badge-pendiente',
    };
    return map[estado?.toLowerCase()] || 'badge-pendiente';
  };

  // ─── CAMBIAR ESTADO ───────────────────────────────────────────────────────

  const handleChangeEstado = (cirugiaId, nuevoEstado) => {
    const anterior = cirugias.find(c => c.id === cirugiaId)?.estado;

    const payload = {
      accion:      'ACTUALIZAR_ESTADO_CIRUGIA',
      asistenteId,
      cirugiaId,
      estadoAnterior: anterior,
      estadoNuevo:    nuevoEstado,
      timestamp:   new Date().toISOString(),
    };

    console.log('[BACKEND → PUT /cirugias/:id/estado]', JSON.stringify(payload, null, 2));

    setCirugias(prev =>
      prev.map(c => c.id === cirugiaId ? { ...c, estado: nuevoEstado } : c)
    );
  };

  // ─── EVENTOS CALENDARIO ───────────────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: `${c.tipo} — ${getUsuarioNombre(c.pacienteId)}`,
    date:  c.fecha,
    backgroundColor: c.estado === 'completada' ? '#16a34a'
      : c.estado === 'cancelada'  ? '#dc2626'
      : c.estado === 'pendiente'  ? '#94a3b8'
      : '#b45309',
    borderColor: 'transparent',
  }));

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="asistente-page">

      {/* HEADER */}
      <header className="asistente-header">
        <span className="brand">HospiTEC</span>
        <div className="user-info">
          <div className="user-avatar">{iniciales}</div>
          <span className="user-name">{usuarioActual.nombre || 'Asistente'}</span>
          <span className="rol-badge">Asistente</span>
          <button
            className="btn-logout"
            onClick={() => {
              console.log('[BACKEND → POST /auth/logout]', { asistenteId, timestamp: new Date().toISOString() });
              localStorage.removeItem('usuario');
              window.location.href = '/';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="asistente-content">
        <h1 className="page-title">Panel del Asistente</h1>
        <p className="page-subtitle">Visualizá tus cirugías asignadas y actualizá su estado.</p>

        {/* TABS */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${tabActiva === 'citas' ? 'active' : ''}`}
            onClick={() => setTabActiva('citas')}
          >
            Mis Cirugías
          </button>
          <button
            className={`tab-btn ${tabActiva === 'calendario' ? 'active' : ''}`}
            onClick={() => setTabActiva('calendario')}
          >
            Calendario
          </button>
        </div>

        {/* TAB: CIRUGÍAS */}
        {tabActiva === 'citas' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Cirugías asignadas</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {cirugias.length} registro(s)
              </span>
            </div>

            {cirugias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🩺</div>
                <p>No tenés cirugías asignadas.</p>
              </div>
            ) : (
              <div className="tabla-wrapper">
                <table className="tabla-cirugias">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Paciente</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Cirujano</th>
                      <th>Estado actual</th>
                      <th>Cambiar estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cirugias.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{getUsuarioNombre(c.pacienteId)}</td>
                        <td>{c.tipo}</td>
                        <td>{c.fecha}</td>
                        <td>{getUsuarioNombre(c.cirujanoId)}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          <select
                            className="select-estado"
                            value={c.estado}
                            onChange={e => handleChangeEstado(c.id, e.target.value)}
                          >
                            {ESTADOS.map(estado => (
                              <option key={estado} value={estado}>{estado}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: CALENDARIO */}
        {tabActiva === 'calendario' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Calendario de cirugías</span>
            </div>
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={eventos}
                locale="es"
                height="auto"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Asistente;