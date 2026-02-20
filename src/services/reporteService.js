// ====================================
// SERVICIO DE REPORTES - UNIFICADO
// Solo accesible para rol Profesor
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/reportes';

export const reporteService = {

  listarTodos: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los reportes');
      return await response.json();
    } catch (error) {
      console.error('Error en listarTodos():', error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error(`No se encontró el reporte con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  crear: async (reporte) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reporte),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el reporte');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  actualizar: async (reporte) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reporte),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el reporte');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },

  // Filtra reportes por tipo en el frontend
  listarAcademicos: async () => {
    const todos = await reporteService.listarTodos();
    return todos.filter(r => r.tipoReporte === 'ACADEMICO' || !r.tipoReporte);
  },

  listarAdministrativos: async () => {
    const todos = await reporteService.listarTodos();
    return todos.filter(r => r.tipoReporte === 'ADMINISTRATIVO');
  },
};
