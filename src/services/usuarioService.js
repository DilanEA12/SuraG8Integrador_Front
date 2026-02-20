// ====================================
// SERVICIO DE USUARIOS - UNIFICADO
// Misma estructura que notificationService
// ====================================

const API_URL = 'http://localhost:8080/apisura8/v1/usuarios';

export const usuarioService = {

  // ========== CREAR USUARIO (POST) ==========
  crear: async (usuario) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear el usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== LISTAR TODOS LOS USUARIOS (GET) ==========
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }

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

      if (!response.ok) {
        throw new Error(`No se encontró el usuario con ID ${id}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR USUARIO (POST con ID) ==========
  // NOTA: igual que notificationService, el backend usa JPA save()
  // Si el objeto trae ID, JPA actualiza en vez de insertar
  actualizar: async (usuario) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },

  // ========== LOGIN (validación en frontend) ==========
  // Busca en todos los usuarios y valida credenciales
  login: async (correo, contraseña) => {
    try {
      const usuarios = await usuarioService.listarTodos();

      const usuarioEncontrado = usuarios.find(
        (u) => u.correo === correo && u.contraseña === contraseña
      );

      if (!usuarioEncontrado) {
        throw new Error('Correo o contraseña incorrectos');
      }

      return usuarioEncontrado;
    } catch (error) {
      console.error('Error en login():', error);
      throw error;
    }
  },
};
