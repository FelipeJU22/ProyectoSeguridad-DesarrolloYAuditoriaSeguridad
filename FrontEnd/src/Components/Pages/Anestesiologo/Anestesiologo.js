import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Anestesiologo.css';

function Anestesiologo() {
  const [cirugias, setCirugias] = useState([]);
  const [tabActiva, setTabActiva] = useState('citas');

  const usuarioActual    = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const anestesiologoId  = usuarioActual.id || 4;
  const iniciales        = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(1, 3).toUpperCase()
    : 'AN';

  useEffect(() => {
    const fetchCirugias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/cirugias/anestesiologo/${anestesiologoId}`);
        if (!response.ok) throw new Error('Error al obtener cirugías');
        const data = await response.json();
        setCirugias(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    if (anestesiologoId) fetchCirugias();
  }, [anestesiologoId]);

  const getBadgeClass = (estado) => {
    const map = {
      programada: 'badge-programada',
      completada: 'badge-completada',
      cancelada:  'badge-cancelada',
      pendiente:  'badge-pendiente',
    };
    return map[estado?.toLowerCase()] || 'badge-pendiente';
  };

  // ─── EVENTOS CALENDARIO ───────────────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: `${c.tipo_cirugia} — ${c.paciente_nombre} ${c.paciente_apellido}`,
    date: c.fecha_programada.split('T')[0],
    backgroundColor: c.estado === 'completada' ? '#16a34a'
      : c.estado === 'cancelada' ? '#dc2626'
      : '#4f46e5',
    borderColor: 'transparent',
  }));

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="anestesiologo-page">

      {/* HEADER */}
      <header className="anestesiologo-header">
        <span className="brand">HospiTEC</span>
        <div className="user-info">
          <div className="user-avatar">{iniciales}</div>
          <span className="user-name">{usuarioActual.nombre || 'Anestesiólogo'}</span>
          <span className="rol-badge">Anestesiólogo</span>
          <button
            className="btn-logout"
            onClick={() => {
              console.log('[BACKEND → POST /auth/logout]', {
                anestesiologoId,
                timestamp: new Date().toISOString(),
              });
              sessionStorage.removeItem('usuario');
              window.location.href = '/';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="anestesiologo-content">
        <h1 className="page-title">Panel del Anestesiólogo</h1>
        <p className="page-subtitle">Consultá las cirugías en las que estás asignado.</p>

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
                <div className="empty-icon">💉</div>
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
                      <th>Estado</th>
                      <th>Cirujano</th>
                      <th>Asistentes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cirugias.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.paciente_nombre} {c.paciente_apellido}</td>
                        <td>{c.tipo_cirugia}</td>
                        <td>{new Date(c.fecha_programada).toLocaleDateString('es-CR')}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>{c.cirujano_nombre} {c.cirujano_apellido}</td>
                        <td>{c.asistentes?.map(a => `${a.nombre} ${a.apellido}`).join(', ') || '—'}</td>
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

export default Anestesiologo;