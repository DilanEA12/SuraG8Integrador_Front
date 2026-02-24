// ====================================
// COMPONENTE EDITAR NOTIFICACIÓN
// ====================================
// Este componente permite modificar una notificación existente

import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import './EditarNotificacion_Sura.css';

// El componente recibe el ID de la notificación a editar como prop
function EditarNotificacion({ notificacionId, onCancelar, onGuardado }) {
  
  // ========== ESTADOS DEL COMPONENTE ==========
  
  const [formData, setFormData] = useState({
    id: null,  // ← IMPORTANTE: Guardamos el ID para que JPA sepa que es una actualización
    idRemitente: '',
    idDestinatario: '',
    emailRemitente: '',
    emailDestinatario: '',
    asunto: '',
    cuerpoMensaje: '',
    tipoNotificacion: 'Informativa',
    prioridad: 'Media',
    cursoRelacionado: '',
    categoriaCurso: '',
    fechaEntrega: '',
    fechaCreacion: '',
    fechaEnvio: '',
    horaEnvio: '',
    mensajeEnviado: false,
    mensajeLeido: false,
    mensajeEliminado: false,
    estado: true,
    cantidadArchivosAdjuntos: 0,
    notificacionEmergente: false
  });
  
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);  // Estado para cargar datos iniciales

  // ========== useEffect - CARGAR DATOS AL MONTAR ==========
  // Se ejecuta una vez cuando el componente aparece
  useEffect(() => {
    cargarNotificacion();
  }, [notificacionId]);  // Se vuelve a ejecutar si cambia el ID

  // ========== FUNCIONES DEL COMPONENTE ==========

  // Función para cargar los datos de la notificación desde el backend
  const cargarNotificacion = async () => {
    setCargando(true);
    try {
      const datos = await notificationService.buscarPorId(notificacionId);
      
      // Pre-llenamos el formulario con los datos traídos
      setFormData({
        id: datos.id,  // ← MUY IMPORTANTE: Incluimos el ID
        idRemitente: datos.idRemitente || '',
        idDestinatario: datos.idDestinatario || '',
        emailRemitente: datos.emailRemitente || '',
        emailDestinatario: datos.emailDestinatario || '',
        asunto: datos.asunto || '',
        cuerpoMensaje: datos.cuerpoMensaje || '',
        tipoNotificacion: datos.tipoNotificacion || 'Informativa',
        prioridad: datos.prioridad || 'Media',
        cursoRelacionado: datos.cursoRelacionado || '',
        categoriaCurso: datos.categoriaCurso || '',
        fechaEntrega: datos.fechaEntrega || '',
        fechaCreacion: datos.fechaCreacion || '',
        fechaEnvio: datos.fechaEnvio || '',
        horaEnvio: datos.horaEnvio || '',
        mensajeEnviado: datos.mensajeEnviado || false,
        mensajeLeido: datos.mensajeLeido || false,
        mensajeEliminado: datos.mensajeEliminado || false,
        estado: datos.estado !== undefined ? datos.estado : true,
        cantidadArchivosAdjuntos: datos.cantidadArchivosAdjuntos || 0,
        notificacionEmergente: datos.notificacionEmergente || false
      });
      
      console.log('Notificación cargada:', datos);
    } catch (error) {
      console.error('Error al cargar:', error);
      setMensaje('Error al cargar la notificación');
      setTipoMensaje('error');
    } finally {
      setCargando(false);
    }
  };

  // Función que maneja los cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.emailRemitente || !formData.emailDestinatario || !formData.asunto) {
      setMensaje('Por favor completa los campos obligatorios (*)');
      setTipoMensaje('error');
      return;
    }
    
    setEnviando(true);
    setMensaje('');
    
    try {
      // Preparamos los datos asegurando que los tipos sean correctos
      const datosAEnviar = {
        ...formData,
        id: parseInt(formData.id),  // ← CRÍTICO: El ID debe ir para que sea actualización
        idRemitente: formData.idRemitente ? parseInt(formData.idRemitente) : null,
        idDestinatario: formData.idDestinatario ? parseInt(formData.idDestinatario) : null,
        cantidadArchivosAdjuntos: parseInt(formData.cantidadArchivosAdjuntos)
      };
      
      // Llamamos a la función actualizar del servicio
      const respuesta = await notificationService.actualizar(datosAEnviar);
      
      console.log('Notificación actualizada:', respuesta);
      
      setMensaje('¡Notificación actualizada exitosamente!');
      setTipoMensaje('exito');
      
      // Después de 1.5 segundos, llamamos al callback de guardado (si existe)
      setTimeout(() => {
        if (onGuardado) {
          onGuardado();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMensaje('Error al actualizar la notificación');
      setTipoMensaje('error');
    } finally {
      setEnviando(false);
    }
  };

  // ========== RENDER DEL COMPONENTE ==========
  
  // Mostrar spinner mientras carga
  if (cargando) {
    return (
      <div className="editar-container">
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando notificación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-container">
      <div className="editar-header">
        <h2>✏️ Editar Notificación #{formData.id}</h2>
        {onCancelar && (
          <button onClick={onCancelar} className="btn-cerrar-header">
            ✕
          </button>
        )}
      </div>
      
      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="formulario">
        
        {/* ===== SECCIÓN 1: DATOS DE REMITENTE Y DESTINATARIO ===== */}
        <fieldset>
          <legend>👤 Información de Usuarios</legend>
          
          <div className="form-group">
            <label htmlFor="idRemitente">ID Remitente:</label>
            <input
              type="number"
              id="idRemitente"
              name="idRemitente"
              value={formData.idRemitente}
              onChange={handleChange}
              placeholder="Ej: 1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emailRemitente">Email Remitente: *</label>
            <input
              type="email"
              id="emailRemitente"
              name="emailRemitente"
              value={formData.emailRemitente}
              onChange={handleChange}
              placeholder="remitente@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="idDestinatario">ID Destinatario:</label>
            <input
              type="number"
              id="idDestinatario"
              name="idDestinatario"
              value={formData.idDestinatario}
              onChange={handleChange}
              placeholder="Ej: 2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="emailDestinatario">Email Destinatario: *</label>
            <input
              type="email"
              id="emailDestinatario"
              name="emailDestinatario"
              value={formData.emailDestinatario}
              onChange={handleChange}
              placeholder="destinatario@ejemplo.com"
              required
            />
          </div>
        </fieldset>

        {/* ===== SECCIÓN 2: CONTENIDO DEL MENSAJE ===== */}
        <fieldset>
          <legend>✉️ Contenido del Mensaje</legend>
          
          <div className="form-group">
            <label htmlFor="asunto">Asunto: *</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Asunto de la notificación"
              required
              maxLength="200"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cuerpoMensaje">Mensaje:</label>
            <textarea
              id="cuerpoMensaje"
              name="cuerpoMensaje"
              value={formData.cuerpoMensaje}
              onChange={handleChange}
              placeholder="Escribe aquí el contenido de tu mensaje..."
              rows="5"
            />
          </div>
        </fieldset>

        {/* ===== SECCIÓN 3: CLASIFICACIÓN ===== */}
        <fieldset>
          <legend>🏷️ Clasificación</legend>
          
          <div className="form-group">
            <label htmlFor="tipoNotificacion">Tipo de Notificación:</label>
            <select
              id="tipoNotificacion"
              name="tipoNotificacion"
              value={formData.tipoNotificacion}
              onChange={handleChange}
            >
              <option value="Informativa">Informativa</option>
              <option value="Urgente">Urgente</option>
              <option value="Recordatorio">Recordatorio</option>
              <option value="Tarea">Tarea</option>
              <option value="Anuncio">Anuncio</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="prioridad">Prioridad:</label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </fieldset>

        {/* ===== SECCIÓN 4: INFORMACIÓN DEL CURSO ===== */}
        <fieldset>
          <legend>📚 Curso Relacionado</legend>
          
          <div className="form-group">
            <label htmlFor="cursoRelacionado">Curso:</label>
            <input
              type="text"
              id="cursoRelacionado"
              name="cursoRelacionado"
              value={formData.cursoRelacionado}
              onChange={handleChange}
              placeholder="Ej: Programación Java"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoriaCurso">Categoría:</label>
            <input
              type="text"
              id="categoriaCurso"
              name="categoriaCurso"
              value={formData.categoriaCurso}
              onChange={handleChange}
              placeholder="Ej: Desarrollo Backend"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaEntrega">Fecha de Entrega:</label>
            <input
              type="date"
              id="fechaEntrega"
              name="fechaEntrega"
              value={formData.fechaEntrega}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* ===== SECCIÓN 5: FECHAS Y HORA ===== */}
        <fieldset>
          <legend>📅 Fechas y Hora</legend>
          
          <div className="form-group">
            <label htmlFor="fechaCreacion">Fecha Creación:</label>
            <input
              type="date"
              id="fechaCreacion"
              name="fechaCreacion"
              value={formData.fechaCreacion}
              onChange={handleChange}
              readOnly
            />
            <small>Establecida al crear la notificación</small>
          </div>

          <div className="form-group">
            <label htmlFor="fechaEnvio">Fecha Envío:</label>
            <input
              type="date"
              id="fechaEnvio"
              name="fechaEnvio"
              value={formData.fechaEnvio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="horaEnvio">Hora Envío:</label>
            <input
              type="time"
              id="horaEnvio"
              name="horaEnvio"
              value={formData.horaEnvio}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* ===== SECCIÓN 6: OPCIONES ADICIONALES ===== */}
        <fieldset>
          <legend>⚙️ Opciones Adicionales</legend>
          
          <div className="form-group">
            <label htmlFor="cantidadArchivosAdjuntos">Archivos Adjuntos:</label>
            <input
              type="number"
              id="cantidadArchivosAdjuntos"
              name="cantidadArchivosAdjuntos"
              value={formData.cantidadArchivosAdjuntos}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="mensajeEnviado"
              name="mensajeEnviado"
              checked={formData.mensajeEnviado}
              onChange={handleChange}
            />
            <label htmlFor="mensajeEnviado">
              Mensaje enviado
            </label>
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="mensajeLeido"
              name="mensajeLeido"
              checked={formData.mensajeLeido}
              onChange={handleChange}
            />
            <label htmlFor="mensajeLeido">
              Mensaje leído
            </label>
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="notificacionEmergente"
              name="notificacionEmergente"
              checked={formData.notificacionEmergente}
              onChange={handleChange}
            />
            <label htmlFor="notificacionEmergente">
              Mostrar como notificación emergente
            </label>
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="estado"
              name="estado"
              checked={formData.estado}
              onChange={handleChange}
            />
            <label htmlFor="estado">
              Notificación activa
            </label>
          </div>
        </fieldset>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={enviando}
          >
            {enviando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
          </button>
          
          {onCancelar && (
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={onCancelar}
              disabled={enviando}
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditarNotificacion;
