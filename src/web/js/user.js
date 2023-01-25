class User {
    constructor(id, nombre, apellidos, correo) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos
        this.correo = correo;
    }

    cambiarNombre(nombre) {
        this.nombre = nombre;
    }

    cambiarApellidos(apellidos) {
        this.apellidos = apellidos;
    }

    cambiarCorreo(correo) {
        this.correo = correo;
    }
}