import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Asistente.css';

const ESTADOS = ['programada', 'en_progreso', 'completada', 'cancelada', 'pospuesta'];

function Asistente() {
  const [cirugias, setCirugias] = useState([]);
  const [tabActiva, setTabActiva] = useState('citas');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const asistenteId   = usuarioActual.id || 5;
  const iniciales     = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  useEffect(() => {
    const fetchCirugias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/cirugias/asistente/${asistenteId}`);
        if (!response.ok) throw new Error('Error al obtener cirugías');
        const data = await response.json();
        setCirugias(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    if (asistenteId) fetchCirugias();
  }, [asistenteId]);

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

  const handleChangeEstado = async (cirugiaId, nuevoEstado) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/cirugias/${cirugiaId}/estado?usuario_id=${asistenteId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al cambiar estado');
        return;
      }

      const actualizada = await response.json();
      setCirugias(prev => prev.map(c => c.id === cirugiaId ? actualizada : c));

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  // ─── EVENTOS CALENDARIO ───────────────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: `${c.tipo_cirugia} — ${c.paciente_nombre} ${c.paciente_apellido}`,
    date: c.fecha_programada.split('T')[0],
    backgroundColor: c.estado === 'completada' ? '#16a34a'
      : c.estado === 'cancelada' ? '#dc2626'
      : c.estado === 'pendiente' ? '#94a3b8'
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
                        <td>{c.paciente_nombre} {c.paciente_apellido}</td>
                        <td>{c.tipo_cirugia}</td>
                        <td>{new Date(c.fecha_programada).toLocaleDateString('es-CR')}</td>
                        <td>{c.cirujano_nombre} {c.cirujano_apellido}</td>
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