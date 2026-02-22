// ========== 5. SERVICIO DE NOTAS ==========
// Conecta con: ControladorNota.java
// Endpoint base: /apisura8/v1/notas

const API_URL_NOTAS = 'http://localhost:8080/apisura8/v1/notas';

// ===============================
// FUNCIÓN GLOBAL PARA MANEJAR RESPUESTAS
// ===============================
const manejarRespuesta = async (response) => {
  if (!response.ok) {
    const mensaje = await response.text();
    throw new Error(mensaje || 'Error en la petición');
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const notaService = {

  crear: async (nota) => {
    const response = await fetch(API_URL_NOTAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nota)
    });

    return manejarRespuesta(response);
  },

  listarTodas: async () => {
    const response = await fetch(API_URL_NOTAS);
    return manejarRespuesta(response);
  },

  listarPorEmail: async (email) => {
    const response = await fetch(`${API_URL_NOTAS}?email=${email}`);
    return manejarRespuesta(response);
  },

  actualizar: async (id, nota) => {
    const response = await fetch(`${API_URL_NOTAS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nota)
    });

    return manejarRespuesta(response);
  },

  eliminar: async (id) => {
    const response = await fetch(`${API_URL_NOTAS}/${id}`, {
      method: 'DELETE'
    });

    return manejarRespuesta(response);
  }
};