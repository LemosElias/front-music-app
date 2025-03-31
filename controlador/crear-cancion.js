/* Método para asignar evento al boton de registrar en el formulario crear-usuario.html */
document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnCrearcancion");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto del formulario
            await reguistrarCancion(); // Llamar a la función de registro
        });
    } else {
        console.error("El botón con ID 'btnreguistrar' no se encontró en el DOM.");
    }
});

let isLoading = false;

// Función para mostrar u ocultar el spinner
const mostrarSpinner=(mostrar)=> {
    const contenedorSpinner = document.querySelector('.contenedor-spinner');
    if(mostrar){
        contenedorSpinner.style.display = 'block'; 
    }
    else{
        contenedorSpinner.style.display = 'none'; 
    }
;}

/* Ejecuta la la llamada al backend para crear una cancion */
let reguistrarCancion = async () => {
    let campos = {};
    campos.name = document.getElementById("nombre-cancion").value.trim();
    campos.genre = document.getElementById("genero").value.trim();

     // Validar que los campos no estén vacíos
     if(!campos.name || campos.genre ){
        alert("Por favor complete todos los campos. ")
        return
     }
     console.log("Datos enviados:", campos);
     mostrarSpinner(true);
     isLoading = true;

     try {
        const peticion = await fetch("http://localhost:8080/Artist", { //cambiar por el de createSong//
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campos),
        });
        if (peticion.ok) {
            const respuestaTexto = await peticion.text();
            if (respuestaTexto) {
                const respuesta = JSON.parse(respuestaTexto);
                console.log("Registro exitoso:", respuesta);
                alert("Registro exitoso.");
            } else {
                console.log("Registro exitoso, pero no hubo respuesta del servidor.");
                alert("Registro exitoso.");
            }
            window.location.href = "./login.html";
        } else {
            const mensajeError = await peticion.text();
            console.error("Error en el registro:", mensajeError);
            alert("Error: " + mensajeError);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        // Ocultar el spinner después de que se haya completado la solicitud
        mostrarSpinner(false);
        isLoading = false;
    }
};
