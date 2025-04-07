document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnListarPlaylists");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault();
            await obtenerPlaylists();
        });
    } else {
        console.error("El botón con ID 'btnListarPlaylists' no se encontró en el DOM.");
    }
});

// Función para obtener playlists del servidor y mostrarlas en la tabla
const obtenerPlaylists = async () => {
    if (typeof mostrarSpinner === "function") mostrarSpinner(true);

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuario no autenticado: Token no encontrado.");

        const respuesta = await fetch("http://localhost:8080/playlists/getAll", {
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
            if (!playlist.id || !playlist.name || !playlist.description) {
                console.warn("Playlist con datos incompletos:", playlist);
                return;
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${playlist.name}</td>
                <td>${playlist.description}</td>
                <td>${Array.isArray(playlist.songs) ? playlist.songs.length : 0}</td>
                <td>
                    <button class="editar-playlist" data-id="${playlist.id}">✏️ Editar</button>
                    <button class="eliminar-playlist" data-id="${playlist.id}">🗑️ Eliminar</button>
                    <button class="ver-canciones" data-id="${playlist.id}">🎵 Canciones</button>
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
        

    } catch (error) {
        console.error("Error obteniendo playlists:", error);
        alert("Hubo un problema al obtener las playlists.");
    } finally {
        if (typeof mostrarSpinner === "function") mostrarSpinner(false);
    }
};


// Función para editar playlist
const editarPlaylist = async (id) => {
    if (!id) return alert("ID inválido");

    const nuevoNombre = prompt("Ingrese el nuevo nombre de la playlist:").trim();
    const nuevaDescripcion = prompt("Ingrese la nueva descripción:").trim();

    if (!nuevoNombre || !nuevaDescripcion) {
        return alert("Debe completar ambos campos.");
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token no encontrado.");

        const respuesta = await fetch(`http://localhost:8080/playlists/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nuevoNombre,
                description: nuevaDescripcion
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

        const respuesta = await fetch(`http://localhost:8080/playlists/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (respuesta.status === 204) {
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
// Mostrar canciones de una playlist
const mostrarCancionesDePlaylist = async (playlistId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("No estás autenticado");

    try {
        const respuesta = await fetch(`http://localhost:8080/playlist/${playlistId}/songs`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!respuesta.ok) throw new Error("No se pudieron obtener las canciones");

        const canciones = await respuesta.json();

        const contenedor = document.querySelector(".contenedor-canciones-playlist");
        const tbody = document.querySelector("#canciones-tbody");

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
            tbody.appendChild(fila);
        });

        contenedor.style.display = "block";

        // Agregar eventos a los botones de borrar canción
        document.querySelectorAll(".borrar-cancion").forEach(btn => {
            btn.addEventListener("click", async () => {
                const cancionId = btn.getAttribute("data-cancion-id");
                const playlistId = btn.getAttribute("data-playlist-id");

                if (confirm("¿Eliminar esta canción de la playlist?")) {
                    try {
                        const deleteRes = await fetch(`http://localhost:8080/playlist/${playlistId}/song/${cancionId}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        if (deleteRes.ok) {
                            alert("Canción eliminada correctamente.");
                            mostrarCancionesDePlaylist(playlistId); // recarga las canciones
                        } else {
                            alert("No se pudo eliminar la canción.");
                        }
                    } catch (err) {
                        console.error("Error al borrar canción:", err);
                        alert("Error al eliminar canción.");
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error cargando canciones:", error);
        alert("Error cargando canciones.");
    }
};
