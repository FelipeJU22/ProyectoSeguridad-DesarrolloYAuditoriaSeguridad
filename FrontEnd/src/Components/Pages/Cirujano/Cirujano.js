import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';
import './Cirujano.css';

const EMPTY_FORM = {
  pacienteId: '',
  tipo: '',
  fecha: '',
  anestesiologoId: '',
  asistentes: '',
};

function Cirujano() {
  const [cirugias, setCirugias]     = useState([]);
  const [tabActiva, setTabActiva]   = useState('citas');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);

  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const cirujanoId    = usuarioActual.id || 3;
  const iniciales     = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(1, 3).toUpperCase()
    : 'C';

  useEffect(() => {
    setCirugias(cirugiasData.filter(c => c.cirujanoId === cirujanoId));
  }, [cirujanoId]);

  const getUsuarioNombre = (id) => {
    const u = usuariosData.find(u => u.id === id);
    return u ? u.nombre : `ID ${id}`;
  };

  const getBadgeClass = (estado) => {
    const map = {
      programada: 'badge-programada',
      completada: 'badge-completada',
      cancelada:  'badge-cancelada',
    };
    return map[estado?.toLowerCase()] || 'badge-pendiente';
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── CREAR CIRUGÍA ────────────────────────────────────────────────────────

  const handleAbrirCrear = () => {
    setForm(EMPTY_FORM);
    setModalCrear(true);
  };

  const handleConfirmarCrear = () => {
    const { pacienteId, tipo, fecha, anestesiologoId, asistentes } = form;
    if (!pacienteId || !tipo || !fecha || !anestesiologoId) return;

    const asistentesArr = asistentes
      ? asistentes.split(',').map(id => ({ asistenteId: parseInt(id.trim(), 10) })).filter(a => !isNaN(a.asistenteId))
      : [];

    const nuevaCirugia = {
      id: Math.max(0, ...cirugias.map(c => c.id)) + 1,
      pacienteId:      parseInt(pacienteId, 10),
      tipo,
      fecha,
      estado:          'programada',
      cirujanoId,
      anestesiologoId: parseInt(anestesiologoId, 10),
      asistentes:      asistentesArr,
      documentos:      [],
    };

    const payload = {
      accion: 'CREAR_CIRUGIA',
      cirujanoId,
      cirugia: nuevaCirugia,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → POST /cirugias]', JSON.stringify(payload, null, 2));

    setCirugias(prev => [...prev, nuevaCirugia]);
    setModalCrear(false);
  };

  // ─── EDITAR CIRUGÍA ───────────────────────────────────────────────────────

  const handleAbrirEditar = (cirugia) => {
    setEditTarget(cirugia);
    setForm({
      pacienteId:      cirugia.pacienteId,
      tipo:            cirugia.tipo,
      fecha:           cirugia.fecha,
      anestesiologoId: cirugia.anestesiologoId,
      asistentes:      cirugia.asistentes?.map(a => a.asistenteId).join(', ') || '',
    });
    setModalEditar(true);
  };

  const handleConfirmarEditar = () => {
    const { tipo, fecha, anestesiologoId, asistentes } = form;
    if (!tipo || !fecha || !anestesiologoId) return;

    const asistentesArr = asistentes
      ? asistentes.split(',').map(id => ({ asistenteId: parseInt(id.trim(), 10) })).filter(a => !isNaN(a.asistenteId))
      : [];

    const cirugiaNueva = {
      ...editTarget,
      tipo,
      fecha,
      anestesiologoId: parseInt(anestesiologoId, 10),
      asistentes: asistentesArr,
    };

    const payload = {
      accion: 'EDITAR_CIRUGIA',
      cirujanoId,
      cirugiaId: editTarget.id,
      cambios: { tipo, fecha, anestesiologoId: parseInt(anestesiologoId, 10), asistentes: asistentesArr },
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → PUT /cirugias/:id]', JSON.stringify(payload, null, 2));

    setCirugias(prev => prev.map(c => c.id === editTarget.id ? cirugiaNueva : c));
    setModalEditar(false);
    setEditTarget(null);
  };

  // ─── EVENTOS CALENDARIO ───────────────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: `${c.tipo} — ${getUsuarioNombre(c.pacienteId)}`,
    date: c.fecha,
    backgroundColor: c.estado === 'completada' ? '#16a34a'
      : c.estado === 'cancelada' ? '#dc2626' : '#0d7c5f',
    borderColor: 'transparent',
  }));

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="cirujano-page">

      {/* HEADER */}
      <header className="cirujano-header">
        <span className="brand">HospiTEC</span>
        <div className="user-info">
          <div className="user-avatar">{iniciales}</div>
          <span className="user-name">{usuarioActual.nombre || 'Cirujano'}</span>
          <span className="rol-badge">Cirujano</span>
          <button
            className="btn-logout"
            onClick={() => {
              console.log('[BACKEND → POST /auth/logout]', { cirujanoId, timestamp: new Date().toISOString() });
              localStorage.removeItem('usuario');
              window.location.href = '/';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="cirujano-content">
        <h1 className="page-title">Panel del Cirujano</h1>
        <p className="page-subtitle">Gestioná las cirugías asignadas y programá nuevas intervenciones.</p>

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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {cirugias.length} registro(s)
                </span>
                <button className="btn btn-primary" onClick={handleAbrirCrear}>
                  + Nueva cirugía
                </button>
              </div>
            </div>

            {cirugias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔬</div>
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
                      <th>Anestesiólogo</th>
                      <th>Asistentes</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cirugias.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{getUsuarioNombre(c.pacienteId)}</td>
                        <td>{c.tipo}</td>
                        <td>{c.fecha}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>{getUsuarioNombre(c.anestesiologoId)}</td>
                        <td>
                          {c.asistentes?.map(a => getUsuarioNombre(a.asistenteId)).join(', ') || '—'}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAbrirEditar(c)}
                          >
                            ✏ Editar
                          </button>
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

      {/* MODAL: CREAR CIRUGÍA */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nueva Cirugía</h3>

            <div className="form-row">
              <div className="form-group">
                <label>ID del Paciente</label>
                <input
                  type="number"
                  name="pacienteId"
                  value={form.pacienteId}
                  onChange={handleFormChange}
                  placeholder="Ej: 1"
                />
              </div>
              <div className="form-group">
                <label>ID del Anestesiólogo</label>
                <input
                  type="number"
                  name="anestesiologoId"
                  value={form.anestesiologoId}
                  onChange={handleFormChange}
                  placeholder="Ej: 4"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de cirugía</label>
              <input
                type="text"
                name="tipo"
                value={form.tipo}
                onChange={handleFormChange}
                placeholder="Ej: Bypass coronario"
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>IDs de Asistentes</label>
              <input
                type="text"
                name="asistentes"
                value={form.asistentes}
                onChange={handleFormChange}
                placeholder="Ej: 5, 6, 7"
              />
              <p className="form-hint">Separados por coma. Opcional.</p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalCrear(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmarCrear}
                disabled={!form.pacienteId || !form.tipo || !form.fecha || !form.anestesiologoId}
              >
                Crear cirugía
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CIRUGÍA */}
      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Editar Cirugía #{editTarget?.id}</h3>

            <div className="form-group">
              <label>Tipo de cirugía</label>
              <input
                type="text"
                name="tipo"
                value={form.tipo}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>ID del Anestesiólogo</label>
              <input
                type="number"
                name="anestesiologoId"
                value={form.anestesiologoId}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>IDs de Asistentes</label>
              <input
                type="text"
                name="asistentes"
                value={form.asistentes}
                onChange={handleFormChange}
                placeholder="Ej: 5, 6, 7"
              />
              <p className="form-hint">Separados por coma. Opcional.</p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalEditar(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmarEditar}
                disabled={!form.tipo || !form.fecha || !form.anestesiologoId}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cirujano;