import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Pages/Login/Login';
import Cirujano from './Components/Pages/Cirujano/Cirujano';
import Asistente from './Components/Pages/Asistente/Asistente';
import Anestesiologo from './Components/Pages/Anestesiologo/Anestesiologo';
import Paciente from './Components/Pages/Paciente/Paciente';
import Administrador from './Components/Pages/Administrador/Administrador';
import TwoFactorAuthentication from './Components/Pages/Login/2FA';
import ProtectedRoute from './Components/ProtectedRoute';
import Require2FA from './Components/Require2FA';
import CookieBanner from './Components/CookieBanner/CookieBanner'; // new

function App() {
  return (
    <Router>
      <div className="App">
        <CookieBanner /> {/* new */}
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<Login />} />

          {/* Ruta enlazada para autenticación de dos factores */}
          <Route path="/2fa" element={<Require2FA><TwoFactorAuthentication/></Require2FA>} />

          {/* Rutas protegidas por rol */}
          <Route path="/cirujano" element={
            <ProtectedRoute rolPermitido={2}>
              <Cirujano />
            </ProtectedRoute>
          } />
          <Route path="/asistente" element={
            <ProtectedRoute rolPermitido={3}>
              <Asistente />
            </ProtectedRoute>
          } />
          <Route path="/anestesiologo" element={
            <ProtectedRoute rolPermitido={4}>
              <Anestesiologo />
            </ProtectedRoute>
          } />
          <Route path="/paciente" element={
            <ProtectedRoute rolPermitido={1}>
              <Paciente />
            </ProtectedRoute>
          } />
          <Route path="/administrador" element={
            <ProtectedRoute rolPermitido={0}>
              <Administrador />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;