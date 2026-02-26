
import { useState, useEffect, useCallback } from 'react';
import { asistenciaService } from '../../services/asistenciaService';
import { cursoService } from '../../services/cursoService';
import { usuarioService } from '../../services/usuarioService';
import { exportarAsistenciasCSV, exportarAsistenciasPDF } from '../../utils/exportAsistencias';
import './Asistencias.css';

const FORM_INICIAL = {
  nombrePersona: '',
  correoPersona: '',
  fecha:         new Date().toISOString().split('T')[0],
  horaEntrada:   new Date().toTimeString().slice(0, 5),
  asistio:       true,
  tieneExcusa:   false,
  excusa:        '',
};

function ListaAsistencias() {
  const usuario    = JSON.parse(localStorage.getItem('usuario'));
  const esProfesor = usuario?.rol === 'Profesor';

  const [asistencias, setAsistencias] = useState([]);
  const [filtradas,   setFiltradas]   = useState([]);
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroModoEstudianteProfesor, setFiltroModoEstudianteProfesor] = useState('todos');
  const [filtroEstudianteProfesor, setFiltroEstudianteProfesor] = useState('todos');
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');

  // Formulario (solo Profesor)
  const [form,      setForm]      = useState(FORM_INICIAL);
  const [errForm,   setErrForm]   = useState({});
  const [guardando, setGuardando] = useState(false);
  const [msgForm,   setMsgForm]   = useState('');
  const [tipoMsg,   setTipoMsg]   = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoConfirmado, setCursoConfirmado] = useState(false);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState('');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [msgEdicion, setMsgEdicion] = useState('');

  const ordenarAsistenciasDesc = (lista = []) =>
    [...lista].sort((a, b) => {
      const fechaHoraA = `${a.fecha || ''}T${a.horaEntrada || '00:00'}`;
      const fechaHoraB = `${b.fecha || ''}T${b.horaEntrada || '00:00'}`;
      return new Date(fechaHoraB) - new Date(fechaHoraA);
    });

  const obtenerCorreoEstudiante = (est = {}) =>
    est.correo || est.email || est.correoElectronico || '';
  const extraerMaestroCurso = useCallback((curso = {}) => {
    if (!curso) return '';
    if (typeof curso.maestro === 'string') return curso.maestro;
    if (curso.maestro?.nombre) return curso.maestro.nombre;
    if (curso.maestro?.correo) return curso.maestro.correo;
    if (typeof curso.profesor === 'string') return curso.profesor;
    if (curso.profesor?.nombre) return curso.profesor.nombre;
    if (curso.profesor?.correo) return curso.profesor.correo;
    return '';
  }, []);
  const obtenerProfesorRegistro = useCallback((asistencia = {}) =>
    asistencia.profesorNombre ||
    asistencia.profesorCorreo ||
    asistencia.creadoPor ||
    asistencia.usuarioRegistro ||
    extraerMaestroCurso(
      cursos.find((c) => (c.titulo || '') === (asistencia.tituloCurso || ''))
    ) ||
    '', [cursos, extraerMaestroCurso]);

  useEffect(() => {
    const q = busqueda.toLowerCase();
    setFiltradas(
      asistencias.filter(a => {
        const coincideCurso = (
          filtroCurso === 'todos' ||
          (a.tituloCurso || 'sin-curso') === filtroCurso
        );
        const coincideEstado = (
          filtroEstado === 'todos' ||
          (filtroEstado === 'asistio' && a.asistio === true) ||
          (filtroEstado === 'ausente' && a.asistio === false)
        );
        const coincideEstudiante = (
          !esProfesor ||
          filtroModoEstudianteProfesor === 'todos' ||
          filtroEstudianteProfesor === 'todos' ||
          (a.nombrePersona || 'sin-nombre') === filtroEstudianteProfesor
        );
        const coincideBusqueda = (
          (a.nombrePersona || '').toLowerCase().includes(q) ||
          (a.correoPersona || '').toLowerCase().includes(q) ||
          obtenerProfesorRegistro(a).toLowerCase().includes(q) ||
          (a.tituloCurso || '').toLowerCase().includes(q) ||
          (a.excusa || '').toLowerCase().includes(q) ||
          (a.fecha || '').includes(q) ||
          String(a.id || '').includes(q)
        );
        return coincideCurso && coincideEstado && coincideEstudiante && coincideBusqueda;
      })
    );
  }, [busqueda, asistencias, filtroCurso, filtroEstado, filtroModoEstudianteProfesor, filtroEstudianteProfesor, esProfesor, obtenerProfesorRegistro]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      let data = await asistenciaService.listarTodas();
      // Estudiante ve sus registros por correo (preferido) o por nombre (fallback)
      if (!esProfesor && (usuario?.correo || usuario?.nombre)) {
        data = data.filter(a =>
          (usuario?.correo && (a.correoPersona || '').toLowerCase() === usuario.correo.toLowerCase()) ||
          (usuario?.nombre && (a.nombrePersona || '').toLowerCase().includes(usuario.nombre.toLowerCase()))
        );
      }
      const ordenadas = ordenarAsistenciasDesc(data);
      setAsistencias(ordenadas);
      setFiltradas(ordenadas);
    } catch {
      setError('No se pudieron cargar las asistencias. Verifica que el backend este corriendo.');
    } finally {
      setCargando(false);
    }
  }, [esProfesor, usuario?.correo, usuario?.nombre]);

  const cargarCursos = useCallback(async () => {
    setCargandoCursos(true);
    setErrorCursos('');
    try {
      const data = await cursoService.listarTodos();
      setCursos(Array.isArray(data) ? data : []);
    } catch {
      setErrorCursos('No se pudieron cargar los cursos. Verifica el backend.');
    } finally {
      setCargandoCursos(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    cargarCursos();
  }, [cargar, cargarCursos]);

  const abrirFormulario = async () => {
    if (!mostrarForm) {
      setMostrarForm(true);
      setCursoConfirmado(false);
      setMsgForm('');
      setErrorEstudiantes('');
      if (cursos.length === 0) {
        await cargarCursos();
      }
      return;
    }
    setMostrarForm(false);
    setCursoConfirmado(false);
    setErrForm({});
    setMsgForm('');
    setErrorEstudiantes('');
  };

  const confirmarCurso = () => {
    if (!cursoSeleccionado) {
      setErrorCursos('Debes seleccionar un curso para continuar.');
      return;
    }
    setErrorCursos('');
    cargarEstudiantes();
  };

  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    setErrorEstudiantes('');
    try {
      const usuarios = await usuarioService.listarTodos();
      const normalizar = (txt = '') =>
        txt.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const soloEstudiantes = (Array.isArray(usuarios) ? usuarios : [])
        .filter((u) => normalizar(u.rol) === 'estudiante')
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

      setEstudiantes(soloEstudiantes);
      if (soloEstudiantes.length === 0) {
        setErrorEstudiantes('No hay usuarios con rol Estudiante para registrar asistencia.');
        return;
      }
      setCursoConfirmado(true);
    } catch {
      setErrorEstudiantes('No se pudieron cargar los estudiantes. Verifica el backend.');
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  // -- Formulario --
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setForm(prev => {
      const next = { ...prev, [name]: val };

      if (name === 'asistio' && checked) {
        next.tieneExcusa = false;
        next.excusa = '';
      }

      if (name === 'tieneExcusa' && !checked) {
        next.excusa = '';
      }

      return next;
    });
  };

  const validar = () => {
    const errs = {};
    if (!form.nombrePersona.trim()) errs.nombrePersona = 'El nombre es obligatorio';
    if (!form.fecha)                errs.fecha         = 'La fecha es obligatoria';
    if (!form.horaEntrada)          errs.horaEntrada   = 'La hora es obligatoria';
    if (!form.asistio && form.tieneExcusa && !form.excusa.trim()) {
      errs.excusa = 'Debes escribir la excusa';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    setErrForm(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    setMsgForm('');
    try {
      const payload = {
        ...form,
        tituloCurso: cursoSeleccionado,
        profesorNombre: extraerMaestroCurso(
          cursos.find((c) => (c.titulo || '') === cursoSeleccionado)
        ) || null,
        correoPersona: form.correoPersona || null,
        tieneExcusa: form.asistio ? false : form.tieneExcusa,
        excusa: (!form.asistio && form.tieneExcusa) ? form.excusa.trim() : null,
      };
      await asistenciaService.crear({
        ...payload,
      });
      setMsgForm('Asistencia registrada exitosamente!');
      setTipoMsg('exito');
      setForm(FORM_INICIAL);
      setErrForm({});
      setTimeout(() => { setMsgForm(''); setMostrarForm(false); cargar(); }, 1800);
    } catch (err) {
      setMsgForm(err.message || 'Error al registrar. Verifica el backend.');
      setTipoMsg('error');
    } finally {
      setGuardando(false);
    }
  };

  // -- Exportar --
  const handleExportCSV = () => {
    const datos = filtradas.map(a => ({
      ...a,
      profesorNombre: obtenerProfesorRegistro(a),
    }));
    exportarAsistenciasCSV(datos);
  };

  const handleExportPDF = () => {
    const datos = filtradas.map(a => ({
      ...a,
      profesorNombre: obtenerProfesorRegistro(a),
    }));
    exportarAsistenciasPDF(datos);
  };

  const iniciarEdicion = (asistencia) => {
    setEditando(asistencia.id);
    setMsgEdicion('');
    setEditForm({
      ...asistencia,
      tituloCurso: asistencia.tituloCurso || '',
      asistio: asistencia.asistio === true,
      tieneExcusa: asistencia.tieneExcusa === true,
      excusa: asistencia.excusa || '',
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setEditForm(null);
    setMsgEdicion('');
  };

  const guardarEdicion = async () => {
    if (!editForm) return;
    if (!editForm.fecha || !editForm.horaEntrada) {
      setMsgEdicion('Fecha y hora de entrada son obligatorias.');
      return;
    }
    if (!editForm.asistio && editForm.tieneExcusa && !String(editForm.excusa || '').trim()) {
      setMsgEdicion('Debes escribir la excusa para guardar.');
      return;
    }
    const confirma = window.confirm('Deseas guardar los cambios de esta asistencia?');
    if (!confirma) return;

    setGuardandoEdicion(true);
    setMsgEdicion('');
    try {
      const payload = {
        ...editForm,
        profesorNombre: extraerMaestroCurso(
          cursos.find((c) => (c.titulo || '') === (editForm.tituloCurso || ''))
        ) || editForm.profesorNombre || null,
        tieneExcusa: editForm.asistio ? false : !!editForm.tieneExcusa,
        excusa: (!editForm.asistio && editForm.tieneExcusa) ? String(editForm.excusa || '').trim() : null,
      };
      await asistenciaService.actualizar(payload);
      setMsgEdicion('Asistencia actualizada correctamente.');
      setTimeout(() => {
        cancelarEdicion();
        cargar();
      }, 700);
    } catch (err) {
      setMsgEdicion(err.message || 'No se pudo actualizar la asistencia.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // -- Render --
  if (cargando) return (
    <div className="asistencias-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando asistencias...</p>
      </div>
    </div>
  );

  const presentes = filtradas.filter(a => a.asistio === true).length;
  const ausentes  = filtradas.filter(a => a.asistio === false).length;
  const pct       = filtradas.length > 0
    ? ((presentes / filtradas.length) * 100).toFixed(1)
    : 0;
  const cursosFiltro = [...new Set(
    asistencias.map(a => a.tituloCurso || 'sin-curso')
  )];
  const estudiantesFiltroProfesor = [...new Set(
    asistencias.map(a => a.nombrePersona || 'sin-nombre')
  )];

  return (
    <div className="asistencias-container">

      {/* ENCABEZADO */}
      <div className="asistencias-header">
        <div>
          <h2>📋 {esProfesor ? 'Gestión de Asistencias' : 'Mi Asistencia'}</h2>
          <p className="asistencias-subtitulo">
            {esProfesor
              ? 'Registra y consulta las asistencias del sistema'
              : `Mostrando registros de: ${usuario?.nombre || 'tu cuenta'}`}
          </p>
        </div>
        {esProfesor && (
          <button
            className="btn-nueva-asistencia"
            onClick={abrirFormulario}
          >
            {mostrarForm ? '✕ Cerrar' : '＋ Registrar Asistencia'}
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="asistencias-kpis">
        <div className="kpi-asist kpi-presentes">
          <span className="kpi-num">{presentes}</span>
          <span className="kpi-lbl">✅ Presentes</span>
        </div>
        <div className="kpi-asist kpi-ausentes">
          <span className="kpi-num">{ausentes}</span>
          <span className="kpi-lbl">❌ Ausentes</span>
        </div>
        <div className="kpi-asist kpi-pct">
          <span className="kpi-num">{pct}%</span>
          <span className="kpi-lbl">📊 Asistencia</span>
        </div>
        <div className="kpi-asist kpi-total">
          <span className="kpi-num">{filtradas.length}</span>
          <span className="kpi-lbl">📁 Total registros</span>
        </div>
      </div>

      {/* FORMULARIO DESLIZANTE (solo Profesor) */}
      {esProfesor && mostrarForm && (
        <div className="asistencia-form-panel">
          {!cursoConfirmado ? (
            <div className="curso-selector-panel">
              <h3>📚 Seleccionar Curso</h3>
              <p className="curso-selector-subtitle">
                Primero elige el curso al que deseas registrar la asistencia.
              </p>

              <div className="form-group">
                <label htmlFor="curso">Curso *</label>
                <select
                  id="curso"
                  name="curso"
                  className="curso-select"
                  value={cursoSeleccionado}
                  onChange={(e) => setCursoSeleccionado(e.target.value)}
                  disabled={cargandoCursos}
                >
                  <option value="">Selecciona un curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id ?? curso.titulo} value={curso.titulo || ''}>
                      {curso.titulo || 'Sin titulo'}
                    </option>
                  ))}
                </select>
                {errorCursos && <span className="error-field">{errorCursos}</span>}
                {errorEstudiantes && <span className="error-field">{errorEstudiantes}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-submit"
                  onClick={confirmarCurso}
                  disabled={cargandoCursos || cargandoEstudiantes || cursos.length === 0}
                >
                  {(cargandoCursos || cargandoEstudiantes)
                    ? 'Cargando...'
                    : 'Continuar'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setMostrarForm(false);
                    setCursoConfirmado(false);
                    setErrorCursos('');
                    setErrorEstudiantes('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3>📝 Nueva Asistencia</h3>
              <p className="curso-resumen">
                Curso seleccionado: <strong>{cursoSeleccionado}</strong>
                <button
                  type="button"
                  className="btn-cambiar-curso"
                  onClick={() => {
                    setCursoConfirmado(false);
                    setErrorEstudiantes('');
                    setForm(prev => ({
                      ...prev,
                      nombrePersona: '',
                      correoPersona: '',
                      tieneExcusa: false,
                      excusa: '',
                    }));
                  }}
                >
                  Cambiar
                </button>
              </p>

              {msgForm && (
                <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
                  {msgForm}
                </div>
              )}

              <form onSubmit={handleSubmit} className="asistencia-form">
                <div className="form-grid-asist">

              <div className="form-group">
                <label htmlFor="nombrePersona">Nombre de la Persona *</label>
                <select
                  id="nombrePersona"
                  name="correoPersona"
                  className="curso-select"
                  value={form.correoPersona}
                  onChange={(e) => {
                    const correoSeleccionado = e.target.value;
                    const estudiante = estudiantes.find(
                      (est) => obtenerCorreoEstudiante(est) === correoSeleccionado
                    );

                    setForm(prev => ({
                      ...prev,
                      correoPersona: correoSeleccionado,
                      nombrePersona: estudiante?.nombre || '',
                    }));
                  }}
                  disabled={cargandoEstudiantes || estudiantes.length === 0}
                >
                  <option value="">Selecciona un estudiante</option>
                  {estudiantes.map((est) => (
                    <option
                      key={est.id ?? obtenerCorreoEstudiante(est) ?? est.nombre}
                      value={obtenerCorreoEstudiante(est)}
                    >
                      {(est.nombre || 'Sin nombre')}
                      {obtenerCorreoEstudiante(est) ? ` (${obtenerCorreoEstudiante(est)})` : ''}
                    </option>
                  ))}
                </select>
                {form.correoPersona && (
                  <small className="correo-seleccionado">
                    Correo seleccionado: {form.correoPersona}
                  </small>
                )}
                {errForm.nombrePersona && (
                  <span className="error-field">{errForm.nombrePersona}</span>
                )}
                {errorEstudiantes && (
                  <span className="error-field">{errorEstudiantes}</span>
                )}
              </div>

                  <div className="form-group">
                    <label htmlFor="fecha">Fecha *</label>
                    <input id="fecha" name="fecha" type="date"
                      value={form.fecha} onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]} />
                    {errForm.fecha && (
                      <span className="error-field">{errForm.fecha}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="horaEntrada">Hora de Entrada *</label>
                    <input id="horaEntrada" name="horaEntrada" type="time"
                      value={form.horaEntrada} onChange={handleChange} />
                    {errForm.horaEntrada && (
                      <span className="error-field">{errForm.horaEntrada}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="asistio">Estado de Asistencia *</label>
                    <select
                      id="asistio"
                      name="asistio"
                      className="curso-select"
                      value={form.asistio ? 'true' : 'false'}
                      onChange={(e) => {
                        const asistio = e.target.value === 'true';
                        setForm(prev => ({
                          ...prev,
                          asistio,
                          tieneExcusa: asistio ? false : prev.tieneExcusa,
                          excusa: asistio ? '' : prev.excusa,
                        }));
                      }}
                    >
                      <option value="true">✅ Asistió</option>
                      <option value="false">❌ No asistió</option>
                    </select>
                  </div>

                  {!form.asistio && (
                    <div className="form-group">
                      <label htmlFor="tieneExcusa">Tiene excusa *</label>
                      <select
                        id="tieneExcusa"
                        name="tieneExcusa"
                        className="curso-select"
                        value={form.tieneExcusa ? 'true' : 'false'}
                        onChange={(e) => {
                          const tieneExcusa = e.target.value === 'true';
                          setForm(prev => ({
                            ...prev,
                            tieneExcusa,
                            excusa: tieneExcusa ? prev.excusa : '',
                          }));
                        }}
                      >
                        <option value="false">No tiene excusa</option>
                        <option value="true">Si tiene excusa</option>
                      </select>
                    </div>
                  )}

                  {!form.asistio && form.tieneExcusa && (
                    <div className="form-group">
                      <label htmlFor="excusa">Excusa *</label>
                      <textarea
                        id="excusa"
                        name="excusa"
                        rows="3"
                        value={form.excusa}
                        onChange={handleChange}
                        placeholder="Describe la excusa del estudiante"
                      />
                      {errForm.excusa && (
                        <span className="error-field">{errForm.excusa}</span>
                      )}
                    </div>
                  )}

                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={guardando}>
                    {guardando ? '⏳ Guardando...' : '💾 Guardar Asistencia'}
                  </button>
                  <button type="button" className="btn-cancel"
                    onClick={() => {
                      setMostrarForm(false);
                      setErrForm({});
                      setMsgForm('');
                      setCursoConfirmado(false);
                      setErrorEstudiantes('');
                      setForm(FORM_INICIAL);
                    }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* BUSCADOR + EXPORTAR */}
      <div className="asistencias-toolbar">
        <span className="filtros-label">Filtros:</span>
        {esProfesor && (
          <select
            className="curso-select filtro-select-sm"
            value={filtroModoEstudianteProfesor}
            onChange={(e) => {
              const modo = e.target.value;
              setFiltroModoEstudianteProfesor(modo);
              if (modo === 'todos') setFiltroEstudianteProfesor('todos');
            }}
          >
            <option value="todos">Todos los estudiantes</option>
            <option value="especifico">Estudiante especifico</option>
          </select>
        )}
        {esProfesor && filtroModoEstudianteProfesor === 'especifico' && (
          <select
            className="curso-select filtro-select-sm"
            value={filtroEstudianteProfesor}
            onChange={(e) => setFiltroEstudianteProfesor(e.target.value)}
          >
            <option value="todos">Selecciona un estudiante</option>
            {estudiantesFiltroProfesor.map(nombre => (
              <option key={nombre} value={nombre}>
                {nombre === 'sin-nombre' ? 'Sin nombre' : nombre}
              </option>
            ))}
          </select>
        )}
        <select
          className="curso-select filtro-select-sm"
          value={filtroCurso}
          onChange={(e) => setFiltroCurso(e.target.value)}
        >
          <option value="todos">Todos los cursos</option>
          {cursosFiltro.map(curso => (
            <option key={curso} value={curso}>
              {curso === 'sin-curso' ? 'Sin curso asignado' : curso}
            </option>
          ))}
        </select>
        <select
          className="curso-select filtro-select-sm"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="asistio">Asistió</option>
          <option value="ausente">No asistió</option>
        </select>
        <input
          className="asistencias-search"
          placeholder="🔍 Buscar por nombre, correo, curso, fecha o excusa..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {filtradas.length > 0 && (
          <div className="export-buttons">
            <button className="btn-export csv" onClick={handleExportCSV}>
              📄 CSV
            </button>
            <button className="btn-export pdf" onClick={handleExportPDF}>
              🖨️ PDF
            </button>
          </div>
        )}
      </div>

      {error && <div className="asistencias-error">{error}</div>}

      {esProfesor && editando && editForm && (
        <div className="asistencia-edit-panel">
          <h3>✏️ Editar Asistencia #{editForm.id}</h3>
          {msgEdicion && <div className="message-alert message-error">{msgEdicion}</div>}
          <div className="form-grid-asist">
            <div className="form-group">
              <label htmlFor="editCurso">Curso</label>
              <select
                id="editCurso"
                className="curso-select"
                value={editForm.tituloCurso || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, tituloCurso: e.target.value }))}
              >
                <option value="">Sin curso asignado</option>
                {cursos.map(curso => (
                  <option key={curso.id ?? curso.titulo} value={curso.titulo || ''}>
                    {curso.titulo || 'Sin titulo'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="editFecha">Fecha</label>
              <input
                id="editFecha"
                type="date"
                value={editForm.fecha || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editHora">Hora Entrada</label>
              <input
                id="editHora"
                type="time"
                value={editForm.horaEntrada || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, horaEntrada: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editEstado">Estado</label>
              <select
                id="editEstado"
                className="curso-select"
                value={editForm.asistio ? 'true' : 'false'}
                onChange={(e) => {
                  const asistio = e.target.value === 'true';
                  setEditForm(prev => ({
                    ...prev,
                    asistio,
                    tieneExcusa: asistio ? false : prev.tieneExcusa,
                    excusa: asistio ? '' : prev.excusa,
                  }));
                }}
              >
                <option value="true">✅ Asistió</option>
                <option value="false">❌ No asistió</option>
              </select>
            </div>
            {!editForm.asistio && (
              <div className="form-group">
                <label htmlFor="editExcusaFlag">Tiene excusa</label>
                <select
                  id="editExcusaFlag"
                  className="curso-select"
                  value={editForm.tieneExcusa ? 'true' : 'false'}
                  onChange={(e) => {
                    const tieneExcusa = e.target.value === 'true';
                    setEditForm(prev => ({
                      ...prev,
                      tieneExcusa,
                      excusa: tieneExcusa ? prev.excusa : '',
                    }));
                  }}
                >
                  <option value="false">No</option>
                  <option value="true">Si</option>
                </select>
              </div>
            )}
            {!editForm.asistio && editForm.tieneExcusa && (
              <div className="form-group">
                <label htmlFor="editExcusa">Excusa</label>
                <textarea
                  id="editExcusa"
                  rows="2"
                  value={editForm.excusa || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, excusa: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-submit" onClick={guardarEdicion} disabled={guardandoEdicion}>
              {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-cancel" onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* TABLA */}
      {!error && (
        <div className="asistencias-tabla-wrap">
          {filtradas.length === 0 ? (
            <div className="asistencias-vacio">
              <span>📭</span>
              <p>No se encontraron registros de asistencia.</p>
            </div>
          ) : (
            <table className="asistencias-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Curso</th>
                  <th>Profesor</th>
                  <th>Fecha</th>
                  <th>Hora Entrada</th>
                  <th>Estado</th>
                  <th>Excusa</th>
                  {esProfesor && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(a => (
                  <tr key={a.id} className={a.asistio ? 'fila-presente' : 'fila-ausente'}>
                    <td className="td-id">{a.id ?? '-'}</td>
                    <td className="td-nombre">{a.nombrePersona}</td>
                    <td className="td-correo">{a.correoPersona || '-'}</td>
                    <td>{a.tituloCurso || '-'}</td>
                    <td>{obtenerProfesorRegistro(a) || '-'}</td>
                    <td>{a.fecha}</td>
                    <td>{a.horaEntrada}</td>
                    <td>
                      <span className={`badge-asistencia ${a.asistio ? 'badge-presente' : 'badge-ausente'}`}>
                        {a.asistio ? '✅ Presente' : '❌ Ausente'}
                      </span>
                    </td>
                    <td>
                      {a.asistio ? '-' : (
                        a.tieneExcusa
                          ? <span className="badge-excusa" title={a.excusa || ''}>{a.excusa || 'Con excusa'}</span>
                          : <span className="badge-sin-excusa">Sin excusa</span>
                      )}
                    </td>
                    {esProfesor && (
                      <td>
                        <button
                          type="button"
                          className="btn-row-edit"
                          onClick={() => iniciarEdicion(a)}
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}

export default ListaAsistencias;



