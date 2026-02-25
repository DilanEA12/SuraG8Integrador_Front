import Swal from "sweetalert2";

export const mostrarAlerta = (config) => {
  const esDark = document.body.classList.contains("dark");

  return Swal.fire({
    customClass: {
      popup: esDark ? "swal-dark" : "",
    },
    confirmButtonColor: "#0055a4",
    ...config,
  });
};