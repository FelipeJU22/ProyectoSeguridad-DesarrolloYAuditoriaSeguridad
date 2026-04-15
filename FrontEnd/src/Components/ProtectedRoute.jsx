import { Navigate } from 'react-router-dom';

const ROL_RUTAS = {
  1: '/paciente',
  2: '/cirujano',
  3: '/asistente',
  4: '/anestesiologo',
  0: '/administrador',
};

function ProtectedRoute({ children, rolPermitido }) {
  const usuarioRaw = localStorage.getItem('usuario');

  // 1. Si no hay sesión → redirige al login
  if (!usuarioRaw) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioRaw);

  // 2. Si el rol no coincide → redirige a SU ruta correcta
  if (usuario.rol !== rolPermitido) {
    const rutaCorrecta = ROL_RUTAS[usuario.rol];
    return <Navigate to={rutaCorrecta || '/'} replace />;
  }

  // 3. Todo OK → renderiza la página
  return children;
}

export default ProtectedRoute;