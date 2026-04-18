import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useNavigate } from 'react-router-dom';
import './Cirujano.css';

const EMPTY_FORM = {
  paciente_id:          '',
  tipo_cirugia:         '',
  fecha_programada:     '',
  anestesiologo_id:     '',
  asistente_ids:        [],
  duracion_estimada_min: '',
  notas:                '',
};

function Cirujano() {
  const [cirugias, setCirugias]     = useState([]);
  const [tabActiva, setTabActiva]   = useState('citas');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const [listaPacientes, setListaPacientes]         = useState([]);
  const [listaAnestesiologos, setListaAnestesiologos] = useState([]);
  const [listaAsistentes, setListaAsistentes]         = useState([]);
  const navigate = useNavigate();

  const usuarioActual = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const cirujanoId    = usuarioActual.id || 3;
  const iniciales     = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(1, 3).toUpperCase()
    : 'C';

  useEffect(() => {
    const fetchCirugias = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/cirugias/cirujano/${cirujanoId}`);
        if (!response.ok) throw new Error('Error al obtener cirugías');
        const data = await response.json();
        setCirugias(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };

    if (cirujanoId) fetchCirugias();
  }, [cirujanoId]);

  useEffect(() => {
    const fetchListas = async () => {
      try {
        const [pacientes, anestesiologos, asistentes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/listas/pacientes').then(r => r.json()),
          fetch('http://127.0.0.1:8000/api/v1/listas/anestesiologos').then(r => r.json()),
          fetch('http://127.0.0.1:8000/api/v1/listas/asistentes').then(r => r.json()),
        ]);
        setListaPacientes(pacientes);
        setListaAnestesiologos(anestesiologos);
        setListaAsistentes(asistentes);
      } catch (err) {
        console.error('Error cargando listas:', err);
      }
    };
    fetchListas();
  }, []);

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

  const handleConfirmarCrear = async () => {
    if (!form.paciente_id || !form.tipo_cirugia || !form.fecha_programada || !form.anestesiologo_id) return;

    const token = sessionStorage.getItem('token');

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/cirugias`,   // ya no va usuario_id acá
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,     // token en el header
          },
          body: JSON.stringify({
            paciente_id:           form.paciente_id,
            tipo_cirugia:          form.tipo_cirugia,
            fecha_programada:      `${form.fecha_programada}T00:00:00`,
            anestesiologo_id:      form.anestesiologo_id,
            asistente_ids:         form.asistente_ids,
            duracion_estimada_min: form.duracion_estimada_min ? parseInt(form.duracion_estimada_min) : null,
            notas:                 form.notas || null,
          }),
        }
      );

      if (response.status === 401) {
        alert('Sesión expirada. Por favor iniciá sesión nuevamente.');
        sessionStorage.clear();
        navigate('/');   // ajustá la ruta a la tuya
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al crear cirugía');
        return;
      }

      const nueva = await response.json();
      setCirugias(prev => [...prev, nueva]);
      setModalCrear(false);

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  // ─── EDITAR CIRUGÍA ───────────────────────────────────────────────────────

  const handleAbrirEditar = (cirugia) => {
    setEditTarget(cirugia);
    setForm({
      paciente_id:           cirugia.paciente_id,
      tipo_cirugia:          cirugia.tipo_cirugia,
      fecha_programada:      cirugia.fecha_programada.split('T')[0],
      anestesiologo_id:      cirugia.anestesiologo_id,
      asistente_ids:         cirugia.asistentes.map(a => a.id),
      duracion_estimada_min: cirugia.duracion_estimada_min || '',
      notas:                 cirugia.notas || '',
    });
    setModalEditar(true);
  };

  const handleConfirmarEditar = async () => {
    if (!form.tipo_cirugia || !form.fecha_programada || !form.anestesiologo_id) return;
    const token = sessionStorage.getItem('token');

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/cirugias/${editTarget.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            tipo_cirugia:          form.tipo_cirugia,
            fecha_programada:      `${form.fecha_programada}T00:00:00`,
            anestesiologo_id:      form.anestesiologo_id,
            asistente_ids:         form.asistente_ids,
            duracion_estimada_min: form.duracion_estimada_min ? parseInt(form.duracion_estimada_min) : null,
            notas:                 form.notas || null,
          }),
        }
      );

      if (response.status === 401) {
        alert('Sesión expirada. Por favor iniciá sesión nuevamente.');
        sessionStorage.clear();
        navigate('/');
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al editar cirugía');
        return;
      }

      const actualizada = await response.json();
      setCirugias(prev => prev.map(c => c.id === editTarget.id ? actualizada : c));
      setModalEditar(false);
      setEditTarget(null);

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  // ─── EVENTOS CALENDARIO ───────────────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: c.tipo_cirugia,
    date: c.fecha_programada.split('T')[0],
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
              sessionStorage.removeItem('usuario');
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
                        <td>{c.paciente_nombre} {c.paciente_apellido}</td>
                        <td>{c.tipo_cirugia}</td>
                        <td>{new Date(c.fecha_programada).toLocaleDateString('es-CR')}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>{c.anestesiologo_nombre} {c.anestesiologo_apellido}</td>
                        <td>{c.asistentes?.map(a => `${a.nombre} ${a.apellido}`).join(', ') || '—'}</td>
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

            <div className="form-group">
              <label>Paciente</label>
              <select name="paciente_id" value={form.paciente_id} onChange={handleFormChange}>
                <option value="">Seleccionar paciente</option>
                {listaPacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de cirugía</label>
              <input
                type="text"
                name="tipo_cirugia"
                value={form.tipo_cirugia}
                onChange={handleFormChange}
                placeholder="Ej: Bypass coronario"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  name="fecha_programada"
                  value={form.fecha_programada}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Duración (min)</label>
                <input
                  type="number"
                  name="duracion_estimada_min"
                  value={form.duracion_estimada_min}
                  onChange={handleFormChange}
                  placeholder="Ej: 90"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Anestesiólogo</label>
              <select name="anestesiologo_id" value={form.anestesiologo_id} onChange={handleFormChange}>
                <option value="">Seleccionar anestesiólogo</option>
                {listaAnestesiologos.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Asistentes</label>
              <select
                onChange={e => {
                  const id = e.target.value;
                  if (id && !form.asistente_ids.includes(id)) {
                    setForm(prev => ({ ...prev, asistente_ids: [...prev.asistente_ids, id] }));
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Agregar asistente...</option>
                {listaAsistentes
                  .filter(a => !form.asistente_ids.includes(a.id))
                  .map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                  ))}
              </select>

              {form.asistente_ids.length > 0 && (
                <div className="asistentes-seleccionados">
                  {form.asistente_ids.map(id => {
                    const a = listaAsistentes.find(a => a.id === id);
                    return a ? (
                      <span key={id} className="asistente-tag">
                        {a.nombre} {a.apellido}
                        <button onClick={() => setForm(prev => ({
                          ...prev,
                          asistente_ids: prev.asistente_ids.filter(i => i !== id)
                        }))}>✕</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notas</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleFormChange}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalCrear(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmarCrear}
                disabled={!form.paciente_id || !form.tipo_cirugia || !form.fecha_programada || !form.anestesiologo_id}
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
            <h3>Editar Cirugía</h3>

            <div className="form-group">
              <label>Paciente</label>
              <input
                type="text"
                value={`${editTarget?.paciente_nombre} ${editTarget?.paciente_apellido}`}
                disabled
                style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>Tipo de cirugía</label>
              <input
                type="text"
                name="tipo_cirugia"
                value={form.tipo_cirugia}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  name="fecha_programada"
                  value={form.fecha_programada}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Duración (min)</label>
                <input
                  type="number"
                  name="duracion_estimada_min"
                  value={form.duracion_estimada_min}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Anestesiólogo</label>
              <select name="anestesiologo_id" value={form.anestesiologo_id} onChange={handleFormChange}>
                <option value="">Seleccionar anestesiólogo</option>
                {listaAnestesiologos.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Asistentes</label>
              <select
                onChange={e => {
                  const id = e.target.value;
                  if (id && !form.asistente_ids.includes(id)) {
                    setForm(prev => ({ ...prev, asistente_ids: [...prev.asistente_ids, id] }));
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Agregar asistente...</option>
                {listaAsistentes
                  .filter(a => !form.asistente_ids.includes(a.id))
                  .map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                  ))}
              </select>

              {form.asistente_ids.length > 0 && (
                <div className="asistentes-seleccionados">
                  {form.asistente_ids.map(id => {
                    const a = listaAsistentes.find(a => a.id === id);
                    return a ? (
                      <span key={id} className="asistente-tag">
                        {a.nombre} {a.apellido}
                        <button onClick={() => setForm(prev => ({
                          ...prev,
                          asistente_ids: prev.asistente_ids.filter(i => i !== id)
                        }))}>✕</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notas</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleFormChange}
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalEditar(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmarEditar}
                disabled={!form.tipo_cirugia || !form.fecha_programada || !form.anestesiologo_id}
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