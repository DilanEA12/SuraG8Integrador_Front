import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { notaService } from '../../services/notaService';
import './Notas.css';

function EditarNota() {

  const { id } = useParams();
  const navigate = useNavigate();

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
          Swal.fire('Error', 'Nota no encontrada', 'error');
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
        Swal.fire('Error', 'No se pudo cargar la nota', 'error');
      }
    };

    cargarNota();
  }, [id, navigate]);

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
      Swal.fire('Error', 'La nota debe estar entre 0 y 5', 'error');
      return;
    }

    try {
      await notaService.actualizar(id, {
        ...form,
        nota: Number(form.nota)
      });

      Swal.fire({
        icon: 'success',
        title: 'Actualizada',
        text: 'Nota actualizada correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/notas');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar', 'error');
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

          <input
            type="text"
            name="nombreMateria"
            value={form.nombreMateria}
            onChange={handleChange}
          />

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