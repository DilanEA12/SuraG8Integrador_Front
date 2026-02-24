// ====================================
// LISTA PROFESORES - UNIFICADA
// Profesor: ve todos los campos + acciones CRUD
// Estudiante: ve info pública (nombre, foto, áreas, perfil)
// ====================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profesorService } from '../../services/profesorService';
import './Profesores.css';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

function ListaProfesores() {
  const navigate = useNavigate();
  const usuario    = JSON.parse(localStorage.getItem('usuario'));
  const esProfesor = usuario?.rol === 'Profesor';

  const [profesores, setProfesores]   = useState([]);
  const [filtrados,  setFiltrados]    = useState([]);
  const [busqueda,   setBusqueda]     = useState('');
  const [cargando,   setCargando]     = useState(true);
  const [error,      setError]        = useState('');
  const [seleccionado, setSeleccionado] = useState(null); // modal de detalle

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    const q = busqueda.toLowerCase();
    setFiltrados(
      profesores.filter(p =>
        (p.nombreCompleto || p.nombre || '').toLowerCase().includes(q) ||
        (p.areasAsignadas || p.especialidad || '').toLowerCase().includes(q) ||
        String(p.id || '').includes(q)
      )
    );
  }, [busqueda, profesores]);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await profesorService.listarTodos();
      // Mostrar solo activos; profesores ven todos
      const lista = esProfesor ? data : data.filter(p => p.vigencia !== false);
      setProfesores(lista);
      setFiltrados(lista);
    } catch {
      setError('No se pudieron cargar los profesores. Verifica que el backend esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  const handleDesactivar = async (id) => {
    if (!window.confirm('¿Desactivar este profesor?')) return;
    try {
      await profesorService.desactivar(id);
      cargar();
    } catch {
      alert('No se pudo desactivar el profesor.');
    }
  };

  // ---- RENDER ----
  if (cargando) return (
    <div className="profesores-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando profesores...</p>
      </div>
    </div>
  );

  return (
    <div className="profesores-container">

      {/* ENCABEZADO */}
      <div className="list-header">
        <h2>🎓 {esProfesor ? 'Gestión de Profesores' : 'Nuestros Profesores'}</h2>
        {esProfesor && (
          <button
            className="add-profesor-btn"
            onClick={() => navigate('/profesores/crear')}
          >
            ＋ Nuevo Profesor
          </button>
        )}
      </div>

      {/* BUSCADOR */}
      <input
        className="search-bar"
        placeholder="🔍 Buscar por nombre o área..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {error && <p className="mensaje-error-lista">{error}</p>}

      {!error && filtrados.length === 0 && (
        <p className="sin-resultados-lista">No se encontraron profesores.</p>
      )}

      {/* GRID DE TARJETAS */}
      <div className="profesores-grid">
        {filtrados.map(prof => {
          const nombre = prof.nombreCompleto || prof.nombre || 'Sin nombre';
          const areas  = prof.areasAsignadas || prof.especialidad || '—';
          const perfil = prof.perfilProfesional || prof.descripcion || '';
          const foto   = prof.foto || DEFAULT_AVATAR;
          const activo = prof.vigencia !== false;

          return (
            <div
              key={prof.id}
              className={`profesor-card ${!activo ? 'profesor-inactivo' : ''}`}
            >
              {/* Foto */}
              <img
                src={foto}
                alt={nombre}
                className="profesor-foto"
                onError={e => { e.target.src = DEFAULT_AVATAR; }}
              />

              {/* Info */}
              <h3>{nombre}</h3>
              <p className="profesor-areas">📚 {areas}</p>

              {perfil && (
                <p className="profesor-perfil-breve">
                  {perfil.length > 100 ? perfil.substring(0, 100) + '...' : perfil}
                </p>
              )}

              {/* Nivel académico - visible para ambos */}
              {prof.nivelAcademico && (
                <span className="badge-nivel">{prof.nivelAcademico}</span>
              )}

              {/* Estado (solo profesor ve inactivos) */}
              {esProfesor && !activo && (
                <span className="badge-inactivo">Inactivo</span>
              )}

              {/* Años de experiencia - público */}
              {prof.anosExperiencia > 0 && (
                <p className="profesor-exp">
                  ⏱ {prof.anosExperiencia} años de experiencia
                </p>
              )}

              {/* ACCIONES */}
              <div className="profesor-acciones">
                {/* Ver detalle - todos */}
                <button
                  className="btn-accion btn-ver"
                  onClick={() => setSeleccionado(prof)}
                >
                  👁 Ver
                </button>

                {/* Editar - solo profesor */}
                {esProfesor && (
                  <button
                    className="btn-accion btn-editar"
                    onClick={() => navigate(`/profesores/editar/${prof.id}`)}
                  >
                    ✏️ Editar
                  </button>
                )}

                {/* Desactivar - solo profesor y si está activo */}
                {esProfesor && activo && (
                  <button
                    className="btn-accion btn-desactivar"
                    onClick={() => handleDesactivar(prof.id)}
                  >
                    🚫 Desactivar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALLE */}
      {seleccionado && (
        <ModalDetalle
          prof={seleccionado}
          esProfesor={esProfesor}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

// ====================================
// MODAL DE DETALLE
// Profesor: ve datos sensibles + documentos
// Estudiante: ve solo info pública
// ====================================
function ModalDetalle({ prof, esProfesor, onCerrar }) {
  const nombre = prof.nombreCompleto || prof.nombre || 'Sin nombre';
  const foto   = prof.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-detalle" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header-prof">
          <img
            src={foto}
            alt={nombre}
            className="modal-foto"
            onError={e => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
          />
          <div>
            <h3>{nombre}</h3>
            <p>{prof.areasAsignadas || prof.especialidad || '—'}</p>
          </div>
          <button className="btn-cerrar-modal-prof" onClick={onCerrar}>✕</button>
        </div>

        {/* Cuerpo */}
        <div className="modal-body-prof">

          {/* Info pública - todos la ven */}
          <section className="modal-seccion">
            <h4>📋 Información General</h4>
            <Item label="Nivel Académico"   valor={prof.nivelAcademico} />
            <Item label="Áreas Asignadas"   valor={prof.areasAsignadas || prof.especialidad} />
            <Item label="Años de Experiencia" valor={prof.anosExperiencia ? `${prof.anosExperiencia} años` : null} />
            {prof.perfilProfesional && (
              <div className="modal-item modal-item-bloque">
                <span className="modal-label">Perfil Profesional</span>
                <p className="modal-valor-bloque">{prof.perfilProfesional}</p>
              </div>
            )}
          </section>

          {/* Info sensible - SOLO PROFESORES */}
          {esProfesor && (
            <>
              <section className="modal-seccion">
                <h4>🔒 Datos Laborales (Confidencial)</h4>
                <Item label="N° Documento"    valor={prof.numeroDocumento} />
                <Item label="Correo"          valor={prof.correoElectronico} />
                <Item label="Celular"         valor={prof.celular} />
                <Item label="Tipo de Contrato" valor={prof.tipoContrato} />
                <Item
                  label="Estado"
                  valor={prof.vigencia !== false ? 'Activo' : 'Inactivo'}
                />
              </section>

              {/* Hoja de vida */}
              {(prof.hojaDeVida || prof.hojaDeVidaFile) && (
                <section className="modal-seccion">
                  <h4>📄 Hoja de Vida</h4>
                  {prof.hojaDeVida && (
                    <a
                      href={prof.hojaDeVida}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accion btn-ver"
                    >
                      📥 Ver / Descargar CV
                    </a>
                  )}
                </section>
              )}
            </>
          )}

          {/* Aviso para estudiantes */}
          {!esProfesor && (
            <div className="modal-aviso-estudiante">
              ℹ️ Algunos datos del docente son confidenciales y solo visibles para administradores.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function Item({ label, valor }) {
  if (!valor) return null;
  return (
    <div className="modal-item">
      <span className="modal-label">{label}:</span>
      <span className="modal-valor">{valor}</span>
    </div>
  );
}

export default ListaProfesores;
