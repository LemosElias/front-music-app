document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnListarCanciones");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto
            await obtenerCanciones(); // Llamar a la función para obtener canciones
        });
    } else {
        console.error("El botón con ID 'btnListarCanciones' no se encontró en el DOM.");
    }
});

// **Función para obtener canciones del servidor y agregarlas a la tabla**
const obtenerCanciones = async () => {
    if (typeof mostrarSpinner === "function") mostrarSpinner(true); // Activar spinner

    try {
        const token = localStorage.getItem("token"); // Obtener el token almacenado en localStorage
        if (!token) {
            throw new Error("Usuario no autenticado: Token no encontrado.");
        }

        const respuesta = await fetch("http://localhost:8080/songs/getSongs", { // CORREGIDO
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Se incluye el token en la cabecera
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error al obtener canciones: ${respuesta.status} - ${respuesta.statusText}`);
        }

        const datos = await respuesta.json();
        console.log("Datos recibidos:", datos); // Depuración

       
        const canciones = datos.songs && Array.isArray(datos.songs) ? datos.songs[0] : [];
        if (!Array.isArray(canciones)) {
            throw new Error("El formato de la respuesta del servidor no es válido.");
        }

        // Limpiar tabla y agregar canciones
        const tablaBody = document.querySelector("#tabla-canciones tbody");
        tablaBody.innerHTML = "";

        canciones.forEach(cancion => {
            if (!cancion.name || !cancion.genre || !cancion.artist) {
                console.warn("Canción con datos incompletos:", cancion);
                return; // Omitir registros defectuosos
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cancion.name}</td>
                <td>${cancion.genre}</td>
                <td>${cancion.artist.name}</td>
            `;
            tablaBody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error obteniendo canciones:", error);
        alert("Hubo un problema al obtener las canciones. Verifique la respuesta del servidor.");
    } finally {
        if (typeof mostrarSpinner === "function") mostrarSpinner(false);
    }
};
