import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';
import './Paciente.css';

function Paciente() {
  const [tabActiva, setTabActiva] = useState('citas');
  const [cirugias, setCirugias] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalEditar, setModalEditar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const fileInputRef = useRef(null);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [modalTipoDoc, setModalTipoDoc] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('otro');

  // Leer el usuario del localStorage (del login)
  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
  const pacienteId = usuarioActual.id || 1;
  const iniciales = usuarioActual.nombre
    ? usuarioActual.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'P';

useEffect(() => {
  const fetchCirugias = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/cirugias/paciente/${pacienteId}`);
      if (!response.ok) throw new Error('Error al obtener cirugías');
      const data = await response.json();
      setCirugias(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (pacienteId) fetchCirugias();
}, [pacienteId]);

useEffect(() => {
  const fetchDocumentos = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/documentos/paciente/${pacienteId}`);
      if (!response.ok) throw new Error('Error al obtener documentos');
      const data = await response.json();
      setDocumentos(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (pacienteId) fetchDocumentos();
}, [pacienteId]);

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

  const handleSolicitarCancelacion = async () => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/cirugias/cancelar?usuario_id=${pacienteId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cirugia_ids: selectedIds }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al cancelar cirugías');
        return;
      }

      const result = await response.json();
      alert(`${result.total} cirugía(s) cancelada(s).`);
      setSelectedIds([]);

      const updated = await fetch(`http://127.0.0.1:8000/api/v1/cirugias/paciente/${pacienteId}`);
      setCirugias(await updated.json());

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleAbrirEditar = () => {
    if (selectedIds.length !== 1) return;
    const cirugia = cirugias.find(c => c.id === selectedIds[0]);
    setNuevaFecha(cirugia?.fecha || '');
    setModalEditar(true);
  };

  const handleConfirmarEditar = async () => {
    if (!nuevaFecha) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/cirugias/${selectedIds[0]}/fecha?usuario_id=${pacienteId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fecha_nueva: `${nuevaFecha}T00:00:00` }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al cambiar la fecha');
        return;
      }

      const cirugiaActualizada = await response.json();
      setCirugias(prev =>
        prev.map(c => c.id === selectedIds[0] ? cirugiaActualizada : c)
      );
      setModalEditar(false);
      setSelectedIds([]);

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleSubirDocumento = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      e.target.value = null;
      return;
    }

    setArchivoSeleccionado(file);
    setTipoDocumento('otro');
    setModalTipoDoc(true);
    e.target.value = null;
  };

  const handleConfirmarSubida = async () => {
    if (!archivoSeleccionado) return;

    try {
      const formData = new FormData();
      formData.append('usuario_id', pacienteId);
      formData.append('tipo_documento', tipoDocumento);
      formData.append('archivo', archivoSeleccionado);

      const response = await fetch('http://127.0.0.1:8000/api/v1/documentos/subir', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al subir documento');
        return;
      }

      const nuevoDoc = await response.json();
      setDocumentos(prev => [...prev, nuevoDoc]);
      setModalTipoDoc(false);
      setArchivoSeleccionado(null);

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const handleVerDocumento = (doc) => {
    window.open(
      `http://127.0.0.1:8000/api/v1/documentos/${doc.id}/ver?usuario_id=${pacienteId}`,
      '_blank'
    );
  };

  const handleEliminarDocumento = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.nombre_archivo}"?`)) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/documentos/${doc.id}?usuario_id=${pacienteId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || 'Error al eliminar');
        return;
      }

      setDocumentos(prev => prev.filter(d => d.id !== doc.id));

    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo conectar con el servidor.');
    }
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
    title: c.tipo_cirugia,
    date: c.fecha_programada.split('T')[0],
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
                        <td>{c.tipo_cirugia}</td>
                        <td>{new Date(c.fecha_programada).toLocaleDateString('es-CR')}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(c.estado)}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>{c.cirujano_nombre} {c.cirujano_apellido}</td>
                        <td>{c.anestesiologo_nombre} {c.anestesiologo_apellido}</td>
                        <td>{c.asistentes?.map(a => `${a.nombre} ${a.apellido}`).join(', ') || '—'}</td>
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
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                + Subir documento
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="application/pdf"
                onChange={handleSubirDocumento}
              />
            </div>
            <div className="card-body">
              {documentos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <p>No hay documentos subidos todavía.</p>
                </div>
              ) : (
                <ul className="doc-list">
                  {documentos.map(doc => (
                  <li key={doc.id} className="doc-item">
                    <div className="doc-name">
                      <span className="doc-icon">📄</span>
                      <div>
                        <div style={{ fontWeight: '500' }}>{doc.nombre_archivo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.tipo_documento.replace(/_/g, ' ')} ·{' '}
                          {(doc.tamano_bytes / 1024).toFixed(1)} KB ·{' '}
                          {new Date(doc.creado_en).toLocaleDateString('es-CR')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                      <button className="btn btn-secondary" onClick={() => handleVerDocumento(doc)}>
                        Ver
                      </button>
                      <button className="btn btn-danger" onClick={() => handleEliminarDocumento(doc)}>
                        Borrar
                      </button>
                    </div>
                  </li>
                  ))}
                </ul>
              )}
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

      {/* MODAL TIPO DOCUMENTO */}
      {modalTipoDoc && (
        <div className="modal-overlay" onClick={() => setModalTipoDoc(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Clasificar documento</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {archivoSeleccionado?.name}
            </p>
            <div className="form-group">
              <label>Tipo de documento</label>
              <select
                value={tipoDocumento}
                onChange={e => setTipoDocumento(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="poliza_seguro">Póliza de seguro</option>
                <option value="nota_medica">Nota médica</option>
                <option value="consentimiento_informado">Consentimiento informado</option>
                <option value="resultado_laboratorio">Resultado de laboratorio</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalTipoDoc(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmarSubida}>
                Subir documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Paciente;