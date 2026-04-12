import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Mapeo de rol numérico → ruta
const ROL_RUTAS = {
  1: '/paciente',
  2: '/cirujano',
  3: '/asistente',
  4: '/anestesiologo',
  0: '/administrador',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: email.trim().toLowerCase(),
          contrasena: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Error al iniciar sesión');
        return;
      }

      const usuario = await response.json();
      const ruta = ROL_RUTAS[usuario.rol];

      if (!ruta) {
        setError('Rol de usuario no válido.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(usuario));
      navigate(ruta);

    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>HospiTEC</h1>
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="admin@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type={mostrarContrasena ? 'text' : 'password'}
            placeholder="Contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-pass"
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
          >
            {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default Login;