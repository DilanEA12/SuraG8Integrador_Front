// ====================================
// LISTA USUARIOS - UNIFICADA
// Usa usuarioService (sin fetch directo)
// Export corregido: ListaUsuarios (no UsuarioLista)
// ====================================

import { useEffect, useState } from 'react';
import { usuarioService } from '../../services/usuarioService';
import './ListaUsuarios.css';

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await usuarioService.listarTodos();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los usuarios. Verifica que el backend esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const data = await usuarioService.buscarPorId(id);
      setUsuarioSeleccionado(data);
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el usuario');
    }
  };

  const cerrarDetalle = () => setUsuarioSeleccionado(null);

  if (cargando) {
    return (
      <div className="usuario-lista">
        <div className="cargando-container">
          <div className="spinner-global"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuario-lista">
      <h2>Usuarios registrados</h2>

      {error && <p className="error-mensaje">{error}</p>}

      {!error && usuarios.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--sura-texto-secundario)' }}>
          No hay usuarios registrados.
        </p>
      )}

      <div className="usuario-cuadricula">
        {usuarios.map((usuario) => (
          <div className="usuario-carta" key={usuario.id}>
            <h3>{usuario.nombre}</h3>
            <p><strong>Rol:</strong> {usuario.rol}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
            <button onClick={() => verDetalle(usuario.id)}>Ver detalle</button>
          </div>
        ))}
      </div>

      {usuarioSeleccionado && (
        <div className="usuario-detalle">
          <h3>Detalle del usuario</h3>
          <p><strong>Nombre:</strong> {usuarioSeleccionado.nombre}</p>
          <p><strong>Correo:</strong> {usuarioSeleccionado.correo}</p>
          <p><strong>Rol:</strong> {usuarioSeleccionado.rol}</p>
          <p><strong>Teléfono:</strong> {usuarioSeleccionado.telefono}</p>
          <button onClick={cerrarDetalle} style={{ marginTop: '10px' }}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

// ✅ Export correcto (coincide con lo que importa App.jsx)
export default ListaUsuarios;
