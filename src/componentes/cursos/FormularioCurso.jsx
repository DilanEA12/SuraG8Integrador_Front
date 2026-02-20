// ====================================
// FORMULARIO CURSO - UNIFICADO
// Sirve para CREAR y EDITAR
// Solo accesible para rol Profesor
// ====================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cursoService } from '../../services/cursoService';
import './Cursos.css';

const FORM_INICIAL = {
  titulo:             '',
  descripcion:        '',
  maestro:            '',
  tipoCurso:          '',
  duracion:           '',
  intensidad:         '',
  capitulosCurso:     '',
  estudiantes:        '',
  calificacion:       '',
  presencialidad:     true,
  lugarRealizacion:   '',
  fechaCreacion:      '',
  fechaFinalizacion:  '',
  comentarios:        '',
};

function FormularioCurso() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const modoEdicion = Boolean(id);

  const [formData,     setFormData]     = useState(FORM_INICIAL);
  const [mensaje,      setMensaje]      = useState('');
  const [tipoMsg,      setTipoMsg]      = useState('');
  const [cargando,     setCargando]     = useState(false);
  const [cargandoCurso, setCargandoCurso] = useState(modoEdicion);

  // En modo edición carga los datos del curso
  useEffect(() => {
    if (!modoEdicion) return;
    const cargar = async () => {
      try {
        const c = await cursoService.buscarPorId(id);
        setFormData({
          titulo:            c.titulo            || '',
          descripcion:       c.descripcion       || '',
          maestro:           c.maestro           || '',
          tipoCurso:         c.tipoCurso         || '',
          duracion:          c.duracion          != null ? String(c.duracion) : '',
          intensidad:        c.intensidad        != null ? String(c.intensidad) : '',
          capitulosCurso:    c.capitulosCurso    != null ? String(c.capitulosCurso) : '',
          estudiantes:       c.estudiantes       != null ? String(c.estudiantes) : '',
          calificacion:      c.calificacion      != null ? String(c.calificacion) : '',
          presencialidad:    c.presencialidad    !== false,
          lugarRealizacion:  c.lugarRealizacion  != null ? String(c.lugarRealizacion) : '',
          fechaCreacion:     c.fechaCreacion     || '',
          fechaFinalizacion: c.fechaFinalizacion || '',
          comentarios:       c.comentarios       || '',
          id:                c.id,
        });
      } catch {
        setMensaje('No se pudo cargar el curso. Verifica el backend.');
        setTipoMsg('error');
      } finally {
        setCargandoCurso(false);
      }
    };
    cargar();
  }, [id, modoEdicion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validar = () => {
    if (!formData.titulo.trim()) return 'El título del curso es obligatorio.';
    if (!formData.maestro.trim()) return 'El nombre del maestro es obligatorio.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorVal = validar();
    if (errorVal) { setMensaje(errorVal); setTipoMsg('error'); return; }

    setCargando(true);
    setMensaje('');

    // Construye el objeto respetando los tipos de Curso.java
    const datos = {
      ...(modoEdicion && formData.id ? { id: formData.id } : {}),
      titulo:            formData.titulo,
      descripcion:       formData.descripcion   || null,
      maestro:           formData.maestro,
      tipoCurso:         formData.tipoCurso     || null,
      duracion:          formData.duracion      ? parseFloat(formData.duracion)    : null,
      intensidad:        formData.intensidad    ? parseInt(formData.intensidad)    : null,
      capitulosCurso:    formData.capitulosCurso ? parseInt(formData.capitulosCurso) : null,
      estudiantes:       formData.estudiantes   ? parseInt(formData.estudiantes)  : null,
      calificacion:      formData.calificacion  ? parseFloat(formData.calificacion) : null,
      presencialidad:    formData.presencialidad,
      lugarRealizacion:  formData.lugarRealizacion ? parseInt(formData.lugarRealizacion) : null,
      fechaCreacion:     formData.fechaCreacion     || null,
      fechaFinalizacion: formData.fechaFinalizacion || null,
      comentarios:       formData.comentarios   || null,
    };

    try {
      if (modoEdicion) {
        await cursoService.actualizar(datos);
        setMensaje('¡Curso actualizado exitosamente!');
      } else {
        await cursoService.crear(datos);
        setMensaje('¡Curso creado exitosamente!');
      }
      setTipoMsg('exito');
      setTimeout(() => navigate('/cursos'), 1800);
    } catch (err) {
      setMensaje(err.message || 'Error al conectar con el backend. Verifica que esté corriendo en el puerto 8080.');
      setTipoMsg('error');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoCurso) return (
    <div className="cursos-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando datos del curso...</p>
      </div>
    </div>
  );

  return (
    <div className="cursos-container">
      <div className="curso-form-wrapper">

        {/* ENCABEZADO */}
        <div className="curso-form-header">
          <h3>{modoEdicion ? '✏️ Editar Curso' : '➕ Nuevo Curso'}</h3>
          <p>{modoEdicion ? 'Modifica la información del curso.' : 'Completa los datos del nuevo curso.'}</p>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="curso-form">

          {/* ═══ INFORMACIÓN BÁSICA ═══ */}
          <fieldset>
            <legend>📖 Información Básica</legend>

            <div className="form-group">
              <label htmlFor="titulo">Título del Curso *</label>
              <input id="titulo" name="titulo"
                value={formData.titulo} onChange={handleChange}
                placeholder="Ej: Introducción a la Programación" />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" name="descripcion" rows="3"
                value={formData.descripcion} onChange={handleChange}
                placeholder="Describe el contenido y objetivos del curso..." />
            </div>

            <div className="form-group">
              <label htmlFor="maestro">Maestro / Docente *</label>
              <input id="maestro" name="maestro"
                value={formData.maestro} onChange={handleChange}
                placeholder="Nombre del docente responsable" />
            </div>

            <div className="form-group">
              <label htmlFor="tipoCurso">Tipo de Curso</label>
              <select id="tipoCurso" name="tipoCurso"
                value={formData.tipoCurso} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="Teórico">Teórico</option>
                <option value="Práctico">Práctico</option>
                <option value="Teórico-Práctico">Teórico-Práctico</option>
                <option value="Taller">Taller</option>
                <option value="Seminario">Seminario</option>
                <option value="Electiva">Electiva</option>
              </select>
            </div>

            {/* Toggle presencialidad */}
            <div className="form-group-checkbox curso-presencialidad">
              <input id="presencialidad" name="presencialidad" type="checkbox"
                checked={formData.presencialidad} onChange={handleChange} />
              <label htmlFor="presencialidad">
                {formData.presencialidad ? '🏫 Presencial' : '💻 Virtual'}
              </label>
            </div>
          </fieldset>

          {/* ═══ DETALLES ACADÉMICOS ═══ */}
          <fieldset>
            <legend>📊 Detalles Académicos</legend>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="duracion">Duración (horas)</label>
                <input id="duracion" name="duracion" type="number" min="0" step="0.5"
                  value={formData.duracion} onChange={handleChange}
                  placeholder="Ej: 120" />
              </div>

              <div className="form-group">
                <label htmlFor="intensidad">Intensidad (hrs/semana)</label>
                <input id="intensidad" name="intensidad" type="number" min="0"
                  value={formData.intensidad} onChange={handleChange}
                  placeholder="Ej: 8" />
              </div>

              <div className="form-group">
                <label htmlFor="capitulosCurso">Capítulos / Módulos</label>
                <input id="capitulosCurso" name="capitulosCurso" type="number" min="0"
                  value={formData.capitulosCurso} onChange={handleChange}
                  placeholder="Ej: 12" />
              </div>

              <div className="form-group">
                <label htmlFor="estudiantes">N° de Estudiantes</label>
                <input id="estudiantes" name="estudiantes" type="number" min="0"
                  value={formData.estudiantes} onChange={handleChange}
                  placeholder="Ej: 30" />
              </div>

              <div className="form-group">
                <label htmlFor="calificacion">Calificación (0 – 5)</label>
                <input id="calificacion" name="calificacion" type="number"
                  min="0" max="5" step="0.1"
                  value={formData.calificacion} onChange={handleChange}
                  placeholder="Ej: 4.5" />
              </div>

              <div className="form-group">
                <label htmlFor="lugarRealizacion">Lugar de Realización (ID)</label>
                <input id="lugarRealizacion" name="lugarRealizacion" type="number" min="0"
                  value={formData.lugarRealizacion} onChange={handleChange}
                  placeholder="ID del lugar" />
              </div>
            </div>
          </fieldset>

          {/* ═══ FECHAS ═══ */}
          <fieldset>
            <legend>📅 Fechas</legend>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="fechaCreacion">Fecha de Inicio</label>
                <input id="fechaCreacion" name="fechaCreacion" type="date"
                  value={formData.fechaCreacion} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="fechaFinalizacion">Fecha de Finalización</label>
                <input id="fechaFinalizacion" name="fechaFinalizacion" type="date"
                  value={formData.fechaFinalizacion} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* ═══ NOTAS ADICIONALES ═══ */}
          <fieldset>
            <legend>💬 Comentarios Adicionales</legend>
            <div className="form-group">
              <textarea id="comentarios" name="comentarios" rows="3"
                value={formData.comentarios} onChange={handleChange}
                placeholder="Observaciones, requisitos previos, materiales necesarios..." />
            </div>
          </fieldset>

          {/* BOTONES */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando
                ? '⏳ Guardando...'
                : modoEdicion ? '💾 Actualizar Curso' : '➕ Crear Curso'}
            </button>
            <button type="button" className="btn-cancel"
              onClick={() => navigate('/cursos')} disabled={cargando}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormularioCurso;
