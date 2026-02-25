// ====================================
// FORMULARIO USUARIO - UNIFICADO
// Usa usuarioService (sin fetch directo)
// Ruta CSS corregida
// ====================================

import { useState } from 'react';
import { mostrarAlerta } from '../../utils/swalConfig';
import Swal from 'sweetalert2';
import { usuarioService } from '../../services/usuarioService';
import './UsuarioFormulario.css'; // ✅ Ruta corregida (era '../usuarios/UsuarioFormulario.css')
import logoSura from '../../imagenes/logoSura.png';

function UsuarioFormulario() {
  const [usuario, setUsuario] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: '',
    telefono: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const capturarDatos = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const validarTelefono = (tel) => /^[0-9]{7,10}$/.test(tel);

  const envioDatos = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!usuario.nombre || !usuario.correo || !usuario.contraseña || !usuario.rol) {
      setError('Todos los campos obligatorios deben estar llenos');
      return;
    }
    if (!validarCorreo(usuario.correo)) {
      setError('El correo no es válido');
      return;
    }
    if (usuario.telefono && !validarTelefono(usuario.telefono)) {
      setError('El teléfono solo debe contener números (7 a 10 dígitos)');
      return;
    }
    if (usuario.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setCargando(true);

    try {
      // Usamos el servicio en vez de fetch directo
      await usuarioService.crear(usuario);

      mostrarAlerta({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Usuario creado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      setUsuario({ nombre: '', correo: '', contraseña: '', rol: '', telefono: '' });

      } catch (err) {

        mostrarAlerta({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo crear el usuario',
        });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-formulario">
      <img src={logoSura} alt="Logo Sura" className="logo-sura-formulario" />

      <form onSubmit={envioDatos} className="usuario-formulario">
        <h2>Registro de usuario</h2>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={usuario.nombre}
          onChange={capturarDatos}
        />
        <input
          type="text"
          name="correo"
          placeholder="Correo"
          value={usuario.correo}
          onChange={capturarDatos}
        />
        <input
          type="password"
          name="contraseña"
          placeholder="Contraseña"
          value={usuario.contraseña}
          onChange={capturarDatos}
        />
        <select name="rol" value={usuario.rol} onChange={capturarDatos}>
          <option value="">Selecciona un rol</option>
          <option value="Profesor">PROFESOR</option>
          <option value="Estudiante">ESTUDIANTE</option>
        </select>
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono (opcional)"
          value={usuario.telefono}
          onChange={capturarDatos}
        />

        {error && <p className="error-mensaje">{error}</p>}

        <button type="submit" disabled={!usuario.rol || cargando}>
          {cargando ? 'Guardando...' : 'Guardar'}
        </button>

        <p>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  );
}

export default UsuarioFormulario;
