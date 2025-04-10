document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnTogglePlaylists");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault();
            await obtenerPlaylists();
        });
    } else {
        console.error("El botón con ID 'btnTogglePlaylists' no se encontró en el DOM.");
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnListarPlaylists");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault();
            await obtenerPlayListsUsuario();
        });
    } else {
        console.error("El botón con ID 'btnTogglePlaylists' no se encontró en el DOM.");
    }
});
// Función para obtener playlists del servidor y mostrarlas en la tabla
const obtenerPlaylists = async () => {
    if (typeof mostrarSpinner === "function") mostrarSpinner(true);

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuario no autenticado: Token no encontrado.");

        const respuesta = await fetch("http://localhost:8080/Playlist/getPlaylist", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error al obtener playlists: ${respuesta.status} - ${respuesta.statusText}`);
        }

        const datos = await respuesta.json();
        console.log("Playlists recibidas:", datos);

        const playlists = Array.isArray(datos) ? datos : [];

        const tablaBody = document.querySelector("#tabla-playlists tbody");
        tablaBody.innerHTML = "";

        playlists.forEach(playlist => {
            if (!playlist.name ) {
                console.warn("Playlist con datos incompletos:", playlist);
                return;
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${playlist.name}</td>
                <td>${playlist.songCount}</td>
                <td>
                    <button class="editar-playlist" data-id="${playlist.id}">✏️ Editar</button>
                    <button class="eliminar-playlist" data-id="${playlist.id}">🗑️ Eliminar</button>
                    <button class="ver-canciones" data-id="${playlist.id}">🎵 Canciones</button>
                    <button class="btn-agregar-cancion" data-id="${playlist.id}">➕ Agregar Canción</button>
                </td>

            `;
            tablaBody.appendChild(fila);
        });

        // Eventos para editar y eliminar
        document.querySelectorAll(".editar-playlist").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idPlaylist = evento.target.getAttribute("data-id");
                editarPlaylist(idPlaylist);
            });
        });

        document.querySelectorAll(".eliminar-playlist").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idPlaylist = evento.target.getAttribute("data-id");
                eliminarPlaylist(idPlaylist);
            });
        });

        document.querySelectorAll(".ver-canciones").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idPlaylist = evento.target.getAttribute("data-id");
                mostrarCancionesDePlaylist(idPlaylist);
            });
        });
        document.querySelectorAll(".btn-agregar-cancion").forEach(btn => {
            btn.addEventListener("click", () => {
                const playlistId = btn.getAttribute("data-id");
                mostrarCancionesParaAgregar(playlistId);
            });
        });
        

    } catch (error) {
        console.error("Error obteniendo playlists:", error);
        alert("Hubo un problema al obtener las playlists.");
    } finally {
        if (typeof mostrarSpinner === "function") mostrarSpinner(false);
    }
};

const mostrarCancionesParaAgregar = async (playlistId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("No estás autenticado");

    try {
        // Pedimos todas las canciones
            const resTodas = await fetch("http://localhost:8080/songs/getSongs", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
        });

        const dataCanciones = await resTodas.json();

        // 🔍 Esto es para sacar el array interno: songs: [[{...}]]
        const todasLasCanciones = dataCanciones.songs.flat(); // ¡Aplana el array!


        
        // Pedimos los detalles de la playlist (incluye canciones)
        const resPlaylist = await fetch(`http://localhost:8080/Playlist/${playlistId}/songs`, {
            method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
        });
    
        const aux = await resPlaylist.json(); // contiene songs: []
        const cancionesPlaylist = aux.songs || [];
        // Filtramos las canciones que no están en la playlist
        const cancionesEnPlaylistIds = new Set(cancionesPlaylist.map(c => c.id));
        const cancionesParaAgregar = todasLasCanciones.filter(c => !cancionesEnPlaylistIds.has(c.id));

        // Mostramos en tabla
        const contenedor = document.querySelector(".contenedor-canciones-playlist");
        const tbody = document.querySelector("#canciones-tbody");
        tbody.innerHTML = "";

        cancionesParaAgregar.forEach(cancion => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cancion.name}</td>
                <td>${cancion.genre}</td>
                <td>
                    <button class="agregar-cancion" data-playlist-id="${playlistId}" data-cancion-id="${cancion.id}">
                        ➕ Agregar
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        contenedor.style.display = "block";

        // Asignamos eventos a los botones
        document.querySelectorAll(".agregar-cancion").forEach(btn => {
            btn.addEventListener("click", async () => {
                const cancionId = btn.getAttribute("data-cancion-id");

                try {
                    const addRes = await fetch(`http://localhost:8080/Playlist/add/${playlistId}/songs`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ songId: parseInt(cancionId) }) 
                    });

                    if (addRes.ok) {
                        alert("🎶 Canción agregada correctamente.");
                        // Recargamos para actualizar lista
                        mostrarCancionesParaAgregar(playlistId);
                        mostrarCancionesDePlaylist(playlistId);
                        obtenerPlaylists();
                    } else {
                        const msg = await addRes.text();
                        alert("Error al agregar canción: " + msg);
                    }
                } catch (err) {
                    console.error("Error al agregar canción:", err);
                    alert("Error al agregar canción.");
                }
            });
        });

    } catch (error) {
        console.error("Error cargando canciones para agregar:", error);
        alert("Error cargando canciones para agregar.");
    }
};


// Función para editar playlist
const editarPlaylist = async (id) => {
    if (!id) return alert("ID inválido");

    const nuevoNombre = prompt("Ingrese el nuevo nombre de la playlist:").trim();

    if (!nuevoNombre ) {
        return alert("Debe completar ambos campos.");
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado.");

        const respuesta = await fetch(`http://localhost:8080/Playlist/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nuevoNombre
            })
        });

        if (respuesta.ok) {
            alert("Playlist actualizada correctamente.");
            obtenerPlaylists();
        } else {
            const errorMsg = await respuesta.text();
            alert(`Error: ${errorMsg}`);
        }
    } catch (error) {
        console.error("Error al editar playlist:", error);
        alert("Error al editar la playlist.");
    }
};

// Función para eliminar playlist
const eliminarPlaylist = async (id) => {
    if (!id) return alert("ID inválido");

    if (!confirm("¿Estás seguro de eliminar esta playlist?")) return;

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado.");

        const respuesta = await fetch(`http://localhost:8080/Playlist/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (respuesta.status === 201) {
            alert("Playlist eliminada correctamente.");
            obtenerPlaylists();
        } else {
            const mensajeError = await respuesta.text();
            alert(`Error: ${mensajeError}`);
        }
    } catch (error) {
        console.error("Error al eliminar playlist:", error);
        alert("Error al eliminar la playlist.");
    }
};

const mostrarCancionesDePlaylist = async (playlistId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("No estás autenticado");

    try {
        const respuesta = await fetch(`http://localhost:8080/Playlist/${playlistId}/songs`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const respuestaJson = await respuesta.json();
        const canciones = respuestaJson.songs;

        if (!respuesta.ok) throw new Error("No se pudieron obtener las canciones");

        const contenedor = document.querySelector(".contenedor-canciones-playlist");
        const tbody = document.querySelector("#canciones-tbody");

        // Limpiamos tabla
        tbody.innerHTML = "";

        canciones.forEach(cancion => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cancion.name}</td>
                <td>${cancion.genre}</td>
                <td>
                    <button class="borrar-cancion" data-playlist-id="${playlistId}" data-cancion-id="${cancion.id}">
                        ❌ Borrar
                    </button>
                </td>
            `;
            console.log("▶️ Botón generado con playlistId:", playlistId, "cancionId:", cancion.id);
            tbody.appendChild(fila);
        });

        contenedor.style.display = "block";

    } catch (error) {
        console.error("Error cargando canciones:", error);
        alert("Error cargando canciones.");
    }
};

// SOLO SE DEFINE UNA VEZ — NO CAMBIA
document.querySelector("#canciones-tbody").addEventListener("click", async (event) => {
    const btn = event.target.closest(".borrar-cancion");
    if (!btn) return;

    const token = localStorage.getItem("token");
    const cancionId = btn.getAttribute("data-cancion-id");
    const playlistId = btn.getAttribute("data-playlist-id");

    console.log("🗑 Borrando canción:", cancionId, "de playlist:", playlistId);

    if (confirm("¿Eliminar esta canción de la playlist?")) {
        try {
            console.log(`http://localhost:8080/Playlist/${playlistId}/songs/${cancionId}`)
            const deleteRes = await fetch(`http://localhost:8080/Playlist/${playlistId}/songs/${cancionId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (deleteRes.ok) {
                alert("Canción eliminada correctamente.");
                mostrarCancionesDePlaylist(playlistId);
                obtenerPlaylists();
            } else {
                alert("No se pudo eliminar la canción.");
            }
        } catch (err) {
            console.error("Error al borrar canción:", err);
            alert("Error al eliminar canción.");
        }
    }
});


