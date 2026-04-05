import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Pages/Login/Login';
import Cirujano from './Components/Pages/Cirujano/Cirujano';
import Asistente from './Components/Pages/Asistente/Asistente';
import Anestesiologo from './Components/Pages/Anestesiologo/Anestesiologo';
import Paciente from './Components/Pages/Paciente/Paciente';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cirujano" element={<Cirujano />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/anestesiologo" element={<Anestesiologo />} />
          <Route path="/paciente" element={<Paciente />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
