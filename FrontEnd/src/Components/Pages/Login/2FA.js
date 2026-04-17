import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './2FA.css';

// Mapeo de rol numérico → ruta
const ROL_RUTAS = {
  1: '/paciente',
  2: '/cirujano',
  3: '/asistente',
  4: '/anestesiologo',
  0: '/administrador',
};

function TwoFactorAuthentication() {
  const [code, setCode] = useState('');
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const tempUser = JSON.parse(localStorage.getItem('tempUser'));

      const response = await fetch(`http://127.0.0.1:8000/api/v1/login_2FA`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: tempUser.correo,
          token_2fa: code
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Error en la verificación del código');
        return;
      }

      const usuario = await response.json();
      const ruta = ROL_RUTAS[usuario.rol];

      if (!ruta) {
        setError('Rol de usuario no válido.');
        return;
      }

      // Guardar token separado, datos del usuario sin el token
      sessionStorage.setItem('token', usuario.access_token);
      sessionStorage.setItem('usuario', JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol,
      }));
      localStorage.removeItem('tempUser');
      localStorage.removeItem('2fa_challenge');
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
          <label htmlFor="code">Código de autenticación</label>
          <input
            id="code"
            type={mostrarCodigo ? 'text' : 'password'}
            placeholder="Código de autenticación"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <span
            className="toggle-pass"
            onClick={() => setMostrarCodigo(!mostrarCodigo)}
          >
            {mostrarCodigo ? 'Ocultar' : 'Mostrar'}
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

export default TwoFactorAuthentication;