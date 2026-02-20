// ====================================
// SERVICIO DE NOTIFICACIONES - UNIFICADO
// Misma estructura que usuarioService
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/notificaciones';

export const notificationService = {

  // ========== CREAR NOTIFICACIÓN (POST) ==========
  crear: async (notificacion) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificacion),
      });

      if (!response.ok) {
        throw new Error('Error al crear la notificación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== LISTAR TODAS LAS NOTIFICACIONES (GET) ==========
  listarTodas: async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Error al obtener las notificaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en listarTodas():', error);
      throw error;
    }
  },

  // ========== BUSCAR POR ID (GET) ==========
  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`No se encontró la notificación con ID ${id}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR NOTIFICACIÓN (POST con ID) ==========
  // NOTA: el backend usa JPA save() — si el objeto tiene ID, actualiza
  actualizar: async (notificacion) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificacion),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la notificación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },
};
