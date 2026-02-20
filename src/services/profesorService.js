// ====================================
// SERVICIO DE PROFESORES - UNIFICADO
// Misma estructura que usuarioService y notificationService
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/profesores';

export const profesorService = {

  // ========== LISTAR TODOS (GET) ==========
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los profesores');
      return await response.json();
    } catch (error) {
      console.error('Error en listarTodos():', error);
      throw error;
    }
  },

  // ========== BUSCAR POR ID (GET) ==========
  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error(`No se encontró el profesor con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== CREAR (POST) ==========
  crear: async (profesor) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profesor),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el profesor');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR (POST con ID - JPA save()) ==========
  actualizar: async (profesor) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profesor),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el profesor');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },

  // ========== DESACTIVAR (cambia vigencia a false) ==========
  desactivar: async (id) => {
    try {
      const profesor = await profesorService.buscarPorId(id);
      const actualizado = { ...profesor, vigencia: false };
      return await profesorService.actualizar(actualizado);
    } catch (error) {
      console.error('Error en desactivar():', error);
      throw error;
    }
  },
};
