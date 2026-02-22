import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { notaService } from '../../services/notaService';
import { usuarioService } from '../../services/usuarioService';
import { cursoService } from '../../services/cursoService';
import './Notas.css';

function CrearNota() {

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [form, setForm] = useState({
    nombreEstudiante: '',
    codigoEstudiante: '',
    emailEstudiante: '',
    nombreMateria: '',
    tipoExamen: '',
    nota: ''
  });

  /* ===============================
     CARGAR ESTUDIANTES
  ================================ */
  useEffect(() => {

    const cargarEstudiantes = async () => {
      try {
        const usuarios = await usuarioService.listarTodos();
        const soloEstudiantes = usuarios
          .filter((u) => u.rol === "Estudiante")
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setEstudiantes(soloEstudiantes);

      } catch (error) {
        console.error("Error cargando estudiantes:", error);
        Swal.fire("Error", "No se pudieron cargar los estudiantes", "error");
      }
    };

    cargarEstudiantes();

    const cargarCursos = async () => {
      try {
        const listaCursos = await cursoService.listarTodos();
        setCursos(listaCursos);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        Swal.fire("Error", "No se pudieron cargar los cursos", "error");
      }
    };

  cargarCursos();

  }, []);

  /* ===============================
     HANDLE CHANGE
  ================================ */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     GUARDAR NOTA
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.nombreEstudiante ||
      !form.codigoEstudiante ||
      !form.emailEstudiante ||
      !form.nombreMateria ||
      !form.tipoExamen ||
      form.nota === ''
    ) {
      Swal.fire('Error', 'Completa todos los campos', 'error');
      return;
    }

    if (Number(form.nota) > 5 || Number(form.nota) < 0) {
      Swal.fire('Error', 'La nota debe estar entre 0 y 5', 'error');
      return;
    }

    try {

      const nuevaNota = {
        ...form,
          nota: Number(form.nota),
          profesorCorreo: usuario?.correo
      };

      await notaService.crear(nuevaNota);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Nota creada correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/notas');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar la nota', 'error');
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Asignar Nota
      </h1>

      <div className="dashboard-card">

        <form onSubmit={handleSubmit} className="admin-form">

          {/* ESTUDIANTE */}
          <select
            name="emailEstudiante"
            value={form.emailEstudiante}
            onChange={(e) => {
              const emailSeleccionado = e.target.value;
              const estudiante = estudiantes.find(
                (est) => est.correo === emailSeleccionado
              );

              setForm({
                ...form,
                emailEstudiante: emailSeleccionado,
                nombreEstudiante: estudiante?.nombre || "",
                codigoEstudiante: estudiante?.codigo || ""
              });
            }}
          >
            <option value="">Seleccionar estudiante</option>
            {estudiantes.map((est) => (
              <option key={est.id} value={est.correo}>
                {est.nombre}
              </option>
            ))}
          </select>

          {/* CÓDIGO */}
          <input
            type="text"
            name="codigoEstudiante"
            placeholder="Código del estudiante"
            value={form.codigoEstudiante}
            onChange={handleChange}
          />

          {/* MATERIA */}
          <select
            name="nombreMateria"
            value={form.nombreMateria}
            onChange={handleChange}
            >
            <option value="">Seleccionar curso</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.titulo}>
                {curso.titulo}
              </option>
            ))}
          </select>

          {/* TIPO */}
          <select
            name="tipoExamen"
            value={form.tipoExamen}
            onChange={handleChange}
          >
            <option value="">Tipo de evaluación</option>
            <option value="Quiz">Quiz</option>
            <option value="Taller">Taller</option>
            <option value="Parcial">Parcial</option>
            <option value="Examen final">Examen final</option>
          </select>

          {/* NOTA */}
          <input
            type="number"
            name="nota"
            placeholder="Nota"
            step="0.1"
            min="0"
            value={form.nota}
            onChange={handleChange}
          />

          {/* BOTONES */}
          <button type="submit" className="btn btn-primary">
            Guardar nota
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/notas')}
          >
            Cancelar
          </button>

        </form>

      </div>

    </div>
  );
}

export default CrearNota;