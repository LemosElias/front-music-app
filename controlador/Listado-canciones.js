document.addEventListener("DOMContentLoaded", async () => {
    await obtenerCanciones(); // Se ejecuta automáticamente al cargar la página
});
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
document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnListarMisCanciones");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto
            await obtenerCancionesDelUsuario(); // Llamar a la función para obtener canciones
        });
    } else {
        console.error("El botón con ID 'btnListarMisCanciones' no se encontró en el DOM.");
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
        
        const tablaBody = document.querySelector("#tabla-canciones tbody");
        tablaBody.innerHTML = "";

        canciones.forEach(cancion => {
            if (!cancion.id || !cancion.name || !cancion.genre || !cancion.artist) {
                console.warn("Canción con datos incompletos:", cancion);
                return;
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cancion.name}</td>
                <td>${cancion.genre}</td>
                <td>${cancion.artist.name}</td>
                <td>
                    <button class="editar" data-id="${cancion.id}">✏️ Editar</button>
                    <button class="eliminar" data-id="${cancion.id}">🗑️ Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

        document.querySelectorAll(".editar").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idCancion = evento.target.getAttribute("data-id");
                editarCancion(idCancion);
            });
        });

        document.querySelectorAll(".eliminar").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idCancion = evento.target.getAttribute("data-id");
                eliminarCancion(idCancion);
            });
        });
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
// **Función para obtener canciones del servidor y agregarlas a la tabla**
const obtenerCanciones = async () => {
    if (typeof mostrarSpinner === "function") mostrarSpinner(true); // Activar spinner

    try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            throw new Error("Usuario no autenticado: Token no encontrado.");
        }

        const respuesta = await fetch("http://localhost:8080/songs/getSongs", { 
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error al obtener canciones: ${respuesta.status} - ${respuesta.statusText}`);
        }

        const datos = await respuesta.json();
        console.log("Datos recibidos:", datos); 

        const canciones = datos.songs && Array.isArray(datos.songs) ? datos.songs[0] : [];
        if (!Array.isArray(canciones)) {
            throw new Error("El formato de la respuesta del servidor no es válido.");
        }

        // Limpiar tabla y agregar canciones
        const tablaBody = document.querySelector("#tabla-canciones tbody");
        tablaBody.innerHTML = "";

        canciones.forEach(cancion => {
            if (!cancion.id || !cancion.name || !cancion.genre || !cancion.artist) {
                console.warn("Canción con datos incompletos:", cancion);
                return;
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cancion.name}</td>
                <td>${cancion.genre}</td>
                <td>${cancion.artist.name}</td>
                <td>
                    <button class="editar" data-id="${cancion.id}">✏️ Editar</button>
                    <button class="eliminar" data-id="${cancion.id}">🗑️ Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

        document.querySelectorAll(".editar").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idCancion = evento.target.getAttribute("data-id");
                editarCancion(idCancion);
            });
        });

        document.querySelectorAll(".eliminar").forEach(boton => {
            boton.addEventListener("click", (evento) => {
                const idCancion = evento.target.getAttribute("data-id");
                eliminarCancion(idCancion);
            });
        });

    } catch (error) {
        console.error("Error obteniendo canciones:", error);
        alert("Hubo un problema al obtener las canciones. Verifique la respuesta del servidor.");
    } finally {
        if (typeof mostrarSpinner === "function") mostrarSpinner(false);
    }
};

// **Función para editar canción**
const editarCancion = async (id) => {
    if (!id) {
        alert("Error: ID inválido.");
        return;
    }

    const nuevoNombre = prompt("Ingrese el nuevo nombre de la canción:").trim();
    const nuevoGenero = prompt("Ingrese el nuevo género de la canción:").trim();
    
    if (!nuevoNombre || !nuevoGenero) {
        alert("Debe proporcionar nombre y género para actualizar la canción.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuario no autenticado: Token no encontrado.");

        const respuesta = await fetch(`http://localhost:8080/songs/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nuevoNombre,
                genre: nuevoGenero
            })
        });

        if (respuesta.status === 200) {
            alert("Canción actualizada correctamente.");
            obtenerCanciones(); 
        } else {
            const mensajeError = await respuesta.text();
            alert(`Error: ${mensajeError}`);
        }

    } catch (error) {
        console.error("Error al actualizar la canción:", error);
        alert("Hubo un problema al actualizar la canción.");
    }
};

// **Función para eliminar canción**
const eliminarCancion = async (id) => {
    if (!id) {
        alert("Error: ID inválido.");
        return;
    }

    if (!confirm("¿Estás seguro de eliminar esta canción?")) return;

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Usuario no autenticado: Token no encontrado.");

        const respuesta = await fetch(`http://localhost:8080/songs/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.status === 204) {
            alert("Canción eliminada correctamente.");
            obtenerCanciones(); 
        }
        if(respuesta.status === 403){
            alert("Debes quitar la cancion de la playlist antes");
            obtenerCanciones(); 
        }else {
            const mensajeError = await respuesta.text();
            alert(`Error: ${mensajeError}`);
        } 

    } catch (error) {
        console.error("Error eliminando canción:", error);
        alert("Hubo un problema al eliminar la canción.");
    }
};
