import { useState, useEffect } from 'react';
import './CookieBanner.css';

// Generates or retrieves an anonymous session key for pre-login users
function obtenerClavesSesion() {
  let clave = localStorage.getItem('sessionKey');
  if (!clave) {
    clave = crypto.randomUUID();
    localStorage.setItem('sessionKey', clave);
  }
  return clave;
}

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    verificarConsentimiento();
  }, []);

  async function verificarConsentimiento() {
    const usuario = JSON.parse(localStorage.getItem('user') || 'null');
    const clavesSesion = obtenerClavesSesion();

    const params = usuario
      ? `usuario_id=${usuario.id}`
      : `clave_sesion=${clavesSesion}`;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/cookies/consentimiento?${params}`);
      const data = await res.json();
      // Show banner only if no decision has been recorded yet
      if (!data.hay_decision) setVisible(true);
    } catch {
      setVisible(true); // Show banner if API fails, to be safe
    }
  }

  async function manejarDecision(aceptado) {
    const usuario = JSON.parse(localStorage.getItem('user') || 'null');
    const clavesSesion = obtenerClavesSesion();

    try {
      await fetch('http://127.0.0.1:8000/api/v1/cookies/consentimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario?.id || null,
          clave_sesion: usuario ? null : clavesSesion,
          aceptado,
        }),
      });
    } catch {
      // Save locally as fallback if API is unreachable
      localStorage.setItem('cookieFallback', aceptado ? 'aceptado' : 'rechazado');
    } finally {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        Usamos cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?
      </p>
      <div className="cookie-banner-buttons">
        <button onClick={() => manejarDecision(true)} className="btn-aceptar">
          Aceptar
        </button>
        <button onClick={() => manejarDecision(false)} className="btn-rechazar">
          Rechazar
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;