// ====================================
// APP.JSX - VERSIÓN FINAL
// ✅ Usuarios       ✅ Notificaciones
// ✅ Profesores     ✅ Cursos
// ✅ Reportes       ✅ Notas  ⏳ Matrícula
// ====================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Usuarios ──
import LoginUsuarios     from './componentes/usuarios/LoginUsuarios';
import UsuarioFormulario from './componentes/usuarios/UsuarioFormulario';
import ListaUsuarios     from './componentes/usuarios/ListaUsuarios';

// ── Notificaciones ──
import FormularioNotificacion from './componentes/notificaciones/FormularioNotificacion';
import ListaNotificaciones    from './componentes/notificaciones/ListaNotificaciones';
import EditarNotificacion     from './componentes/notificaciones/EditarNotificacion';

// ── Profesores ──
import ListaProfesores    from './componentes/profesores/ListaProfesores';
import FormularioProfesor from './componentes/profesores/FormularioProfesor';

// ── Cursos ──
import ListaCursos     from './componentes/cursos/ListaCursos';
import FormularioCurso from './componentes/cursos/FormularioCurso';

// ── Reportes ✅ ──
import ReportesEstadisticos from './componentes/reportes/ReportesEstadisticos';

// ── Asistencias ✅ ──
import ListaAsistencias from './componentes/asistencias/ListaAsistencias';

// ── Shared ──
import Navbar from './componentes/shared/Navbar';
import Inicio from './componentes/pages/Inicio';
import Home   from './componentes/pages/Home';

// ── Notas ──
import ListaNotas from './componentes/notas/ListaNotas';
import CrearNota  from './componentes/notas/CrearNota';
import EditarNota from './componentes/notas/EditarNota';


//── Matrícula ──
  import ListaMatricula      from './componentes/matricula/ListaMatricula';
  import FormularioMatricula from './componentes/matricula/FormularioMatricula';

// ── Estilos ──
import './App.css';
import './componentes/shared/Colores.css';
// ── Inicializar Dark Mode ANTES del primer render ──────────────
// Evita el "flash" de tema claro al recargar en modo oscuro
(function initDarkMode() {
  if (localStorage.getItem('sura-dark') === 'true') {
    document.body.classList.add('dark');
  }
})();

// ── Guards ──────────────────────────────────
function RutaProtegida({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function RutaSoloProfesor({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) return <Navigate to="/login" replace />;

  // Solo permite acceso a usuarios con rol "Profesor"
  if (usuario.rol !== 'Profesor') {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// ── App ──────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route path="/"         element={<Inicio />} />
        <Route path="/login"    element={<LoginUsuarios />} />
        <Route path="/registro" element={<UsuarioFormulario />} />

        {/* Home */}
        <Route path="/home"
          element={<RutaProtegida><Home /></RutaProtegida>} />

        {/* Usuarios — solo Profesor */}
        <Route path="/usuarios"
          element={<RutaSoloProfesor><ListaUsuarios /></RutaSoloProfesor>} />

        {/* Notificaciones */}
        <Route path="/notificaciones"
          element={<RutaProtegida><ListaNotificaciones /></RutaProtegida>} />

        <Route path="/notificaciones/crear"
          element={<RutaSoloProfesor><FormularioNotificacion /></RutaSoloProfesor>} />

        <Route path="/notificaciones/editar/:id"
          element={<RutaSoloProfesor><EditarNotificacion /></RutaSoloProfesor>} />

        {/* Profesores */}
        <Route path="/profesores"
          element={<RutaProtegida><ListaProfesores /></RutaProtegida>} />

        <Route path="/profesores/crear"
          element={<RutaSoloProfesor><FormularioProfesor /></RutaSoloProfesor>} />

        <Route path="/profesores/editar/:id"
          element={<RutaSoloProfesor><FormularioProfesor /></RutaSoloProfesor>} />

        {/* Cursos */}
        <Route path="/cursos"
          element={<RutaProtegida><ListaCursos /></RutaProtegida>} />

        <Route path="/cursos/crear"
          element={<RutaSoloProfesor><FormularioCurso /></RutaSoloProfesor>} />

        <Route path="/cursos/editar/:id"
          element={<RutaSoloProfesor><FormularioCurso /></RutaSoloProfesor>} />

        {/* Reportes — solo Profesor */}
        <Route path="/reportes"
          element={<RutaSoloProfesor><ReportesEstadisticos /></RutaSoloProfesor>} />

        {/* Asistencias */}
        {/* Ver lista: ambos roles (estudiante ve solo sus propios registros) */}
        <Route path="/asistencias"
          element={<RutaProtegida><ListaAsistencias /></RutaProtegida>} />
        {/* Registrar: solo profesor (el formulario está integrado en ListaAsistencias) */}
        <Route path="/asistencias/crear"
          element={<RutaSoloProfesor><ListaAsistencias /></RutaSoloProfesor>} />


        {/* Notas */}
        <Route path="/notas"
          element={<RutaProtegida><ListaNotas /></RutaProtegida>} />

        <Route path="/notas/crear"
          element={<RutaSoloProfesor><CrearNota /></RutaSoloProfesor>} />

        <Route path="/notas/editar/:id"
          element={<RutaSoloProfesor><EditarNota /></RutaSoloProfesor>} />

        {/* Matrícula */}
        {
          <>
        <Route path="/matricula"
          element={<RutaProtegida><ListaMatricula /></RutaProtegida>} />
        <Route path="/matricula/crear"
          element={<RutaSoloProfesor><FormularioMatricula /></RutaSoloProfesor>} />
        <Route path="/matricula/editar/:id"
          element={<RutaSoloProfesor><FormularioMatricula /></RutaSoloProfesor>} />
          </>
        }

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;