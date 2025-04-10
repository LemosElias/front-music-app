document.addEventListener("DOMContentLoaded", () => {
    let botonCrear = document.getElementById("btnCrearcancion");
    let botonListarUsuario = document.getElementById("btnListarMisCanciones");
    let botonListarTodas = document.getElementById("btnListarCanciones");
    let botonFiltrar = document.getElementById("btnFiltrarCanciones"); // Nuevo botón para filtrar
    
    if (botonCrear) {
        botonCrear.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await registrarCancion();
            mostrarSpinner(false);
        });
    }

    if (botonListarUsuario) {
        botonListarUsuario.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await listarMisCanciones();
            mostrarSpinner(false);
        });
    }

    if (botonListarTodas) {
        botonListarTodas.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await listarTodasLasCanciones();
            mostrarSpinner(false);
        });
    }

    if (botonFiltrar) {
        botonFiltrar.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await filtrarCanciones();
            mostrarSpinner(false);
        });
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const response = await fetch("http://localhost:8080/Artist/me", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log("Usuario desde endpoint:", userData);

                if (userData.artistname) {
                    const seccionCrearCancion = document.getElementById("crear-cancion");
                    if (seccionCrearCancion) {
                        seccionCrearCancion.classList.remove("hidden");
                    }
                }
            } else {
                console.warn("No se pudo obtener el usuario:", await response.text());
            }
        } catch (error) {
            console.error("Error al obtener el usuario:", error);
        }
    }

    
});
const obtenerCancionesDelUsuario = async () => {
    let token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado.");
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:8080/songs/songs/getUserSongs", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            const mensajeError = await respuesta.text();
            throw new Error(`Error al obtener canciones: ${mensajeError}`);
        }

        const canciones = await respuesta.json();
        console.log("Canciones del usuario:", canciones);
        actualizarTablaCanciones(canciones); // Esta función la tenés que tener definida para renderizar las canciones
    } catch (error) {
        console.error("Error al obtener canciones del usuario:", error);
        alert("No se pudieron obtener las canciones.");
    }
};

// Función para mostrar u ocultar el spinner con verificación de existencia
const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (!contenedorSpinner) {
        console.error("El elemento con clase 'contenedor-spinner' no existe en el DOM.");
        return;
    }
    contenedorSpinner.style.display = mostrar ? 'flex' : 'none';
};

// Función para registrar una nueva canción
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
        alert("Por favor completa todos los campos.");
        mostrarSpinner(false);
        return;
    }

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

        if (respuesta.ok) {
            alert("Canción registrada correctamente.");
            window.location.reload();
        } else {
            console.error("Error en el registro:", await respuesta.text());
            alert("Hubo un error al registrar la canción.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        mostrarSpinner(false);
    }
};

// Función para actualizar la tabla de canciones
const actualizarTablaCanciones = (canciones) => {
    let tablaCanciones = document.querySelector("#tbody-canciones");

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

// Función para filtrar canciones por artista y género (opcional)
const filtrarCanciones = async () => {
    let token = localStorage.getItem("token");
    if (!token) {
        alert("No tienes autorización para filtrar canciones.");
        return;
    }

    let nombreArtista = document.getElementById("filtro-artista")?.value.trim();
    let genero = document.getElementById("filtro-genero")?.value.trim();

    let url = `http://localhost:8080/songs/filter`;
    const params = new URLSearchParams();
    if (nombreArtista) params.append("name", nombreArtista);
    if (genero) params.append("genre", genero);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            console.error("Error al obtener canciones filtradas:", await respuesta.text());
            alert("No se pudieron filtrar las canciones.");
            return;
        }

        const cancionesFiltradas = await respuesta.json();
        console.log("Canciones filtradas obtenidas:", cancionesFiltradas);
        actualizarTablaCanciones(cancionesFiltradas);
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

