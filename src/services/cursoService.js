// ====================================
// SERVICIO DE CURSOS - UNIFICADO
// Mismo patrón que profesorService, usuarioService, notificationService
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/cursos';

export const cursoService = {

  // ========== LISTAR TODOS (GET) ==========
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los cursos');
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
      if (!response.ok) throw new Error(`No se encontró el curso con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== CREAR (POST) ==========
  crear: async (curso) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el curso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR (POST con id - JPA save()) ==========
  actualizar: async (curso) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el curso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },

  // ========== DESACTIVAR (presencialidad a false como flag de inactivo) ==========
  // Nota: Curso no tiene campo "vigencia". Usa presencialidad como bandera
  // o simplemente elimina del listado filtrando en el frontend.
  // Si el backend agrega un campo "activo" o "vigencia" futuro, actualizar aquí.
  desactivar: async (id) => {
    try {
      const curso = await cursoService.buscarPorId(id);
      const actualizado = { ...curso, presencialidad: false };
      return await cursoService.actualizar(actualizado);
    } catch (error) {
      console.error('Error en desactivar():', error);
      throw error;
    }
  },
};
