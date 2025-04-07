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
  };
  