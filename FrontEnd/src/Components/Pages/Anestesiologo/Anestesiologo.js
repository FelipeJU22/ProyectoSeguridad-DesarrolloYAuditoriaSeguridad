import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Tab, Tabs } from 'react-bootstrap';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';

function Anestesiologo() {
  const [cirugias, setCirugias] = useState([]);
  const [activeTab, setActiveTab] = useState('citas');
  const calendarRef = useRef(null);
  const anestesiologoId = 4; // ID del anestesiólogo actual

  useEffect(() => {
    setCirugias(cirugiasData.filter(c => c.anestesiologoId === anestesiologoId));
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
    { name: 'Cirujano', selector: row => getUsuarioNombre(row.cirujanoId), sortable: true }
  ];

  return (
    <div>
      <h2>Anestesiólogo</h2>
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} id="anestesiologo-tabs">
        <Tab eventKey="citas" title="Citas">
          <DataTable
            columns={columns}
            data={cirugias}
            pagination
          />
        </Tab>
        <Tab eventKey="calendario" title="Calendario">
          <div ref={calendarRef} style={{ minHeight: '500px', marginTop: '16px' }} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Anestesiologo;