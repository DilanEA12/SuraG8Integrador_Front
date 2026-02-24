// ====================================
// SERVICIO DE MATRÍCULAS
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/matriculas';

export const matriculaService = {

  listarTodas: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener las matrículas');
      return await response.json();
    } catch (error) {
      console.error('Error en listarTodas():', error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error(`No se encontró la matrícula con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  guardar: async (matricula) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matricula),
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Error al guardar la matrícula');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en guardar():', error);
      throw error;
    }
  },
};
