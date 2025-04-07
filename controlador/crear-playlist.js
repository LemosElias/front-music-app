document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnCrearPlaylist");
  
    if (boton) {
      boton.addEventListener("click", async (evento) => {
        evento.preventDefault();
        mostrarSpinner(true);
        await registrarPlaylist();
        mostrarSpinner(false);
      });
    } else {
      console.error("No se encontró el botón de crear playlist.");
    }
  });
  
  const mostrarSpinner = (mostrar) => {
    const spinner = document.querySelector(".contenedor-spinner");
    if (spinner) {
      spinner.style.display = mostrar ? "flex" : "none";
    }
  };
  
  const registrarPlaylist = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("No tienes autorización para crear una playlist.");
      return;
    }
  
    const nombre = document.getElementById("nombre-playlist")?.value.trim();
  
    if (!nombre) {
      alert("Por favor, ingrese el nombre de la playlist.");
      return;
    }
  
    const data = { name: nombre };
  
    try {
      const respuesta = await fetch("http://localhost:8080/Playlist/playlists/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
  
      const texto = await respuesta.text();
  
      if (respuesta.ok) {
        console.log("Playlist creada:", texto);
        alert("Playlist creada correctamente.");
        // Redirigir o limpiar campos
        document.getElementById("nombre-playlist").value = "";
      } else {
        console.error("Error al crear playlist:", texto);
        alert("Error: " + texto);
      }
    } catch (error) {
      console.error("Error de red o servidor:", error);
      alert("No se pudo conectar con el servidor.");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const cancionesContenedor = document.querySelector('.contenedor-canciones-playlist');
  const cancionesTbody = document.getElementById("canciones-tbody");

  // Asocia el evento a los botones de "Canciones"
  document.querySelectorAll(".btn-canciones").forEach(boton => {
    boton.addEventListener("click", async (e) => {
      const fila = e.target.closest("tr");
      const nombrePlaylist = fila.cells[0].textContent;

      // Podés tener un data-id en la tabla si querés hacerlo bien, por ahora lo obtenemos de una función ficticia
      const playlistId = await obtenerPlaylistIdPorNombre(nombrePlaylist);
      if (!playlistId) {
        alert("No se pudo encontrar el ID de la playlist.");
        return;
      }

      // Cargar canciones
      await cargarCancionesDePlaylist(playlistId);
    });
  });

  // Simula obtener el ID (idealmente lo tenés como data-id en la fila)
  async function obtenerPlaylistIdPorNombre(nombre) {
    try {
      const res = await fetch("http://localhost:8080/playlist/user/misPlaylist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const encontrada = data.find(p => p.name === nombre);
      return encontrada?.id || null;
    } catch (e) {
      console.error("Error buscando la playlist", e);
      return null;
    }
  }

  async function cargarCancionesDePlaylist(playlistId) {
    try {
      const res = await fetch(`http://localhost:8080/playlist/${playlistId}/songs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al cargar canciones");
      const canciones = await res.json();

      cancionesTbody.innerHTML = ""; // Limpiar antes de mostrar nuevas canciones

      canciones.forEach(cancion => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${cancion.name}</td>
          <td>${cancion.genre}</td>
          <td>
            <button class="btn-borrar-cancion" data-playlist-id="${playlistId}" data-song-id="${cancion.id}">Borrar Canción</button>
          </td>
        `;

        cancionesTbody.appendChild(tr);
      });

      cancionesContenedor.style.display = "block";
      agregarEventosBorrar();
    } catch (e) {
      console.error("Error cargando canciones de la playlist", e);
    }
  }

  function agregarEventosBorrar() {
    document.querySelectorAll(".btn-borrar-cancion").forEach(btn => {
      btn.addEventListener("click", async () => {
        const playlistId = btn.getAttribute("data-playlist-id");
        const songId = btn.getAttribute("data-song-id");

        try {
          const res = await fetch(`http://localhost:8080/playlist/${playlistId}/song/${songId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.ok) {
            alert("Canción eliminada.");
            await cargarCancionesDePlaylist(playlistId); // Recargar canciones
          } else {
            alert("Error al eliminar canción.");
          }
        } catch (e) {
          console.error("Error al eliminar la canción", e);
        }
      });
    });
  }
});

  ;
  