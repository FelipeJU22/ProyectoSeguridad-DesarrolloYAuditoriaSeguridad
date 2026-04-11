import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usuarios from '../../Data/usuarios.json';
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

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario) {
      setError('El correo electrónico no está registrado.');
      return;
    }

    if (usuario.password !== password) {
      setError('Contraseña incorrecta.');
      return;
    }

    const ruta = ROL_RUTAS[usuario.rol];

    if (!ruta) {
      setError('Rol de usuario no válido.');
      return;
    }

    console.log('[BACKEND → POST /auth/login]', JSON.stringify({
      accion: 'LOGIN',
      usuarioId: usuario.id,
      rol: usuario.rol,
      timestamp: new Date().toISOString(),
    }, null, 2));

    localStorage.setItem('usuario', JSON.stringify(usuario));
    navigate(ruta);
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