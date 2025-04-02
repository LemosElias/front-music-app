document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnCrearcancion");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); 
            mostrarSpinner(true); 
            await registrarCancion();  
            mostrarSpinner(false);
        });
    } else {
        console.error("El botón con ID 'btnCrearcancion' no se encontró en el DOM.");
    }
});

// Función para mostrar u ocultar el spinner con verificación de existencia
const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (contenedorSpinner) {
        contenedorSpinner.style.display = mostrar ? 'block' : 'none';
    } else {
        console.error("El elemento con clase 'contenedor-spinner' no existe en el DOM.");
    }
};

// Función para registrar la canción
const registrarCancion = async () => {
    let token = localStorage.getItem("token"); // Obtiene el token de autenticación
    if (!token) {
        alert("No tienes autorización para crear una canción.");
        return;
    }

    let campos = {
        name: document.getElementById("nombre-cancion")?.value.trim(),
        genre: document.getElementById("genero")?.value.trim(),
    };

    // Validar que los campos no estén vacíos
    if (!campos.name || !campos.genre) {
        alert("Por favor complete todos los campos.");
        mostrarSpinner(false); // Asegurar que el spinner no se quede visible si hay error
        return;
    }

    console.log("Datos enviados:", campos);

    try {
        const respuesta = await fetch("http://localhost:8080/songs/user/createSong", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Se agrega el token a la petición
            },
            body: JSON.stringify(campos),
        });

        const textoRespuesta = await respuesta.text(); // Obtener el texto en bruto antes de analizarlo
        
        if (respuesta.ok) {
            console.log("Respuesta del servidor:", textoRespuesta);
            
            if (textoRespuesta) { 
                const datosRespuesta = JSON.parse(textoRespuesta); // Parsear solo si no está vacío
                console.log("Registro exitoso:", datosRespuesta);
                alert("Canción registrada correctamente.");
                window.location.href = "./login.html"; // Redirigir tras el registro
            } /*else {
                console.error("El servidor devolvió una respuesta vacía.");
                alert("Error: La respuesta del servidor está vacía.");
            }*/
        } else {
            console.error("Error en el registro:", textoRespuesta);
            alert("Error: " + textoRespuesta);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        mostrarSpinner(false); // Ocultar el spinner después de la solicitud
    }
};