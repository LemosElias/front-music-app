/* Método para asignar evento al boton de registrar en el formulario crear-usuario.html */
document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnListarCanciones");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto del formulario
            await registrarUsuario(); // Llamar a la función de registro
        });
    } else {
        console.error("El botón con ID 'btnreguistrar' no se encontró en el DOM.");
    }
});
let isLoading = false;

// Función para mostrar u ocultar el spinner
const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (mostrar) {
        contenedorSpinner.style.display = 'block'; 
    } else {
        contenedorSpinner.style.display = 'none'; 
    }
};

// Función para obtener la lista de canciones del servidor
const obtenerCanciones = async () => {

}
