import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Tab, Tabs } from 'react-bootstrap';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';

function Cirujano() {
  const [cirugias, setCirugias] = useState([]);
  const [activeTab, setActiveTab] = useState('citas');
  const calendarRef = useRef(null);
  const cirujanoId = 3; // ID del cirujano actual

  useEffect(() => {
    setCirugias(cirugiasData.filter(c => c.cirujanoId === cirujanoId));
  }, []);

  useEffect(() => {
    if (activeTab === 'calendario' && calendarRef.current) {
      const calendar = new Calendar(calendarRef.current, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        events: cirugias.map(c => ({ title: c.tipo, date: c.fecha })),
      });
      calendar.render();
      return () => calendar.destroy();
    }
  }, [activeTab, cirugias]);

  const getUsuarioNombre = id => {
    const usuario = usuariosData.find(u => u.id === id);
    return usuario ? usuario.nombre : 'Desconocido';
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Paciente', selector: row => getUsuarioNombre(row.pacienteId), sortable: true },
    { name: 'Tipo', selector: row => row.tipo, sortable: true },
    { name: 'Fecha', selector: row => row.fecha, sortable: true },
    { name: 'Estado', selector: row => row.estado, sortable: true },
    {
      name: 'Acciones',
      cell: row => <button onClick={() => handleEdit(row)}>Editar</button>
    }
  ];

  const handleEdit = row => {
    const newTipo = prompt('Nuevo tipo:', row.tipo);
    const newFecha = prompt('Nueva fecha (YYYY-MM-DD):', row.fecha);
    if (newTipo && newFecha) {
      setCirugias(cirugias.map(c => c.id === row.id ? { ...c, tipo: newTipo, fecha: newFecha } : c));
    }
  };

  const handleCreate = () => {
    const pacienteId = parseInt(prompt('Paciente ID:'), 10);
    const tipo = prompt('Tipo de cirugía:');
    const fecha = prompt('Fecha (YYYY-MM-DD):');
    const anestesiologoId = parseInt(prompt('ID Anestesiólogo:'), 10);
    const asistentesInput = prompt('IDs de asistentes (separados por coma):', '');
    const asistentes = asistentesInput
      ? asistentesInput.split(',').map(id => ({ asistenteId: parseInt(id.trim(), 10) }))
      : [];

    if (pacienteId && tipo && fecha && anestesiologoId) {
      const newId = Math.max(0, ...cirugias.map(c => c.id)) + 1;
      setCirugias([
        ...cirugias,
        {
          id: newId,
          pacienteId,
          tipo,
          fecha,
          estado: 'programada',
          cirujanoId,
          anestesiologoId,
          asistentes,
          documentos: []
        }
      ]);
    }
  };

  return (
    <div>
      <h2>Cirujano</h2>
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} id="cirujano-tabs">
        <Tab eventKey="citas" title="Citas">
          <DataTable
            columns={columns}
            data={cirugias}
            pagination
          />
          <button onClick={handleCreate}>Crear nueva cita</button>
        </Tab>
        <Tab eventKey="calendario" title="Calendario">
          <div ref={calendarRef} style={{ minHeight: '500px', marginTop: '16px' }} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Cirujano;