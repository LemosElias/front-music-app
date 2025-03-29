document.addEventListener("DOMContentLoaded", () => {
    let boton = document.getElementById("btnreguistrar");

    if (boton) {
        boton.addEventListener("click", async (evento) => {
            evento.preventDefault(); // Prevenir el envío por defecto del formulario
            await registrarUsuario(); // Llamar a la función de registro
        });
    } else {
        console.error("El botón con ID 'btnreguistrar' no se encontró en el DOM.");
    }
});

let registrarUsuario = async () => {
    let campos = {};
    campos.username = document.getElementById("nombre").value.trim(); // Ajustado a 'username'
    campos.artistname = document.getElementById("nombreArtistico").value.trim(); // Ajustado a 'artistname'
    campos.password = document.getElementById("contraseña").value.trim(); // Ajustado a 'password'

    // Validar que los campos no estén vacíos
    if (!campos.username || !campos.artistname || !campos.password) {
        alert("Por favor completa todos los campos.");
        return;
    }

    console.log("Datos enviados:", campos); // Imprimir datos en la consola para depuración

    try {
        const peticion = await fetch("http://localhost:8080/Artist", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campos),
        });

        if (peticion.ok) {
            const respuestaTexto = await peticion.text(); // Leer la respuesta como texto
            if (respuestaTexto) {
                const respuesta = JSON.parse(respuestaTexto); // Convertirla a JSON si no está vacía
                console.log("Registro exitoso:", respuesta);
                alert("Registro exitoso.");
            } else {
                console.log("Registro exitoso, pero no hubo respuesta del servidor.");
                alert("Registro exitoso.");
            }
        } else {
            const mensajeError = await peticion.text();
            console.error("Error en el registro:", mensajeError);
            alert("Error: " + mensajeError);
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo conectar con el servidor.");
    }
};

