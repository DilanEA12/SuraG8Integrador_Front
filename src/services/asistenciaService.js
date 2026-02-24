// ====================================
// SERVICIO DE ASISTENCIAS - UNIFICADO
// Mismo patrón que los demás servicios del proyecto
// ====================================

// ✅ CORREGIDO: era http://localhost:8081/api/asistencias
//    Puerto equivocado (8081 vs 8080) y ruta equivocada
//    También unificado a /apisura8/ (sin la 'g' extra del controlador original)
const API_URL = 'http://localhost:8080/apisura8/v1/asistencias';

export const asistenciaService = {

  // ========== LISTAR TODAS (GET) ==========
  listarTodas: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener las asistencias');
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
      if (!response.ok) throw new Error(`No se encontró la asistencia con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== CREAR (POST) ==========
  // El backend usa stored procedure — solo acepta:
  // { nombrePersona, fecha, horaEntrada, asistio }
  crear: async (asistencia) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asistencia),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al registrar la asistencia');
      }
      // El backend retorna la entidad tal como fue enviada (stored procedure no retorna ID)
      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== FILTRAR POR NOMBRE (cliente) ==========
  // El backend no tiene endpoint de búsqueda por nombre,
  // así que filtramos en el frontend después de traer todo
  filtrarPorNombre: async (nombre) => {
    const todas = await asistenciaService.listarTodas();
    if (!nombre) return todas;
    return todas.filter(a =>
      (a.nombrePersona || '').toLowerCase().includes(nombre.toLowerCase())
    );
  },
};
