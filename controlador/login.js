document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("ir-a-registrar").addEventListener("click", function () {
        window.location.href = "./crear-usuario.html";
    });
});


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

/* Crear un metodo para hacer un fetch al login
desarrollado en el backend
*/
const login = async () => {
    let campos = {};
    campos.username = document.getElementById("nombre").value.trim(); // Ajustado a 'username'
    campos.password = document.getElementById("contraseña").value.trim(); // Ajustado a 'password'

    // Validar que los campos no estén vacíos
    if (!campos.username || !campos.password) {
        alert("Por favor completa todos los campos.");
        return;
    }
    console.log("Datos enviados para logni:", campos);
    try {
        const peticion = await fetch("http://localhost:8080/Login");
        window.location.href = "./menu-principal.html";  
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};