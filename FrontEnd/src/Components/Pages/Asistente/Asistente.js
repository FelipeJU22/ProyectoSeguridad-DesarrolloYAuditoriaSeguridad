import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Tab, Tabs } from 'react-bootstrap';
import cirugiasData from '../../Data/cirugias.json';
import usuariosData from '../../Data/usuarios.json';

function Asistente() {
  const [cirugias, setCirugias] = useState([]);
  const [activeTab, setActiveTab] = useState('citas');
  const calendarRef = useRef(null);
  const asistenteId = 5; // ID del asistente actual
  const estados = ['programada', 'pendiente', 'completada', 'cancelada'];

  useEffect(() => {
    const filtered = cirugiasData.filter((c) =>
      c.asistentes.some((a) => a.asistenteId === asistenteId)
    );
    setCirugias(filtered);
  }, []);

  useEffect(() => {
    if (activeTab === 'calendario' && calendarRef.current) {
      const calendar = new Calendar(calendarRef.current, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        events: cirugias.map((c) => ({
          title: `${c.tipo} (${c.estado})`,
          date: c.fecha,
        })),
      });
      calendar.render();
      return () => calendar.destroy();
    }
  }, [activeTab, cirugias]);

  const getUsuarioNombre = (id) => {
    const usuario = usuariosData.find((u) => u.id === id);
    return usuario ? usuario.nombre : 'Desconocido';
  };

  const handleChangeEstado = (rowId, nuevoEstado) => {
    setCirugias(
      cirugias.map((c) =>
        c.id === rowId ? { ...c, estado: nuevoEstado } : c
      )
    );
  };

  const columns = [
    { name: 'ID', selector: (row) => row.id, sortable: true },
    { name: 'Paciente', selector: (row) => getUsuarioNombre(row.pacienteId), sortable: true },
    { name: 'Tipo', selector: (row) => row.tipo, sortable: true },
    { name: 'Fecha', selector: (row) => row.fecha, sortable: true },
    { name: 'Estado', selector: (row) => row.estado, sortable: true },
    { name: 'Cirujano', selector: (row) => getUsuarioNombre(row.cirujanoId), sortable: true },
    {
      name: 'Cambiar estado',
      cell: (row) => (
        <select
          value={row.estado}
          onChange={(e) => handleChangeEstado(row.id, e.target.value)}
        >
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      <h2>Asistente</h2>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="asistente-tabs">
        <Tab eventKey="citas" title="Citas">
          <DataTable columns={columns} data={cirugias} pagination />
        </Tab>
        <Tab eventKey="calendario" title="Calendario">
          <div ref={calendarRef} style={{ minHeight: '500px', marginTop: '16px' }} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Asistente;