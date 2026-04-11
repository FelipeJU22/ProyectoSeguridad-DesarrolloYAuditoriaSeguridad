import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';
import './Paciente.css';

function Paciente() {
  const [tabActiva, setTabActiva] = useState('citas');
  const [cirugias, setCirugias] = useState([]);
  const [documentos, setDocumentos] = useState(['consentimiento_informado.pdf', 'examen_preoperatorio.pdf']);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const fileInputRef = useRef(null);

  // Leer el usuario del localStorage (del login)
  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const pacienteId = usuarioActual.id || 1;
  const iniciales = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'P';

  useEffect(() => {
    const filtered = cirugiasData.filter(c => c.pacienteId === pacienteId);
    setCirugias(filtered);
  }, [pacienteId]);

  const getUsuarioNombre = (id) => {
    const u = usuariosData.find(u => u.id === id);
    return u ? u.nombre : 'Desconocido';
  };

  const getBadgeClass = (estado) => {
    const map = {
      programada: 'badge-programada',
      completada: 'badge-completada',
      cancelada: 'badge-cancelada',
    };
    return map[estado?.toLowerCase()] || 'badge-pendiente';
  };

  // ─── HANDLERS CON CONSOLE.LOG PARA BACKEND ───────────────────────────────

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSolicitarCancelacion = () => {
    if (selectedIds.length === 0) return;

    const payload = {
      accion: 'SOLICITAR_CANCELACION_CIRUGIA',
      pacienteId,
      cirugiasIds: selectedIds,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → DELETE /cirugias/cancelar]', JSON.stringify(payload, null, 2));
    alert(`Solicitud de cancelación enviada para ${selectedIds.length} cirugía(s).`);
    setSelectedIds([]);
  };

  const handleAbrirEditar = () => {
    if (selectedIds.length !== 1) return;
    const cirugia = cirugias.find(c => c.id === selectedIds[0]);
    setNuevaFecha(cirugia?.fecha || '');
    setModalEditar(true);
  };

  const handleConfirmarEditar = () => {
    if (!nuevaFecha) return;

    const cirugia = cirugias.find(c => c.id === selectedIds[0]);
    const payload = {
      accion: 'SOLICITAR_CAMBIO_FECHA',
      pacienteId,
      cirugiaId: selectedIds[0],
      fechaAnterior: cirugia?.fecha,
      fechaNueva: nuevaFecha,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → PUT /cirugias/fecha]', JSON.stringify(payload, null, 2));

    setCirugias(prev =>
      prev.map(c => c.id === selectedIds[0] ? { ...c, fecha: nuevaFecha } : c)
    );
    setModalEditar(false);
    setSelectedIds([]);
  };

  const handleSubirDocumento = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const payload = {
      accion: 'SUBIR_DOCUMENTO',
      pacienteId,
      nombreArchivo: file.name,
      tipoArchivo: file.type,
      tamanoBytes: file.size,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → POST /documentos/upload]', JSON.stringify(payload, null, 2));
    setDocumentos(prev => [...prev, file.name]);
  };

  const handleEliminarDocumento = (doc) => {
    const payload = {
      accion: 'ELIMINAR_DOCUMENTO',
      pacienteId,
      nombreArchivo: doc,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → DELETE /documentos]', JSON.stringify(payload, null, 2));
    setDocumentos(prev => prev.filter(d => d !== doc));
  };

  const handleDescargarDocumento = (doc) => {
    const payload = {
      accion: 'DESCARGAR_DOCUMENTO',
      pacienteId,
      nombreArchivo: doc,
      timestamp: new Date().toISOString(),
    };

    console.log('[BACKEND → GET /documentos/download]', JSON.stringify(payload, null, 2));
    alert(`Descargando: ${doc}`);
  };

  // ─── EVENTOS PARA EL CALENDARIO ──────────────────────────────────────────

  const eventos = cirugias.map(c => ({
    title: c.tipo,
    date: c.fecha,
    backgroundColor: c.estado === 'completada' ? '#16a34a'
      : c.estado === 'cancelada' ? '#dc2626' : '#2563eb',
    borderColor: 'transparent',
  }));

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="paciente-page">

      {/* HEADER */}
      <header className="paciente-header">
        <span className="brand">HospiTEC</span>
        <div className="user-info">
          <div className="user-avatar">{iniciales}</div>
          <span className="user-name">{usuarioActual.nombre || 'Paciente'}</span>
          <button
            className="btn-logout"
            onClick={() => {
              console.log('[BACKEND → POST /auth/logout]', { pacienteId, timestamp: new Date().toISOString() });
              localStorage.removeItem('usuario');
              window.location.href = '/';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="paciente-content">
        <h1 className="page-title">Mi Portal de Salud</h1>
        <p className="page-subtitle">Gestioná tus citas, cirugías y documentos médicos.</p>

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
          <button
            className={`tab-btn ${tabActiva === 'documentos' ? 'active' : ''}`}
            onClick={() => setTabActiva('documentos')}
          >
            Documentos
          </button>
        </div>

        {/* TAB: CIRUGÍAS */}
        {tabActiva === 'citas' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Historial de Cirugías</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {cirugias.length} registro(s)
              </span>
            </div>

            {cirugias.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏥</div>
                <p>No tenés cirugías registradas.</p>
              </div>
            ) : (
              <div className="tabla-wrapper">
                <table className="tabla-cirugias">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Cirujano</th>
                      <th>Anestesiólogo</th>
                      <th>Asistentes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cirugias.map(c => (
                      <tr
                        key={c.id}
                        className={selectedIds.includes(c.id) ? 'selected' : ''}
                        onClick={() => handleToggleSelect(c.id)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => handleToggleSelect(c.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td>{c.id}</td>
                        <td>{c.tipo}</td>
                        <td>{c.fecha}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>{getUsuarioNombre(c.cirujanoId)}</td>
                        <td>{getUsuarioNombre(c.anestesiologoId)}</td>
                        <td>
                          {c.asistentes?.map(a => getUsuarioNombre(a.asistenteId)).join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="acciones-bar">
              <button
                className="btn btn-danger"
                onClick={handleSolicitarCancelacion}
                disabled={selectedIds.length === 0}
              >
                Cancelar cirugía(s)
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleAbrirEditar}
                disabled={selectedIds.length !== 1}
              >
                Cambiar fecha
              </button>
              {selectedIds.length > 0 && (
                <span className="selection-info">
                  {selectedIds.length} seleccionada(s)
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB: CALENDARIO */}
        {tabActiva === 'calendario' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Calendario de Cirugías</span>
            </div>
            <div className="card-body calendar-container">
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

        {/* TAB: DOCUMENTOS */}
        {tabActiva === 'documentos' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Mis Documentos</span>
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                + Subir documento
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleSubirDocumento}
              />
            </div>
            <div className="card-body">
              <ul className="doc-list">
                {documentos.map(doc => (
                  <li key={doc} className="doc-item">
                    <div className="doc-name">
                      <span className="doc-icon">📄</span>
                      {doc}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleEliminarDocumento(doc)}
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
                {documentos.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <p>No hay documentos subidos todavía.</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDITAR FECHA */}
      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Solicitar cambio de fecha</h3>
            <div className="form-group">
              <label>Nueva fecha</label>
              <input
                type="date"
                value={nuevaFecha}
                onChange={e => setNuevaFecha(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalEditar(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmarEditar}>
                Confirmar solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Paciente;