// ====================================
// LISTA ASISTENCIAS - UNIFICADA
// Profesor: ve todo + puede registrar nuevas asistencias
// Estudiante: ve registros filtrados por su nombre
// ====================================

import { useState, useEffect } from 'react';
import { asistenciaService } from '../../services/asistenciaService';
import { exportarAsistenciasCSV, exportarAsistenciasPDF } from '../../utils/exportAsistencias';
import './Asistencias.css';

const FORM_INICIAL = {
  nombrePersona: '',
  fecha:         new Date().toISOString().split('T')[0],
  horaEntrada:   new Date().toTimeString().slice(0, 5),
  asistio:       true,
};

function ListaAsistencias() {
  const usuario    = JSON.parse(localStorage.getItem('usuario'));
  const esProfesor = usuario?.rol === 'Profesor';

  const [asistencias, setAsistencias] = useState([]);
  const [filtradas,   setFiltradas]   = useState([]);
  const [busqueda,    setBusqueda]    = useState('');
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');

  // Formulario (solo Profesor)
  const [form,      setForm]      = useState(FORM_INICIAL);
  const [errForm,   setErrForm]   = useState({});
  const [guardando, setGuardando] = useState(false);
  const [msgForm,   setMsgForm]   = useState('');
  const [tipoMsg,   setTipoMsg]   = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    const q = busqueda.toLowerCase();
    setFiltradas(
      asistencias.filter(a =>
        (a.nombrePersona || '').toLowerCase().includes(q) ||
        (a.fecha         || '').includes(q) ||
        String(a.id      || '').includes(q)
      )
    );
  }, [busqueda, asistencias]);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      let data = await asistenciaService.listarTodas();
      // Estudiante solo ve sus propios registros (filtra por su nombre)
      if (!esProfesor && usuario?.nombre) {
        data = data.filter(a =>
          (a.nombrePersona || '').toLowerCase().includes(usuario.nombre.toLowerCase())
        );
      }
      setAsistencias(data);
      setFiltradas(data);
    } catch {
      setError('No se pudieron cargar las asistencias. Verifica que el backend esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  // ── Formulario ──────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validar = () => {
    const errs = {};
    if (!form.nombrePersona.trim()) errs.nombrePersona = 'El nombre es obligatorio';
    if (!form.fecha)                errs.fecha         = 'La fecha es obligatoria';
    if (!form.horaEntrada)          errs.horaEntrada   = 'La hora es obligatoria';
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
      await asistenciaService.crear(form);
      setMsgForm('¡Asistencia registrada exitosamente!');
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

  // ── Exportar ─────────────────────────────────
  const handleExportCSV = () => {
    const datos = filtradas.map(a => ({
      estudianteNombre: a.nombrePersona,
      materiaNombre:    '—',
      estado:           a.asistio ? 'Presente' : 'Ausente',
      fecha:            a.fecha,
    }));
    exportarAsistenciasCSV(datos);
  };

  const handleExportPDF = () => {
    const datos = filtradas.map(a => ({
      estudianteNombre: a.nombrePersona,
      materiaNombre:    '—',
      estado:           a.asistio ? 'Presente' : 'Ausente',
      fecha:            a.fecha,
    }));
    exportarAsistenciasPDF(datos);
  };

  // ── Render ───────────────────────────────────
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
            onClick={() => setMostrarForm(!mostrarForm)}
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
          <h3>📝 Nueva Asistencia</h3>

          {msgForm && (
            <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
              {msgForm}
            </div>
          )}

          <form onSubmit={handleSubmit} className="asistencia-form">
            <div className="form-grid-asist">

              <div className="form-group">
                <label htmlFor="nombrePersona">Nombre de la Persona *</label>
                <input id="nombrePersona" name="nombrePersona"
                  value={form.nombrePersona} onChange={handleChange}
                  placeholder="Nombre completo" />
                {errForm.nombrePersona && (
                  <span className="error-field">{errForm.nombrePersona}</span>
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

              <div className="form-group-checkbox asist-checkbox">
                <input id="asistio" name="asistio" type="checkbox"
                  checked={form.asistio} onChange={handleChange} />
                <label htmlFor="asistio">
                  {form.asistio ? '✅ Asistió' : '❌ No asistió'}
                </label>
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={guardando}>
                {guardando ? '⏳ Guardando...' : '💾 Guardar Asistencia'}
              </button>
              <button type="button" className="btn-cancel"
                onClick={() => { setMostrarForm(false); setErrForm({}); setMsgForm(''); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BUSCADOR + EXPORTAR */}
      <div className="asistencias-toolbar">
        <input
          className="asistencias-search"
          placeholder="🔍 Buscar por nombre o fecha..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {esProfesor && filtradas.length > 0 && (
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
                  <th>Fecha</th>
                  <th>Hora Entrada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(a => (
                  <tr key={a.id} className={a.asistio ? 'fila-presente' : 'fila-ausente'}>
                    <td className="td-id">{a.id ?? '—'}</td>
                    <td className="td-nombre">{a.nombrePersona}</td>
                    <td>{a.fecha}</td>
                    <td>{a.horaEntrada}</td>
                    <td>
                      <span className={`badge-asistencia ${a.asistio ? 'badge-presente' : 'badge-ausente'}`}>
                        {a.asistio ? '✅ Presente' : '❌ Ausente'}
                      </span>
                    </td>
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
