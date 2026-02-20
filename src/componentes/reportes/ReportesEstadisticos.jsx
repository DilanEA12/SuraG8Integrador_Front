// ====================================
// REPORTES ESTADÍSTICOS - UNIFICADO
// Fusiona ReporAcademicos + ReporAdministrativos
// Solo accesible para rol Profesor
// Conectado al backend via reporteService
// ====================================

import { useState, useEffect } from 'react';
import { reporteService } from '../../services/reporteService';
import './Reportes.css';

// ── Helpers ──────────────────────────────────
function valorO(val, sufijo = '') {
  if (val === null || val === undefined || val === '') return '—';
  return `${val}${sufijo}`;
}

function porcentajeBarra(val, max = 5) {
  if (!val) return 0;
  return Math.min(100, (Number(val) / max) * 100);
}

// ── Componente principal ──────────────────────
function ReportesEstadisticos() {
  const [pestana,    setPestana]    = useState('academico'); // 'academico' | 'administrativo'
  const [reportes,   setReportes]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoForm,   setModoForm]   = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await reporteService.listarTodos();
      setReportes(data);
    } catch {
      setError('No se pudieron cargar los reportes. Verifica que el backend esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  const academicos      = reportes.filter(r => r.tipoReporte === 'ACADEMICO'      || !r.tipoReporte);
  const administrativos = reportes.filter(r => r.tipoReporte === 'ADMINISTRATIVO');
  const listaMostrada   = pestana === 'academico' ? academicos : administrativos;

  if (cargando) return (
    <div className="reportes-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando reportes...</p>
      </div>
    </div>
  );

  return (
    <div className="reportes-container">

      {/* ENCABEZADO */}
      <div className="reportes-header">
        <div>
          <h2>📊 Reportes Estadísticos</h2>
          <p className="reportes-subtitulo">
            Panel de gestión exclusivo para docentes
          </p>
        </div>
        <button
          className="btn-nuevo-reporte"
          onClick={() => { setSeleccionado(null); setModoForm(true); }}
        >
          ＋ Nuevo Reporte
        </button>
      </div>

      {/* PESTAÑAS */}
      <div className="reportes-tabs">
        <button
          className={`tab-btn ${pestana === 'academico' ? 'tab-activo' : ''}`}
          onClick={() => setPestana('academico')}
        >
          🎓 Académicos
          <span className="tab-badge">{academicos.length}</span>
        </button>
        <button
          className={`tab-btn ${pestana === 'administrativo' ? 'tab-activo' : ''}`}
          onClick={() => setPestana('administrativo')}
        >
          📄 Administrativos
          <span className="tab-badge">{administrativos.length}</span>
        </button>
      </div>

      {error && <div className="reportes-error">{error}</div>}

      {/* RESUMEN ESTADÍSTICO (tarjetas KPI) */}
      {listaMostrada.length > 0 && (
        <div className="kpi-grid">
          {pestana === 'academico' ? (
            <KpisAcademicos reportes={academicos} />
          ) : (
            <KpisAdministrativos reportes={administrativos} />
          )}
        </div>
      )}

      {/* LISTA DE REPORTES */}
      {listaMostrada.length === 0 && !error ? (
        <div className="reportes-vacio">
          <span className="reportes-vacio-icono">📭</span>
          <p>No hay reportes {pestana === 'academico' ? 'académicos' : 'administrativos'} registrados.</p>
          <button className="btn-nuevo-reporte-vacio"
            onClick={() => { setSeleccionado(null); setModoForm(true); }}>
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="reportes-lista">
          <h3 className="lista-titulo">
            {pestana === 'academico' ? '📋 Detalle de Reportes Académicos' : '📋 Detalle de Reportes Administrativos'}
          </h3>
          {listaMostrada.map(rep => (
            <TarjetaReporte
              key={rep.id}
              reporte={rep}
              tipo={pestana}
              onVer={() => { setSeleccionado(rep); setModoForm(false); }}
              onEditar={() => { setSeleccionado(rep); setModoForm(true); }}
            />
          ))}
        </div>
      )}

      {/* MODAL DETALLE O FORMULARIO */}
      {(seleccionado || modoForm) && !modoForm && (
        <ModalDetalleReporte
          reporte={seleccionado}
          tipo={pestana}
          onCerrar={() => setSeleccionado(null)}
          onEditar={() => setModoForm(true)}
        />
      )}

      {modoForm && (
        <ModalFormReporte
          reporte={seleccionado}
          tipoPorDefecto={pestana === 'academico' ? 'ACADEMICO' : 'ADMINISTRATIVO'}
          onCerrar={() => { setModoForm(false); setSeleccionado(null); }}
          onGuardado={() => { setModoForm(false); setSeleccionado(null); cargar(); }}
        />
      )}
    </div>
  );
}

// ── KPIs Académicos ───────────────────────────
function KpisAcademicos({ reportes }) {
  const ultimo = reportes[reportes.length - 1] || {};
  return (
    <>
      <TarjetaKPI
        color="azul"
        icono="🏆"
        label="Promedio General"
        valor={ultimo.notaFinal != null ? ultimo.notaFinal.toFixed(1) : '—'}
        barra={porcentajeBarra(ultimo.notaFinal)}
        sufijoBarra="/5.0"
      />
      <TarjetaKPI
        color="aqua"
        icono="📅"
        label="Asistencia Total"
        valor={valorO(ultimo.asistenciaTotal)}
      />
      <TarjetaKPI
        color="amarillo"
        icono="📚"
        label="Cursos Activos"
        valor={valorO(ultimo.cantidadCursos)}
      />
      <TarjetaKPI
        color="azul"
        icono="⭐"
        label="Promedio Notas"
        valor={ultimo.promedioNotaCursos != null ? ultimo.promedioNotaCursos.toFixed(1) : '—'}
        barra={porcentajeBarra(ultimo.promedioNotaCursos)}
        sufijoBarra="/5.0"
      />
    </>
  );
}

// ── KPIs Administrativos ─────────────────────
function KpisAdministrativos({ reportes }) {
  const ultimo = reportes[reportes.length - 1] || {};
  return (
    <>
      <TarjetaKPI
        color="azul"
        icono="👥"
        label="Total Usuarios"
        valor={valorO(ultimo.cantidadUsuarios)}
      />
      <TarjetaKPI
        color="aqua"
        icono="💰"
        label="Promedio Matrícula"
        valor={ultimo.promedioMatricula != null ? `$${ultimo.promedioMatricula.toFixed(0)}` : '—'}
      />
      <TarjetaKPI
        color="amarillo"
        icono="👨‍🏫"
        label="Calificación Docente"
        valor={valorO(ultimo.calificacionDocente)}
      />
      <TarjetaKPI
        color="azul"
        icono="✅"
        label="Aprobados (%)"
        valor={ultimo.promedioUsuariosAprobadosCurso != null
          ? `${ultimo.promedioUsuariosAprobadosCurso.toFixed(1)}%` : '—'}
        barra={ultimo.promedioUsuariosAprobadosCurso}
        sufijoBarra="%"
      />
    </>
  );
}

// ── Tarjeta KPI ───────────────────────────────
function TarjetaKPI({ color, icono, label, valor, barra, sufijoBarra }) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icono">{icono}</div>
      <span className="kpi-label">{label}</span>
      <span className="kpi-valor">{valor}</span>
      {barra != null && (
        <div className="kpi-barra-wrap">
          <div className="kpi-barra-fill" style={{ width: `${Math.min(barra, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de reporte en lista ───────────────
function TarjetaReporte({ reporte, tipo, onVer, onEditar }) {
  return (
    <div className="reporte-row">
      <div className="reporte-row-info">
        <strong>
          Reporte #{reporte.id}
          {reporte.periodoReporte && ` — ${reporte.periodoReporte}`}
        </strong>
        <span className="reporte-row-detalle">
          {tipo === 'academico'
            ? `Nota final: ${valorO(reporte.notaFinal)} · Asistencia: ${valorO(reporte.asistenciaTotal)} · Cursos: ${valorO(reporte.cantidadCursos)}`
            : `Usuarios: ${valorO(reporte.cantidadUsuarios)} · Matrícula prom: ${reporte.promedioMatricula != null ? `$${reporte.promedioMatricula}` : '—'} · Docente: ${valorO(reporte.calificacionDocente)}`
          }
        </span>
      </div>
      <div className="reporte-row-acciones">
        <button className="btn-rep-ver"    onClick={onVer}>👁 Ver</button>
        <button className="btn-rep-editar" onClick={onEditar}>✏️ Editar</button>
      </div>
    </div>
  );
}

// ── Modal Detalle ─────────────────────────────
function ModalDetalleReporte({ reporte, tipo, onCerrar, onEditar }) {
  return (
    <div className="modal-overlay-rep" onClick={onCerrar}>
      <div className="modal-rep" onClick={e => e.stopPropagation()}>

        <div className="modal-rep-header">
          <div>
            <h3>📊 Reporte #{reporte.id}</h3>
            {reporte.periodoReporte && <span className="modal-rep-periodo">{reporte.periodoReporte}</span>}
          </div>
          <button className="btn-cerrar-modal-rep" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-rep-body">
          {tipo === 'academico' ? (
            <>
              <SeccionModal titulo="🎓 Datos Académicos">
                <FilaRep label="Nota Final"          valor={reporte.notaFinal} />
                <FilaRep label="Desempeño"           valor={reporte.desempeno} />
                <FilaRep label="Asistencia Total"    valor={reporte.asistenciaTotal} />
                <FilaRep label="Promedio Cursos"     valor={reporte.promedioCursos} />
                <FilaRep label="Promedio Nota Cursos" valor={reporte.promedioNotaCursos} />
                <FilaRep label="Asistencia Cursos"   valor={reporte.asistenciaCursos} />
              </SeccionModal>
              <SeccionModal titulo="📚 Datos de Cursos">
                <FilaRep label="Cantidad de Cursos"  valor={reporte.cantidadCursos} />
                <FilaRep label="Curso Popular"       valor={reporte.cursoPopular} />
                <FilaRep label="Curso Menos Popular" valor={reporte.cursoMenosPopular} />
                <FilaRep label="Horas por Curso"     valor={reporte.cantidadHorasCurso} />
              </SeccionModal>
            </>
          ) : (
            <SeccionModal titulo="📄 Datos Administrativos">
              <FilaRep label="Total Usuarios"          valor={reporte.cantidadUsuarios} />
              <FilaRep label="Usuarios en Curso"       valor={reporte.cantidadUsuariosCurso} />
              <FilaRep label="% Aprobados"             valor={reporte.promedioUsuariosAprobadosCurso} />
              <FilaRep label="Promedio Matrícula"      valor={reporte.promedioMatricula} />
              <FilaRep label="Calificación Docente"    valor={reporte.calificacionDocente} />
            </SeccionModal>
          )}
        </div>

        <div className="modal-rep-footer">
          <button className="btn-rep-editar-modal" onClick={onEditar}>
            ✏️ Editar este reporte
          </button>
        </div>
      </div>
    </div>
  );
}

function SeccionModal({ titulo, children }) {
  return (
    <section className="modal-rep-seccion">
      <h4>{titulo}</h4>
      {children}
    </section>
  );
}

function FilaRep({ label, valor }) {
  if (valor === null || valor === undefined || valor === '') return null;
  return (
    <div className="fila-rep">
      <span className="fila-rep-label">{label}:</span>
      <span className="fila-rep-valor">{String(valor)}</span>
    </div>
  );
}

// ── Modal Formulario (crear / editar) ─────────
function ModalFormReporte({ reporte, tipoPorDefecto, onCerrar, onGuardado }) {
  const modoEdicion = Boolean(reporte?.id);

  const [form, setForm] = useState({
    tipoReporte:                  reporte?.tipoReporte         || tipoPorDefecto,
    periodoReporte:               reporte?.periodoReporte      || '',
    notaFinal:                    reporte?.notaFinal           ?? '',
    desempeno:                    reporte?.desempeno           || '',
    asistenciaTotal:              reporte?.asistenciaTotal     || '',
    promedioCursos:               reporte?.promedioCursos      || '',
    promedioNotaCursos:           reporte?.promedioNotaCursos  ?? '',
    cantidadCursos:               reporte?.cantidadCursos      ?? '',
    asistenciaCursos:             reporte?.asistenciaCursos    || '',
    cursoPopular:                 reporte?.cursoPopular        || '',
    cursoMenosPopular:            reporte?.cursoMenosPopular   || '',
    cantidadHorasCurso:           reporte?.cantidadHorasCurso ?? '',
    cantidadUsuarios:             reporte?.cantidadUsuarios    ?? '',
    cantidadUsuariosCurso:        reporte?.cantidadUsuariosCurso ?? '',
    promedioUsuariosAprobadosCurso: reporte?.promedioUsuariosAprobadosCurso ?? '',
    promedioMatricula:            reporte?.promedioMatricula   ?? '',
    calificacionDocente:          reporte?.calificacionDocente || '',
    ...(modoEdicion ? { id: reporte.id } : {}),
  });

  const [mensaje,  setMensaje]  = useState('');
  const [tipoMsg,  setTipoMsg]  = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    const datos = {
      ...form,
      notaFinal:                    form.notaFinal           !== '' ? parseFloat(form.notaFinal)           : null,
      promedioNotaCursos:           form.promedioNotaCursos  !== '' ? parseFloat(form.promedioNotaCursos)  : null,
      cantidadCursos:               form.cantidadCursos      !== '' ? parseInt(form.cantidadCursos)        : null,
      cantidadHorasCurso:           form.cantidadHorasCurso  !== '' ? parseFloat(form.cantidadHorasCurso)  : null,
      cantidadUsuarios:             form.cantidadUsuarios    !== '' ? parseInt(form.cantidadUsuarios)      : null,
      cantidadUsuariosCurso:        form.cantidadUsuariosCurso !== '' ? parseInt(form.cantidadUsuariosCurso) : null,
      promedioUsuariosAprobadosCurso: form.promedioUsuariosAprobadosCurso !== '' ? parseFloat(form.promedioUsuariosAprobadosCurso) : null,
      promedioMatricula:            form.promedioMatricula   !== '' ? parseFloat(form.promedioMatricula)   : null,
    };

    try {
      if (modoEdicion) {
        await reporteService.actualizar(datos);
        setMensaje('¡Reporte actualizado!');
      } else {
        await reporteService.crear(datos);
        setMensaje('¡Reporte creado exitosamente!');
      }
      setTipoMsg('exito');
      setTimeout(onGuardado, 1500);
    } catch (err) {
      setMensaje(err.message || 'Error al conectar con el backend.');
      setTipoMsg('error');
    } finally {
      setCargando(false);
    }
  };

  const esAcademico = form.tipoReporte === 'ACADEMICO';

  return (
    <div className="modal-overlay-rep" onClick={onCerrar}>
      <div className="modal-rep modal-rep-form" onClick={e => e.stopPropagation()}>

        <div className="modal-rep-header">
          <h3>{modoEdicion ? '✏️ Editar Reporte' : '➕ Nuevo Reporte'}</h3>
          <button className="btn-cerrar-modal-rep" onClick={onCerrar}>✕</button>
        </div>

        {mensaje && (
          <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rep-form">

          {/* Tipo y período */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="tipoReporte">Tipo de Reporte</label>
              <select id="tipoReporte" name="tipoReporte"
                value={form.tipoReporte} onChange={handleChange}>
                <option value="ACADEMICO">Académico</option>
                <option value="ADMINISTRATIVO">Administrativo</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="periodoReporte">Período</label>
              <input id="periodoReporte" name="periodoReporte"
                value={form.periodoReporte} onChange={handleChange}
                placeholder="Ej: 2026-1" />
            </div>
          </div>

          {/* Campos académicos */}
          {esAcademico && (
            <fieldset>
              <legend>🎓 Datos Académicos</legend>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nota Final</label>
                  <input name="notaFinal" type="number" min="0" max="5" step="0.1"
                    value={form.notaFinal} onChange={handleChange} placeholder="0.0 – 5.0" />
                </div>
                <div className="form-group">
                  <label>Promedio Nota Cursos</label>
                  <input name="promedioNotaCursos" type="number" min="0" max="5" step="0.1"
                    value={form.promedioNotaCursos} onChange={handleChange} placeholder="0.0 – 5.0" />
                </div>
                <div className="form-group">
                  <label>Asistencia Total</label>
                  <input name="asistenciaTotal"
                    value={form.asistenciaTotal} onChange={handleChange} placeholder="Ej: 85%" />
                </div>
                <div className="form-group">
                  <label>Cantidad de Cursos</label>
                  <input name="cantidadCursos" type="number" min="0"
                    value={form.cantidadCursos} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Curso Más Popular</label>
                  <input name="cursoPopular"
                    value={form.cursoPopular} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Curso Menos Popular</label>
                  <input name="cursoMenosPopular"
                    value={form.cursoMenosPopular} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Horas por Curso</label>
                  <input name="cantidadHorasCurso" type="number" min="0" step="0.5"
                    value={form.cantidadHorasCurso} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Desempeño</label>
                  <input name="desempeno"
                    value={form.desempeno} onChange={handleChange}
                    placeholder="Ej: Excelente" />
                </div>
              </div>
            </fieldset>
          )}

          {/* Campos administrativos */}
          {!esAcademico && (
            <fieldset>
              <legend>📄 Datos Administrativos</legend>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Total Usuarios</label>
                  <input name="cantidadUsuarios" type="number" min="0"
                    value={form.cantidadUsuarios} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Usuarios en Curso</label>
                  <input name="cantidadUsuariosCurso" type="number" min="0"
                    value={form.cantidadUsuariosCurso} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>% Aprobados</label>
                  <input name="promedioUsuariosAprobadosCurso" type="number" min="0" max="100" step="0.1"
                    value={form.promedioUsuariosAprobadosCurso} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Promedio Matrícula ($)</label>
                  <input name="promedioMatricula" type="number" min="0" step="0.01"
                    value={form.promedioMatricula} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Calificación Docente</label>
                  <input name="calificacionDocente"
                    value={form.calificacionDocente} onChange={handleChange}
                    placeholder="Ej: 4.5 / Excelente" />
                </div>
              </div>
            </fieldset>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? '⏳ Guardando...' : modoEdicion ? '💾 Actualizar' : '➕ Crear Reporte'}
            </button>
            <button type="button" className="btn-cancel" onClick={onCerrar} disabled={cargando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportesEstadisticos;
