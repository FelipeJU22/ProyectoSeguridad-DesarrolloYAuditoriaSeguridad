import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Tab, Tabs } from 'react-bootstrap';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';

function Paciente() {
  const [cirugias, setCirugias] = useState([]);
  const [documents, setDocuments] = useState(['documento1.pdf', 'documento2.pdf']);
  const [selectedRows, setSelectedRows] = useState([]);
  const pacienteId = 1; // ID del paciente actual

  useEffect(() => {
    const filtered = cirugiasData.filter(c => c.pacienteId === pacienteId);
    setCirugias(filtered);
  }, []);

  const getUsuarioNombre = (id) => {
    const usuario = usuariosData.find(u => u.id === id);
    return usuario ? usuario.nombre : 'Desconocido';
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Tipo', selector: row => row.tipo, sortable: true },
    { name: 'Fecha', selector: row => row.fecha, sortable: true },
    { name: 'Estado', selector: row => row.estado, sortable: true },
    { name: 'Cirujano', selector: row => getUsuarioNombre(row.cirujanoId), sortable: true },
    { name: 'Anestesiólogo', selector: row => getUsuarioNombre(row.anestesiologoId), sortable: true },
    {
      name: 'Asistentes',
      selector: row => row.asistentes.map(a => getUsuarioNombre(a.asistenteId)).join(', ')
    }
  ];

  const handleDelete = () => {
    setCirugias(cirugias.filter(c => !selectedRows.includes(c.id)));
    setSelectedRows([]);
  };

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const newDate = prompt('Nueva fecha (YYYY-MM-DD):');
      if (newDate) {
        setCirugias(cirugias.map(c =>
          c.id === selectedRows[0] ? { ...c, fecha: newDate } : c
        ));
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments([...documents, file.name]);
    }
  };

  const handleDeleteDocument = (doc) => {
    setDocuments(documents.filter(d => d !== doc));
  };

  const events = cirugias.map(c => ({
    title: c.tipo,
    date: c.fecha,
  }));

  return (
    <div>
      <Tabs defaultActiveKey="citas" id="paciente-tabs">
        <Tab eventKey="citas" title="Citas">
          <DataTable
            columns={columns}
            data={cirugias}
            selectableRows
            onSelectedRowsChange={({ selectedRows }) =>
              setSelectedRows(selectedRows.map(r => r.id))
            }
            pagination
          />
          <button onClick={handleDelete}>Borrar</button>
          <button onClick={handleEdit}>Editar Fecha</button>
          <button
            onClick={() => {
              const calendarEl = document.getElementById('calendar');
              const calendar = new Calendar(calendarEl, {
                plugins: [dayGridPlugin],
                events,
              });
              calendar.render();
            }}
          >
            Ver Calendario
          </button>
          <div id="calendar" style={{ marginTop: '20px' }}></div>
        </Tab>
        <Tab eventKey="documentos" title="Documentos">
          <input type="file" onChange={handleFileUpload} />
          <ul>
            {documents.map(doc => (
              <li key={doc}>
                {doc} <button onClick={() => handleDeleteDocument(doc)}>Borrar</button>
              </li>
            ))}
          </ul>
        </Tab>
      </Tabs>
    </div>
  );
}

export default Paciente;