// ====================================
// FORMULARIO MATRÍCULA
// Convertido de Next.js/TypeScript/shadcn → React JSX puro
// Campos: nombre, documento, correo, fechaMatricula, valorMatricula
// Modo dual: crear (sin id) / editar (id en useParams)
// Solo accesible para Profesor (RutaSoloProfesor en App.jsx)
// ====================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matriculaService } from '../../services/matriculaService';
import './Matricula.css';

const FORM_INICIAL = {
  nombre:          '',
  documento:       '',
  correo:          '',
  fechaMatricula:  '',
  valorMatricula:  '',
};

function FormularioMatricula() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const modoEdicion = Boolean(id);

  const [form,      setForm]      = useState(FORM_INICIAL);
  const [errores,   setErrores]   = useState({});
  const [guardando, setGuardando] = useState(false);
  const [cargando,  setCargando]  = useState(modoEdicion);
  const [mensaje,   setMensaje]   = useState('');
  const [tipoMsg,   setTipoMsg]   = useState('');
  const [enviado,   setEnviado]   = useState(false);

  // En modo edición, cargar los datos existentes
  useEffect(() => {
    if (!modoEdicion) return;
    const cargar = async () => {
      try {
        const data = await matriculaService.buscarPorId(id);
        setForm({
          nombre:         data.nombre         || '',
          documento:      data.documento      || '',
          correo:         data.correo         || '',
          // LocalDate viene como array [2026, 2, 15] o como string "2026-02-15"
          fechaMatricula: Array.isArray(data.fechaMatricula)
            ? `${data.fechaMatricula[0]}-${String(data.fechaMatricula[1]).padStart(2,'0')}-${String(data.fechaMatricula[2]).padStart(2,'0')}`
            : (data.fechaMatricula || ''),
          valorMatricula: data.valorMatricula != null ? String(data.valorMatricula) : '',
        });
      } catch {
        setMensaje('No se pudo cargar la matrícula. Verifica el ID.');
        setTipoMsg('error');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, modoEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim())
      errs.nombre = 'El nombre es obligatorio';
    if (!form.documento.trim())
      errs.documento = 'El documento es obligatorio';
    if (!form.correo.trim())
      errs.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      errs.correo = 'Ingresa un correo válido';
    if (!form.fechaMatricula)
      errs.fechaMatricula = 'La fecha de matrícula es obligatoria';
    if (!form.valorMatricula || isNaN(parseFloat(form.valorMatricula)))
      errs.valorMatricula = 'Ingresa un valor numérico válido';
    else if (parseFloat(form.valorMatricula) < 0)
      errs.valorMatricula = 'El valor no puede ser negativo';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    setGuardando(true);
    setMensaje('');

    const payload = {
      ...(modoEdicion ? { id: parseInt(id) } : {}),
      nombre:         form.nombre.trim(),
      documento:      form.documento.trim(),
      correo:         form.correo.trim(),
      fechaMatricula: form.fechaMatricula,          // String "yyyy-MM-dd" → Jackson lo convierte a LocalDate
      valorMatricula: parseFloat(form.valorMatricula),
    };

    try {
      await matriculaService.guardar(payload);
      setMensaje(modoEdicion
        ? '¡Matrícula actualizada correctamente!'
        : '¡Matrícula registrada exitosamente!');
      setTipoMsg('exito');
      setEnviado(true);
      // Mostrar resumen y redirigir tras 2 segundos
      setTimeout(() => navigate('/matricula'), 2200);
    } catch (err) {
      setMensaje(err.message || 'Error al conectar con el backend.');
      setTipoMsg('error');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return (
    <div className="matricula-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando datos de la matrícula...</p>
      </div>
    </div>
  );

  return (
    <div className="matricula-container">

      {/* ENCABEZADO */}
      <div className="matricula-header">
        <div>
          <h2>{modoEdicion ? '✏️ Editar Matrícula' : '🏫 Nueva Matrícula'}</h2>
          <p className="matricula-subtitulo">
            {modoEdicion
              ? 'Modifica los datos del registro seleccionado'
              : 'Completa los datos para registrar una nueva matrícula'}
          </p>
        </div>
        <button
          className="btn-volver"
          onClick={() => navigate('/matricula')}
        >
          ← Volver a la lista
        </button>
      </div>

      {/* ALERTA DE MENSAJE */}
      {mensaje && (
        <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
          {mensaje}
        </div>
      )}

      {/* TARJETA DEL FORMULARIO */}
      <div className="form-matricula-card">

        <div className="form-matricula-card-header">
          <h3>
            {modoEdicion ? '📝 Datos a modificar' : '📝 Datos del estudiante'}
          </h3>
          <p>Los campos marcados con <span className="asterisco">*</span> son obligatorios</p>
        </div>

        <form onSubmit={handleSubmit} className="form-matricula">

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre Completo <span className="asterisco">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: María Fernanda López"
              className={errores.nombre ? 'input-error' : ''}
              disabled={enviado}
            />
            {errores.nombre && <span className="error-field">{errores.nombre}</span>}
          </div>

          {/* Documento */}
          <div className="form-group">
            <label htmlFor="documento">
              Documento de Identidad <span className="asterisco">*</span>
            </label>
            <input
              id="documento"
              name="documento"
              type="text"
              value={form.documento}
              onChange={handleChange}
              placeholder="Ej: 1023456789"
              className={errores.documento ? 'input-error' : ''}
              disabled={enviado}
            />
            {errores.documento && <span className="error-field">{errores.documento}</span>}
          </div>

          {/* Correo */}
          <div className="form-group">
            <label htmlFor="correo">
              Correo Electrónico <span className="asterisco">*</span>
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className={errores.correo ? 'input-error' : ''}
              disabled={enviado}
            />
            {errores.correo && <span className="error-field">{errores.correo}</span>}
          </div>

          {/* Grid de 2 columnas para fecha y valor */}
          <div className="form-grid-2">

            {/* Fecha de matrícula */}
            {/* Reemplaza el Popover + Calendar de shadcn/ui
                con un <input type="date"> nativo — mismo resultado */}
            <div className="form-group">
              <label htmlFor="fechaMatricula">
                Fecha de Matrícula <span className="asterisco">*</span>
              </label>
              <input
                id="fechaMatricula"
                name="fechaMatricula"
                type="date"
                value={form.fechaMatricula}
                onChange={handleChange}
                className={errores.fechaMatricula ? 'input-error' : ''}
                disabled={enviado}
              />
              {errores.fechaMatricula && (
                <span className="error-field">{errores.fechaMatricula}</span>
              )}
            </div>

            {/* Valor de matrícula */}
            <div className="form-group">
              <label htmlFor="valorMatricula">
                Valor de Matrícula <span className="asterisco">*</span>
              </label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">$</span>
                <input
                  id="valorMatricula"
                  name="valorMatricula"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valorMatricula}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`input-with-prefix ${errores.valorMatricula ? 'input-error' : ''}`}
                  disabled={enviado}
                />
              </div>
              {errores.valorMatricula && (
                <span className="error-field">{errores.valorMatricula}</span>
              )}
            </div>

          </div>

          {/* RESUMEN POST-ENVÍO (equivale al bloque <pre> del page.tsx) */}
          {enviado && (
            <div className="matricula-resumen">
              <h4>✅ Datos registrados:</h4>
              <div className="resumen-grid">
                <FilaResumen label="Nombre"          valor={form.nombre} />
                <FilaResumen label="Documento"       valor={form.documento} />
                <FilaResumen label="Correo"          valor={form.correo} />
                <FilaResumen label="Fecha"           valor={form.fechaMatricula} />
                <FilaResumen
                  label="Valor"
                  valor={new Intl.NumberFormat('es-CO', {
                    style: 'currency', currency: 'COP', minimumFractionDigits: 0
                  }).format(parseFloat(form.valorMatricula) || 0)}
                />
              </div>
              <p className="resumen-redireccion">Redirigiendo a la lista...</p>
            </div>
          )}

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="submit"
              className={`btn-submit ${enviado ? 'btn-submit-exito' : ''}`}
              disabled={guardando || enviado}
            >
              {enviado
                ? '✅ Enviado correctamente'
                : guardando
                  ? '⏳ Guardando...'
                  : modoEdicion
                    ? '💾 Actualizar Matrícula'
                    : '🏫 Registrar Matrícula'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/matricula')}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Componente auxiliar para el resumen
function FilaResumen({ label, valor }) {
  return (
    <div className="resumen-fila">
      <span className="resumen-label">{label}:</span>
      <span className="resumen-valor">{valor}</span>
    </div>
  );
}

export default FormularioMatricula;
