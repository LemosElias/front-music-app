

/* Método para asignar evento al boton ingresar */
document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnIngresar");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); 
            await login();
        });
    } else {
        console.error("Error login");
    }
});

const mostrarSpinner = (mostrar) => {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if (mostrar) {
        contenedorSpinner.style.display = 'flex'; 
    } else {
        contenedorSpinner.style.display = 'none'; 
    }
};

const login = async () => {
    let campos = {};
    campos.username = document.getElementById("nombre").value.trim();
    campos.password = document.getElementById("contraseña").value.trim();

    if (!campos.username || !campos.password) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        // Mostrar el spinner antes de hacer la petición
        mostrarSpinner(true);

        const peticion = await fetch("http://localhost:8080/Artist/auth", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campos),
        });

        if (peticion.ok) {
            const token = await peticion.text();
            localStorage.setItem('token', token);
            alert("Autenticación exitosa.");
            window.location.href = "./menu-principal.html"; // Redirigir a la página principal
        } else {
            alert("Credenciales incorrectas.");
        }
    
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        // Ocultar el spinner después de que se haya completado la solicitud
        mostrarSpinner(false);
    }
};