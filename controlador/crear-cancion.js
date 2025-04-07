document.addEventListener("DOMContentLoaded", () => {
    let botonCrear = document.getElementById("btnCrearcancion");
    let botonListarUsuario = document.getElementById("btnListarMisCanciones");
    let botonListarTodas = document.getElementById("btnListarCanciones"); // Nuevo botón

    if (botonCrear) {
        botonCrear.addEventListener("click", async (evento) => {
            evento.preventDefault(); 
            mostrarSpinner(true); 
            await registrarCancion();  
            mostrarSpinner(false);
        });
    } else {
        console.error("El botón con ID 'btnCrearcancion' no se encontró en el DOM.");
    }

    if (botonListarUsuario) {
        botonListarUsuario.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await listarMisCanciones();
            mostrarSpinner(false);
        });
    } else {
        console.error("El botón con ID 'btnListarMisCanciones' no se encontró en el DOM.");
    }

    if (botonListarTodas) {
        botonListarTodas.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await listarTodasLasCanciones();  
            mostrarSpinner(false);
        });
    } else {
        console.error("El botón con ID 'btnListarCanciones' no se encontró en el DOM.");
    }
});

// Función para mostrar u ocultar el spinner con verificación de existencia
const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (contenedorSpinner) {
        contenedorSpinner.style.display = mostrar ? 'flex' : 'none';
    } else {
        console.error("El elemento con clase 'contenedor-spinner' no existe en el DOM.");
    }
};

// Función para registrar la canción
const registrarCancion = async () => {
    let token = localStorage.getItem("token"); 
    if (!token) {
        alert("No tienes autorización para crear una canción.");
        return;
    }

    let campos = {
        name: document.getElementById("nombre-cancion")?.value.trim(),
        genre: document.getElementById("genero")?.value.trim(),
    };

    if (!campos.name || !campos.genre) {
        alert("Por favor complete todos los campos.");
        mostrarSpinner(false);
        return;
    }

    console.log("Datos enviados:", campos);

    try {
        const respuesta = await fetch("http://localhost:8080/songs/user/createSong", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(campos),
        });

        const textoRespuesta = await respuesta.text();
        
        if (respuesta.ok) {
            console.log("Respuesta del servidor:", textoRespuesta);
            
            if (textoRespuesta) { 
                const datosRespuesta = JSON.parse(textoRespuesta);
                console.log("Registro exitoso:", datosRespuesta);
                alert("Canción registrada correctamente.");
                window.location.href = "./login.html";
            }
        } else {
            console.error("Error en el registro:", textoRespuesta);
            alert("Error: " + textoRespuesta);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        mostrarSpinner(false);
    }
};

// Función para listar las canciones del usuario
const listarMisCanciones = async () => {
    let token = localStorage.getItem("token"); 
    if (!token) {
        alert("No tienes autorización para listar tus canciones.");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:8080/songs/songs/getUserSongs", {  
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!respuesta.ok) {
            console.error("Error al obtener las canciones:", await respuesta.text());
            alert("Error al obtener la lista de canciones.");
            return;
        }

        const canciones = await respuesta.json();
        console.log("Canciones obtenidas del usuario:", canciones);

        if (!Array.isArray(canciones) || canciones.length === 0) {
            console.error("No hay canciones registradas por el usuario.");
            alert("No tienes canciones registradas.");
            return;
        }

        actualizarTablaCanciones(canciones);
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

// Nueva función para listar todas las canciones
const listarTodasLasCanciones = async () => {
    try {
        const respuesta = await fetch("http://localhost:8080/songs/getSongs", {  
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!respuesta.ok) {
            console.error("Error al obtener todas las canciones:", await respuesta.text());
            alert("Listado completo.");
            return;
        }

        const canciones = await respuesta.json();
        console.log("Canciones obtenidas:", canciones);

        if (!Array.isArray(canciones) || canciones.length === 0) {
            console.error("No hay canciones en la base de datos.");
            alert("No hay canciones disponibles.");
            return;
        }

        actualizarTablaCanciones(canciones);
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

// Función para actualizar la tabla de canciones
const actualizarTablaCanciones = (canciones) => {
    let tablaCanciones = document.querySelector("#tabla-canciones tbody");
    if (!tablaCanciones) {
        console.error("El tbody de 'tabla-canciones' no se encontró en el DOM.");
        return;
    }

    tablaCanciones.innerHTML = "";

    canciones.forEach(cancion => {
        if (!cancion || !cancion.name || !cancion.genre || !cancion.artist?.name) {
            console.warn("Objeto de canción inválido:", cancion);
            return;
        }

        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${cancion.name}</td>
            <td>${cancion.genre}</td>
            <td>${cancion.artist.name}</td>
            <td>
                <button class="editarCancion">✏️ Editar</button>
                <button class="eliminarCancion">🗑️ Eliminar</button>
            </td>
        `;
        tablaCanciones.appendChild(fila);
    });
};
