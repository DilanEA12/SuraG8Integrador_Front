// ====================================
// APP.JSX - VERSIÓN FINAL
// ✅ Usuarios       ✅ Notificaciones
// ✅ Profesores     ✅ Cursos
// ✅ Reportes       ⏳ Notas  ⏳ Matrícula
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
// ── Shared ──
import Navbar from './componentes/shared/Navbar';
import Inicio from './componentes/pages/Inicio';
import Home   from './componentes/pages/Home';

/*
  PRÓXIMOS MÓDULOS — descomenta al implementarlos:

  import ListaNotas          from './componentes/notas/ListaNotas';
  import FormularioNota      from './componentes/notas/FormularioNota';

  import ListaMatricula      from './componentes/matricula/ListaMatricula';
  import FormularioMatricula from './componentes/matricula/FormularioMatricula';
*/

import './App.css';
import './componentes/shared/Colores.css';

// ── Guards ──────────────────────────────────
function RutaProtegida({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return <Navigate to="/login" replace />;
  return <><Navbar />{children}</>;
}

function RutaSoloProfesor({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'Profesor') return <Navigate to="/home" replace />;
  return <><Navbar />{children}</>;
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
        <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />

        {/* Usuarios */}
        <Route path="/usuarios"
          element={<RutaProtegida><ListaUsuarios /></RutaProtegida>} />

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
      
        {/* Notas (próximo) */}
        {/*
        <Route path="/notas"
          element={<RutaProtegida><ListaNotas /></RutaProtegida>} />
        <Route path="/notas/crear"
          element={<RutaSoloProfesor><FormularioNota /></RutaSoloProfesor>} />
        <Route path="/notas/editar/:id"
          element={<RutaSoloProfesor><FormularioNota /></RutaSoloProfesor>} />
        */}

        {/* Matrícula (próximo) */}
        {/*
        <Route path="/matricula"
          element={<RutaProtegida><ListaMatricula /></RutaProtegida>} />
        <Route path="/matricula/crear"
          element={<RutaSoloProfesor><FormularioMatricula /></RutaSoloProfesor>} />
        <Route path="/matricula/editar/:id"
          element={<RutaSoloProfesor><FormularioMatricula /></RutaSoloProfesor>} />
        */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
