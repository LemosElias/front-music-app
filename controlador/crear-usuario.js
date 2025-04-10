document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnRegistrarUsuario");
    let botonSalir = document.getElementById("buttonSalir");

    if (botonSalir) {
        botonSalir.addEventListener("click", async (evento) => {
          evento.preventDefault();
          mostrarSpinner(true);
          window.location.href = "login.html";
          mostrarSpinner(false);
        });
      }

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto del formulario
            await registrarUsuario(); // Llamar a la función de registro
        });
    } else {
        console.error("El botón con ID 'btnRegistrarUsuario' no se encontró en el DOM.");
    }
});

let isLoading = false;

// Función para mostrar u ocultar el spinner
const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (contenedorSpinner) {
        contenedorSpinner.style.display = mostrar ? 'block' : 'none';
    } else {
        console.error("El elemento con clase 'contenedor-spinner' no existe en el DOM.");
    }
};

/* Ejecuta la llamada al backend para crear un usuario */
let registrarUsuario = async () => {
    let campos = {
        username: document.getElementById("nombre")?.value.trim(),
        password: document.getElementById("contraseña")?.value.trim(),
    };

    let nombreArtistico = document.getElementById("nombreArtistico")?.value.trim();
    
    // Determinar el endpoint según el tipo de usuario
    let endpoint = nombreArtistico ? "http://localhost:8080/Artist" : "http://localhost:8080/Enthusiast";

    // Si el usuario es artista, agregar su nombre artístico
    if (nombreArtistico) {
        campos.artistname = nombreArtistico;
    }

    // Validar que los campos obligatorios no estén vacíos
    if (!campos.username || !campos.password) {
        alert("Por favor completa todos los campos.");
        return;
    }

    console.log("Datos enviados:", JSON.stringify(campos));

    // Mostrar el spinner antes de hacer la petición
    mostrarSpinner(true);
    isLoading = true;

    try {
        const token = localStorage.getItem("token"); // Si el usuario ya está autenticado, agregar el token
        const peticion = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // Incluir token si está disponible
            },
            body: JSON.stringify(campos),
        });

        if (!peticion.ok) {
            const mensajeError = await peticion.text();
            throw new Error(`Error en el registro: ${mensajeError}`);
        }

        console.log(`Registro exitoso como ${nombreArtistico ? "Artista" : "Enthusiast"}.`);
        alert(`Registro exitoso como ${nombreArtistico ? "Artista" : "Enthusiast"}.`);

        window.location.href = "./login.html"; // Redireccionar tras el registro exitoso

    } catch (error) {
        console.error("Error en el registro:", error);
        alert("Hubo un problema al registrar el usuario. Verifique los datos ingresados.");
    } finally {
        // Ocultar el spinner después de que se haya completado la solicitud
        mostrarSpinner(false);
        isLoading = false;
    }
};
