const ESTADO_CARRITO = { 0: "Pago realizado", 1: "Pendiente de pago", 2: "Pendiente de pago (actual)" };
let activeUser
let carrito;

window.onload = () => {
    localStorage.clear();
    if (!localStorage.getItem('carrito')) {
        if (!localStorage.getItem("isLogin") == "true") {
            carrito = new Carrito(Date.now(), new Date().getFormattedDate(), 2, activeUser.id);
            window.localStorage.setItem("carrito", JSON.stringify(carrito));
        } else {
            carrito = new Carrito(Date.now(), new Date().getFormattedDate(), 2)
            window.localStorage.setItem("carrito", JSON.stringify(carrito));
        }
    }
    carritoSerialize(JSON.parse(localStorage.getItem("carrito"))).numeroArticulosTotal()

    if (!localStorage.getItem("isLogin")) {
        localStorage.setItem("isLogin", "false")
    }

    document.getElementById("login_icon").onclick = modalLogin;
    document.getElementById("cart_icon").onclick = verCarrito;

    addRefreshEvents();
    mostrarCategorias();
};


//TIENDA
function mostrarCategorias() {
    request("GET", "categorias", null)
        .then(listadoCategorias => {
            let main = document.getElementById("main");
            main.innerHTML = `<div id="categorias" class="l-columns-3"></div>`;
            let layout = document.getElementById("categorias");

            listadoCategorias.forEach(cat => {
                layout.innerHTML += `<div id="card-${cat.id}" class="c-card">
                                        <div class="c-card__nombre">${cat.nombre.toUpperCase()}</div>
                                        <img src="./assets/img/${cat.nombre}.jpg" class="c-card__imagen" alt="${cat.nombre}" />
                                    </div>`;
            });
            asignarEvento("c-card__imagen", "click", mostrarProductos)
        })
        .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
}

function mostrarProductos(id) {
    request("GET", "productos", null)
        //resolve de la promesa
        .then(listadoProductos => {
            let main = document.getElementById("main");
            main.classList = "c-main c-main--background-dark"
            main.innerHTML = `<div id="products" class="c-products"></div>`;

            let layout = document.getElementById("products");
            let productosCategoriaSeleccionada = listadoProductos.filter(p => p.id_categoria == id);

            productosCategoriaSeleccionada.forEach(p => {
                layout.innerHTML += `<div class="c-item">
                                    <div class="c-item__title l-flex l-flex--align-items-center l-flex--justify-content-center">${p.nombre.toUpperCase()}</div>
                                    <div id="${p.id}" class="c-item__img"></div>
                                    <div  class="c-item__footer l-flex l-flex--align-items-center">
                                        <div id="producto-${p.id}" class="c-item__icon c-item__icon--left">
                                            <i class="c-icon fa-solid fa-circle-info"></i>
                                        </div>
                                        <div class="c-item__price">${p.precio.toFixed(2)} €</div>
                                        <div id="producto-${p.id}" class="c-item__icon c-item__icon--right">
                                            <i class="c-icon c-icon--alternativo fa-solid fa-cart-plus" ></i>
                                        </div>
                                    </div>
                                </div>`;
            });

            let images = layout.getElementsByClassName("c-item__img");
            for (let img of images) {
                let rutaImg = "url('./assets/img/fotosProductos/producto_" + img.id + ".jpg')";
                img.style.backgroundImage = "linear-gradient(to bottom, rgba(255, 255, 255, 0),80%, rgb(227, 219, 206))," + rutaImg;
            }
            asignarEvento("fa-circle-info", "click", mostrarDetalleProducto);
            asignarEvento("fa-cart-plus", "click", anyadirArticulo);
        })
        .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))

}

function mostrarDetalleProducto(idProducto) {
    let dialog = document.getElementById("dialog");
    dialog.close();

    request("GET", "productos", null)
        .then(listadoProductos => {
            let articulo = listadoProductos.find(p => p.id == idProducto);
            dialog.classList = "c-modal c-modal--small detalleProductoModal";
            dialog.innerHTML = `<div class="c-bubble">
                                    <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                                        <div class="c-title">${articulo.nombre.toUpperCase()}</div>
                                        <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                                    </div>
                                    <div class="l-flex l-flex--justify-content-center">
                                        <img src="assets/img/fotosProductos/producto_${articulo.id}.jpg" class="c-img c-img--small">
                                        <div class="c-bubble c-bubble--dark g--margin-horizontal-5 l-flex l-flex--direction-column l-flex--justify-content-space-between">
                                            <div class="c-text">${articulo.descripcion}</div>
                                            <div id="articulo-${articulo.id}" class="l-flex l-flex--justify-content-space-between">
                                                <div class="c-title c-title--alternativo-secundario c-title--medium">${articulo.precio.toFixed(2)} €</div>
                                                <button class="c-button add"><i class="fa-solid fa-cart-plus g--margin-right-4"></i>Añadir</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;

            asignarEvento("add", "click", anyadirArticulo);
            animacionSalidaModal("detalleProductoModal", "c-modal--close");
            dialog.showModal();
        })
        .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
}


//CARRITO
function carritoSerialize(carrito) {
    return new Carrito(carrito.id, carrito.fecha, carrito.estado, carrito.id_usuario, carrito.productos)
}

function verCarrito() {
    carrito = carritoSerialize(JSON.parse(window.localStorage.getItem("carrito")));
    if (carrito.productos.length != 0) {
        carrito.actualizarCarrito()
        window.localStorage.setItem("carrito", JSON.stringify(carrito))
    } else {
        alert("El carrito está vacío.")
    }
}

function anyadirArticulo(id) {
    request("GET", "productos/" + id)
        .then(p => {
            carrito = carritoSerialize(JSON.parse(window.localStorage.getItem("carrito")))
            let nuevoArticulo = {
                "id_producto": p.id,
                "cantidad": 1
            }
            carrito.anyadeArticulo(nuevoArticulo);
            carrito.numeroArticulosTotal()
            window.localStorage.setItem("carrito", JSON.stringify(carrito))
        })
        .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
}


//USUARIO
function userSerialize(user) {
    return new User(user.id, user.nombre, user.apellidos, user.correo)
}

function registrarUsuario() {
    let formData = new FormData(document.forms.formRegistro);
    let newUser = {};
    for (const [key, value] of formData) {
        newUser[key] = value;
    }

    if (!newUser["nombre"] || !newUser["apellidos"] || !newUser["correo"] || !newUser["password"] || !newUser["confirmPassword"]) {
        alert("Por favor rellene todos los campos");
        return;
    }
    if (newUser["password"] !== newUser["confirmPassword"]) {
        alert("Las contraseñas no coinciden");
        return;
    }
    if (!checkPattern("correo", /[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$/)) {
        alert("El formato del correo electrónico debe ser exapmle@example.example", "Formato de datos");
        return;
    }
    console.log(!checkPattern("nombre", /[a-zA-Z\s]+/))
    if (!checkPattern("nombre", /[a-zA-Z\s]+/) || !checkPattern("apellidos", /[a-zA-Z\s]+/)) {
        alert("Tu nombre y apellidos no puede contener números.", "Formato de datos");
        return;
    }

    delete newUser.confirmPassword;

    request("POST", "usuarios", newUser)
        .then((usuario) => {
            registrarInicioSeison(usuario, "Bienvenido " + usuario.nombre + ", te has registrado con éxito!")
        })
        .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
}

function iniciarSesion(e) {
    e.preventDefault();

    let formData = new FormData(document.forms.formLogin);
    let user = {};
    for (const [key, value] of formData) {
        user[key] = value;

    }
    if (!user['usuario'] || !user['password']) {
        alert("Por favor rellene todos los campos");
        return;
    }

    request("GET", "login/" + user.usuario)
        .then(u => {
            let usuario = u[0];
            if (usuario.password == user.password) {
                registrarInicioSeison(usuario, "Bienvenido a EduCafé, " + usuario.nombre + "!")
            } else {
                alert("Contraseña incorrecta")
            }
        })
        .catch(alert("El nombre de usuario es incorrecto."))
}

function registrarInicioSeison(usuario, mensaje) {
    window.localStorage.setItem("isLogin", "true");
    window.localStorage.setItem("user", JSON.stringify(new User(usuario.id, usuario.nombre, usuario.apellidos, usuario.correo)));
    activeUser = userSerialize(JSON.parse(window.localStorage.getItem("user")));

    carrito = carritoSerialize(JSON.parse(window.localStorage.getItem("carrito")))
    carrito.id_usuario = activeUser.id
    window.localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(mensaje, "Bienvenido")
    document.getElementById("dialog").close()
}

function changeLogInInterface(user) {
    let dialog = document.getElementById("dialog");
    dialog.close();

    dialog.classList = "c-modal c-modal--xsmall miCuenta";
    dialog.innerHTML = `<div class="c-bubble">
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                                <div class="c-title c-title--medium">Bienvenido, ${user.nombre}!</div>
                                <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                            </div>
                            <hr class="g--margin-vertical-8 g--color-principal-1">
                            <label class="c-label" for="nombre">Nombre</label>
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between">
                                <input id="nombre" class="c-input c-input--w-90 g--margin-right-3" name="nombre" type="text" value="${user.nombre}">
                                <button class="c-button g--padding-horizontal-2 g--padding-vertical-1"><i class="c-icon c-icon--lighter c-icon--xsmall fa-solid fa-pen-to-square"></i></button>
                            </div>
                            <label class="c-label" for="apellidos">Apellidos</label>
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between">
                                <input id="apellidos" class="c-input c-input--w-90 g--margin-right-3" name="apellidos" type="text" value="${user.apellidos}">
                                <button class="c-button g--padding-horizontal-2 g--padding-vertical-1"><i class="c-icon c-icon--lighter c-icon--xsmall fa-solid fa-pen-to-square"></i></button>
                            </div>
                            <label class="c-label" for="correo">Correo electrónico</label>
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between">
                                <input id="correo" class="c-input c-input--w-90 g--margin-right-3" name="correo" type="text" value="${user.correo}">
                                <button class="c-button g--padding-horizontal-2 g--padding-vertical-1"><i class="c-icon c-icon--lighter c-icon--xsmall fa-solid fa-pen-to-square"></i></button>
                            </div>
                            <hr class="g--margin-vertical-8 g--color-principal-1">
                            <div>
                                <label class="c-label" for="password">Contraseña</label>
                                <input id="password" class="c-input c-input--w-100" type="password" name="password"
                                    placeholder="Escribe su nueva contraseña">
                                <label class="c-label" for="confirmPassword">Confirmar contraseña</label>
                                <input id="confirmPassword" class="c-input c-input--w-100" type="password"
                                    name="confirmPassword" placeholder="Confirme su  nueva contraseña">
                                <div class="l-flex l-flex--justify-content-end">
                                    <button id="cambiarCorreo" class="c-button">Confirmar nueva contraseña</button>
                                </div>
                            </div>
                            <hr class="g--margin-vertical-8 g--color-principal-1">
                            <div id="user-${user.id}" class="l-flex l-flex--align-items-center l-flex--justify-content-center g--margin-bottom-4">
                                <div class="historialCarritos l-flex l-flex--align-items-center l-flex--justify-content-left g--margin-1">
                                    <i class="c-icon c-icon--2xl fa-solid fa-bars"></i>
                                    <div class="c-title c-title--xl c-title--left">Historial de carritos</div>
                                </div>
                                <div class="historialPagos l-flex l-flex--align-items-center l-flex--justify-content-left g--margin-1">
                                    <i class="c-icon c-icon--2xl fa-solid fa-file-invoice-dollar"></i>
                                    <div class="c-title c-title--xl c-title--left">Historial de pagos</div>
                                </div>
                            </div>
                            <hr class="g--margin-vertical-8 g--color-principal-1">
                            <button id="cerrarSesion" class="c-button">Cerrar sesión</button>
                        </div>`;
    animacionSalidaModal("miCuenta", "c-modal--close");
    asignarEvento("historialCarritos", "click", historialCarritos);
    asignarEvento("historialPagos", "click", historialPagos);
    document.getElementById("cerrarSesion").onclick = cerrarSesion;
    dialog.showModal()
}

function cerrarSesion() {
    request("GET", "carritoActual/" + activeUser.id, null)
        .then(c => {
            request("PATCH", "carritos/" + c[0].id, { "estado": 1 }).then(() => {
                localStorage.clear();
                location.reload();
            })
        })

}

function historialCarritos(id_usuario) {
    let dialog = document.getElementById("dialog");
    dialog.close()

    //Añadimos el encabezado del modal a la etiqueta dialog
    dialog.classList = "c-modal c-modal--large historialCarritoModal";
    let html = `<div id='modalHistorialCarrito' class='c-bubble'>
                    <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                        <div class="c-title">Listado carritos</div>
                        <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                    </div>`;


    request("GET", "historial_carritos/" + id_usuario, null)
        .then(carritos => {
            Array.from(carritos).forEach(carrito => {
                html += `<div class="c-cart-list l-flex l-flex--align-items-center">
                            <div id="cartList-${carrito.id}" class="c-cart-list__title-cart">
                                <i class="c-icon c-icon--small fa-solid fa-eye"></i>
                                Carrito ${carrito.id}
                            </div>
                            <div class="c-cart-list__item c-cart-list__item--right">${ESTADO_CARRITO[carrito.estado]}</div>`;
                if (carrito.estado != 0) {
                    html += `
                            <div id="cartPay-${carrito.id}" class="c-cart-list__item">
                                <button class="c-button pagar">Pagar</button>
                            </div>
                            <div id="cartRecuperar-${carrito.id}" class="c-cart-list__item">
                                <button class="c-button recuperar">Recuperar</button>
                            </div>
                            <div id="cartDelete-${carrito.id}" class="c-cart-list__item">
                                <button class="c-button c-button--danger borrar">Borrar</button>
                            </div>`;
                };
                html += `</div>`
            });
            dialog.innerHTML = html;

            //Asignamos las respectivas funciones a los botones de los carritos
            asignarEvento("fa-eye", "click", verDetalleCarrito, "carritos");
            asignarEvento("pagar", "click", modalPago);
            asignarEvento("recuperar", "click", recuperarCarrito);
            asignarEvento("borrar", "click", confirmarBorrar);

            //Añadimos la animación de salida al modal
            animacionSalidaModal("historialCarritoModal", "c-modal--close");
            dialog.showModal();
        }).catch(alert("No tienes ningún carrito guardado", "Aviso"));
}

function historialPagos(id_usuario) {
    let dialog = document.getElementById("dialog");
    dialog.close()

    //Añadimos el encabezado del modal a la etiqueta dialog
    dialog.classList = "c-modal c-modal--small pagosHistorial";
    let html = `<div id='modalHistorialCarrito' class='c-bubble'>
                    <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                        <div class="c-title">Historial Pagos</div>
                        <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                    </div>
                    <div class="c-bubble">
                       <div class="c-cart-row c-cart-row--bold c-cart-row--4-columns">
                           <div>Id</div>
                           <div>Nombre Tarjeta</div>
                           <div>Numero Tarjeta</div>
                           <div>Id Carrito</div>
                    </div>`

    request("GET", "historial_pagos/" + id_usuario, null)
        .then(pagos => {
            Array.from(pagos).forEach(pago => {
                html += `<div class="c-cart-list c-cart-row c-cart-row--4-columns">
                            <div id="cartList-${pago.id_carrito}" class="c-cart-list__title-cart">
                                <i class="c-icon c-icon--small fa-solid fa-eye"></i>
                                Pago ${pago.id}</b>
                            </div>
                            <div class="c-cart-list__item">${pago.nombreTarjeta}</div>
                            <div class="c-cart-list__item">**** ${pago.numeroTarjeta.substring(pago.numeroTarjeta.length - 4, pago.numeroTarjeta.length)}</div>
                            <div class="c-cart-list__item">${pago.id_carrito}</div>
                        </div>`
            });
            dialog.innerHTML = html;

            animacionSalidaModal("pagosHistorial", "c-modal--close");
            asignarEvento("fa-eye", "click", verDetalleCarrito, "pago")
            dialog.showModal();
        }).catch(alert("No tienes ningún pago realizado", "Aviso"));
}

function verDetalleCarrito(carritoId, volver) {
    let dialog = document.getElementById("dialog");
    dialog.close();

    //Añadimos las clases y la estructura básica del carrito en el contenedor dialog
    dialog.classList = "c-modal c-modal--medium detalleCarritoModal";
    let htmlCarritoDetalle = `<div class="c-bubble">
                                    <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                                        <div class="c-title">Carrito ${carritoId}</div>
                                        <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark volverHistorial"></i>
                                    </div>
                                    <div class="c-cart-row c-cart-row--bold c-cart-row--6-columns">
                                        <div></div>
                                        <div>Nombre</div>
                                        <div>Descripción</div>
                                        <div>Precio</div>
                                        <div>Unidades</div>
                                        <div>Total</div>
                                    </div>`

    //Hacemos la petición para obtener los datos del carrito
    request("GET", "carritos/" + carritoId, null)
        .then(carrito => {
            //Llamamos al método que devuelve los productos
            getProductsDetalleCarrito(carrito.productos)
                .then(response => {
                    let htmlProductos = response[0];
                    let precioTotal = response[1];
                    htmlCarritoDetalle += htmlProductos
                    htmlCarritoDetalle += `	    <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-vertical-8">
                                                <div class="c-title">Importe: ${precioTotal.toFixed(2)}€</div>
                                                <div id="detalleCarrito-${carrito.id}" class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-vertical-8"></div>
                                            </div>
                                       </div>`;

                    // Pintamos el html
                    dialog.innerHTML = htmlCarritoDetalle;

                    // Añadimos los botones en los carritos pendientes de pago
                    if (carrito.estado != 0) {
                        document.getElementById("detalleCarrito-" + carrito.id).innerHTML = `<div class="pagarDetalleCarrito c-cart-list__item"><button class="c-button">Pagar</button></div>
                                                                                         <div class="recuperarDetalleCarrito c-cart-list__item"><button class="c-button">Recuperar</button></div>
                                                                                         <div class="borrarDetalleCarrito c-cart-list__item"><button class="c-button c-button--danger">Borrar</button></div>`;
                    }

                    //Asignamos los eventos a los botones
                    asignarEvento("pagarDetalleCarrito", "click", modalPago);
                    asignarEvento("recuperarDetalleCarrito", "click", recuperarCarrito);
                    asignarEvento("borrarDetalleCarrito", "click", confirmarBorrar);
                    if (volver == "pago") {
                        document.getElementsByClassName("volverHistorial")[0].addEventListener("click", () => historialPagos(activeUser.id));
                    } else {
                        document.getElementsByClassName("volverHistorial")[0].addEventListener("click", () => historialCarritos(activeUser.id));
                    }


                    dialog.showModal();
                });
        });
}

async function getProductsDetalleCarrito(productos) {
    let htmlProductos = "";
    let precioTotal = 0
    for (const product of productos) {
        let p = await request("GET", "productos/" + product.id_producto)
        htmlProductos += `<div class="c-cart-row c-cart-row--6-columns">
                            <img src="./assets/img/fotosProductos/producto_${p.id}.jpg" class="c-cart-row__img">
                            <div>${p.nombre}</div>
                            <div>${p.descripcion}</div>
                            <div>${p.precio.toFixed(2)}€</div>
                            <div>${product.cantidad}</div>
                            <div>${(p.precio * product.cantidad).toFixed(2)}€</div>
                        </div>`;
        precioTotal += p.precio * product.cantidad;
    }
    return [htmlProductos, precioTotal];
}

function realizarPago(carritoId) {
    let formData = new FormData(document.forms.formPago);
    let newPay = {};
    for (const [key, value] of formData) {
        newPay[key] = value;
    }
    if (!newPay["nombreTarjeta"] || !newPay["numeroTarjeta"] || !newPay["mesTarjeta"] || !newPay["anyoTarjeta"] || !newPay["codigoSeguridad"]) {
        alert("Por favor rellene todos los campos", "Datos incorrectos");
        return;
    } else if (!checkPattern("nombreTarjeta", /[a-zA-Z\s]$/)) {
        alert("El formato del nombre de la tarjeta es incorrecto, no puede contener números o carácteres especiales.", "Formato de datos");
        return;
    } else if (!checkPattern("numeroTarjeta", /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/)) {
        alert("El formato del número de tarejeta es incorrecto, debe seguir el formato XXXX-XXXX-XXXX-XXXX.", "Formato de datos");
        return;
    } else if (!checkPattern("codigoSeguridad", /[0-9]{3}/)) {
        alert("El formato deL código de seguridad es incorrecto, deben ser 3 números.", "Formato de datos");
        return;
    } else {
        newPay.fechaCaducidad = newPay.mesTarjeta + "/" + newPay.anyoTarjeta
        newPay.id_carrito = carritoId;
        newPay.id_usuario = activeUser.id;
        delete newPay.mesTarjeta;
        delete newPay.anyoTarjeta;
        request("POST", "pagos", newPay)
            .then(request("PATCH", "carritos/" + carritoId, { "estado": 0 })
                .then(() => {
                    document.getElementById("dialog").close();

                    carrito = new Carrito(Date.now(), new Date().getFormattedDate(), 2, activeUser.id);
                    window.localStorage.setItem("carrito", JSON.stringify(carrito));
                    carrito.numeroArticulosTotal()

                    alert("El pago del carrito con id " + carritoId + " se ha realizado correctamente");
                })
                .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR")))
            .catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
    }
}

function recuperarCarrito(carritoId) {
    //Petición para recuperar el carrito actual (devuelve un array)
    request("GET", "carritoActual/" + activeUser.id, null)
        .then(c => {
            //Con el id, localizamos del array el carrito actual y modificamos su estado para que deje de ser el actual
            request("PATCH", "carritos/" + c[0].id, { "estado": 1 })
                .then(() => {
                    //Petición para marcar como actual el carrito seleccionado por el usuario
                    request("PATCH", "carritos/" + carritoId, { "estado": 2 })
                        .then(() => {
                            //Vaciamos el carrito
                            c.productos = [];

                            window.localStorage.setItem("carrito", JSON.stringify(c));

                            //Pintamos el nuevo carrito
                            pintarCarritoRecuperado(carritoId);
                        })
                        .catch(e => console.log(e));
                })
                .catch(e => console.log(e));
        })
        .catch(() => {
            //Petición para cuando no existe un carrito actual
            request("PATCH", "carritos/" + carritoId, { "estado": 2 })
                .then(() => pintarCarritoRecuperado(carritoId))
                .catch(e => console.log(e));
        });
}

function pintarCarritoRecuperado(carritoId) {
    //Petición para recuperar el carrito seleccionado por el usuario
    request("GET", "carritos/" + carritoId, null)
        .then(carritoActual => {
            console.log(carritoActual);
            carritoActual.productos.forEach(p => {
                // carrito = carritoSerialize(JSON.parse(window.localStorage.getItem("carrito")));
                carrito = carritoSerialize(carritoActual);
                let nuevoArticulo = {
                    "id_producto": p.id_producto,
                    "cantidad": p.cantidad--
                }
                carrito.anyadeArticulo(nuevoArticulo);
                window.localStorage.setItem("carrito", JSON.stringify(carrito));
                carrito.actualizarCarrito();
            })
        })
        .catch(e => console.log(e));
}

function confirmarBorrar(carritoId) {
    confirmar(carritoId);
}

function borrarCarrito(carritoId) {
    request("DELETE", "carritos/" + carritoId, null)
        .then(res => {
            carrito = new Carrito(Date.now(), new Date().getFormattedDate(), 2, activeUser.id);
            window.localStorage.setItem("carrito", JSON.stringify(carrito));
            carrito.numeroArticulosTotal();
            historialCarritos(activeUser.id);
        })
        .catch(e => console.log(e));
}