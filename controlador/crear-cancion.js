document.addEventListener("DOMContentLoaded", () => {
    let botonCrear = document.getElementById("btnCrearcancion");
    let botonListarUsuario = document.getElementById("btnListarMisCanciones");
    let botonListarTodas = document.getElementById("btnListarCanciones");
    let botonFiltrar = document.getElementById("btnFiltrarCanciones"); // Nuevo botón para filtrar
    let botonSalir = document.getElementById("btnSalir");
    
        
      
        if (botonSalir) {
          botonSalir.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            window.location.href = "menu-principal.html";
            mostrarSpinner(false);
          });
        } 
        
   
      
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
            await obtenerCancionesDelUsuario();
            mostrarSpinner(false);
        });
    }

    if (botonListarTodas) {
        botonListarTodas.addEventListener("click", async (evento) => {
            evento.preventDefault();
            mostrarSpinner(true);
            await obtenerCanciones();
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
                    const seccionListarCancion =document.getElementById("listados")
                    if (seccionCrearCancion) {
                        seccionCrearCancion.classList.remove("hidden");
                    }
                    if(seccionListarCancion){
                        seccionListarCancion.classList.remove('hidden');
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
         // Limpiar los campos de búsqueda
         document.getElementById("filtro-artista").value = "";
         document.getElementById("filtro-genero").value = "";
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

