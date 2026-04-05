import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div>
      login
      <br />
      <Link to="/cirujano"><button>Cirujano</button></Link>
      <Link to="/asistente"><button>Asistente</button></Link>
      <Link to="/anestesiologo"><button>Anestesiologo</button></Link>
      <Link to="/paciente"><button>Paciente</button></Link>
    </div>
  );
}

export default Login;