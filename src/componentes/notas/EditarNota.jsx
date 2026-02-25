import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mostrarAlerta } from '../../utils/swalConfig';
import { notaService } from '../../services/notaService';
import { cursoService} from '../../services/cursoService';
import './Notas.css';

function EditarNota() {

  const { id } = useParams();
  const navigate = useNavigate();

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
   CARGAR NOTA
  ================================ */
  useEffect(() => {
    const cargarNota = async () => {
      try {
        const data = await notaService.listarTodas();
        const notaEncontrada = data.find(n => n.id === Number(id));

        if (!notaEncontrada) {
          mostrarAlerta({
            icon: 'error',
            title: 'Error',
            text: 'Nota no encontrada'
          });
          navigate('/notas');
          return;
        }

        setForm({
          nombreEstudiante: notaEncontrada.nombreEstudiante,
          codigoEstudiante: notaEncontrada.codigoEstudiante,
          emailEstudiante: notaEncontrada.emailEstudiante,
          nombreMateria: notaEncontrada.nombreMateria,
          tipoExamen: notaEncontrada.tipoExamen,
          nota: notaEncontrada.nota
        });

      } catch (error) {
        console.error(error);
        mostrarAlerta({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la nota'
        });
      }
    };

    cargarNota();
  }, [id, navigate]);

  /* ===============================
    CARGAR CURSOS
  ================================ */
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const listaCursos = await cursoService.listarTodos();
        setCursos(listaCursos);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        mostrarAlerta({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los cursos'
        });
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
   ACTUALIZAR
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.nota) > 5 || Number(form.nota) < 0) {
      mostrarAlerta({
        icon: 'error',
        title: 'Error',
        text: 'La nota debe estar entre 0 y 5'
      });
      return;
    }

    try {
      await notaService.actualizar(id, {
        ...form,
        nota: Number(form.nota)
      });

      mostrarAlerta({
        icon: 'success',
        title: 'Actualizada',
        text: 'Nota actualizada correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/notas');

    } catch (error) {
      console.error(error);
      mostrarAlerta({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar'
      });
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Editar Nota
      </h1>

      <div className="dashboard-card">

        <form onSubmit={handleSubmit} className="admin-form">
          <h3 className="h3-materia">Editar Nota</h3>

          <input
            type="text"
            name="nombreEstudiante"
            value={form.nombreEstudiante}
            onChange={handleChange}
          />

          <input
            type="text"
            name="codigoEstudiante"
            value={form.codigoEstudiante}
            onChange={handleChange}
          />

          <input
            type="email"
            name="emailEstudiante"
            value={form.emailEstudiante}
            onChange={handleChange}
          />

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

          <select
            name="tipoExamen"
            value={form.tipoExamen}
            onChange={handleChange}
          >
            <option value="Quiz">Quiz</option>
            <option value="Taller">Taller</option>
            <option value="Parcial">Parcial</option>
            <option value="Examen final">Examen final</option>
          </select>

          <input
            type="number"
            name="nota"
            step="0.1"
            min="0"
            value={form.nota}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary">
            Guardar cambios
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

export default EditarNota;