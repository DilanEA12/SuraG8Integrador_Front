// ====================================
// LOGIN USUARIOS - UNIFICADO
// Usa usuarioService (sin fetch directo)
// ====================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mostrarAlerta } from '../../utils/swalConfig';
import { usuarioService } from '../../services/usuarioService';
import './LoginUsuarios.css';
import logoSura from '../../imagenes/logoSura.png';

function LoginUsuarios() {
  const [login, setLogin] = useState({ correo: '', contraseña: '' });
  const [cargando, setCargando] = useState(false);
  const navegacion = useNavigate();

  const capturarDatos = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const envioDatos = async (e) => {
    e.preventDefault();

    if (!login.correo || !login.contraseña) {
      mostrarAlerta({
        icon: 'error',
        title: 'Error',
        text: 'Correo y contraseña obligatorios'
      });
      return;
    }

    setCargando(true);

    try {
      // Usamos el servicio en vez de fetch directo
      const usuarioEncontrado = await usuarioService.login(login.correo, login.contraseña);

      localStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));

      mostrarAlerta({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola ${usuarioEncontrado.nombre}`,
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false,
        scrollbarPadding: false,
      });

      navegacion('/home');

    } catch (err) {
      const esCrendenciales = err.message === 'Correo o contraseña incorrectos';

      mostrarAlerta({
        icon: 'error',
        title: 'Error',
        text: esCrendenciales
          ? err.message
          : 'No se pudo conectar con el servidor',
      });

      console.error(err);

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-login">
      <img src={logoSura} alt="Logo Sura" className="logo-sura-login" />

      <form className="login-formulario" onSubmit={envioDatos}>
        <h2>Iniciar sesión</h2>

        <input
          type="text"
          name="correo"
          placeholder="Correo"
          value={login.correo}
          onChange={capturarDatos}
        />

        <input
          type="password"
          name="contraseña"
          placeholder="Contraseña"
          value={login.contraseña}
          onChange={capturarDatos}
        />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>

        <p>
          ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}

export default LoginUsuarios;
