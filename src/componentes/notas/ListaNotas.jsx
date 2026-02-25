import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mostrarAlerta } from "../../utils/swalConfig";
import { notaService } from "../../services/notaService";
import { exportarNotasCSV, exportarNotasPDF } from "../../utils/exportNotas";
import "./Notas.css";

const ITEMS_POR_PAGINA = 5;

function ListaNotas() {

  const [notas, setNotas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const navigate = useNavigate();

  // 🔐 Usuario autenticado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esProfesor = usuario?.rol === "Profesor";

  /* ===============================
     CARGAR NOTAS
  ================================ */
  const cargarNotas = useCallback(async () => {
    try {
      let data;

      if (esProfesor) {
        data = await notaService.listarTodas();
      } else {
        data = await notaService.listarPorEmail(usuario.correo);
      }

      setNotas(data);

    } catch (error) {
      console.error("Error cargando notas:", error);
    }
  }, [esProfesor, usuario?.correo]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

 /* ===============================
   ELIMINAR
  ================================ */
  const eliminarNota = async (id) => {
    const confirmar = await mostrarAlerta({
      title: "¿Eliminar nota?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirmar.isConfirmed) return;

    try {
      await notaService.eliminar(id);
      await cargarNotas();
      mostrarAlerta({
        icon: "success",
        title: "Eliminada",
        text: "Nota eliminada correctamente"
      });
    } catch (error) {
      console.error(error);
      mostrarAlerta({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la nota"
      });
    }
  };

  /* ===============================
   FILTRO
  ================================ */
  const notasFiltradas = notas.filter((nota) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return true;

    const esNumero = !isNaN(texto);

    // 🔢 Si es número → buscar SOLO por nota exacta
    if (esNumero) {
      return Number(nota.nota) === Number(texto);
    }

    // 🔤 Si es texto → búsqueda parcial
    const materia = nota.nombreMateria?.toLowerCase() || "";
    const tipo = nota.tipoExamen?.toLowerCase() || "";
    const estudiante = nota.nombreEstudiante?.toLowerCase() || "";
    const codigo = nota.codigoEstudiante?.toLowerCase() || "";

    return (
      materia.includes(texto) ||
      tipo.includes(texto) ||
      estudiante.includes(texto) ||
      codigo.includes(texto)
    );
  });

  /* ===============================
     PAGINACIÓN
  ================================ */
  const totalPaginas = Math.ceil(notasFiltradas.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const notasPaginadas = notasFiltradas.slice(inicio, fin);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  /* ===============================
     EXPORTACIÓN
  ================================ */
  const exportarCSV = () => {
    exportarNotasCSV(notasFiltradas);
  };

  const exportarPDF = () => {
    exportarNotasPDF(notasFiltradas);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">
        Gestión de Notas
      </h1>

      {/* ===== FILTROS Y ACCIONES ===== */}
      <div className="dashboard-card dashboard-filters">

        <input
          type="text"
          placeholder="Buscar por materia o tipo de examen..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

          <button className="btn btn-outline" onClick={exportarCSV}>
            Exportar CSV
          </button>

          <button className="btn btn-outline" onClick={exportarPDF}>
            Exportar PDF
          </button>

          {esProfesor && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/notas/crear")}
            >
              Crear Nota
            </button>
          )}

        </div>

      </div>

      {/* ===== TABLA ===== */}
      <div className="dashboard-card">

        {notasFiltradas.length === 0 ? (
          <p className="p-card">No hay notas disponibles</p>
        ) : (
          <>
            <div className="table-container">
              <table className="sura-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Código</th>
                    <th>Materia</th>
                    <th>Tipo</th>
                    <th>Nota</th>
                    <th>Fecha</th>
                    {esProfesor && <th>Acciones</th>}
                  </tr>
                </thead>

                <tbody>
                  {notasPaginadas.map((nota) => (
                    <tr key={nota.id}>
                      <td>{nota.nombreEstudiante}</td>
                      <td>{nota.codigoEstudiante}</td>
                      <td>{nota.nombreMateria}</td>
                      <td>{nota.tipoExamen}</td>
                      <td>{nota.nota}</td>
                      <td>{formatearFecha(nota.fechaExamen)}</td>

                      {esProfesor && (
                        <td>
                          <button
                            className="btn btn-outline"
                            onClick={() => navigate(`/notas/editar/${nota.id}`)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline"
                            onClick={() => eliminarNota(nota.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .map((num) => (
                    <button
                      key={num}
                      className={num === paginaActual ? "active" : ""}
                      onClick={() => setPaginaActual(num)}
                    >
                      {num}
                    </button>
                  ))}
              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
}

export default ListaNotas;