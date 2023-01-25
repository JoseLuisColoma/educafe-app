function modalLogin() {
    let dialog = document.getElementById("dialog");
    dialog.close();
    if (localStorage.getItem("isLogin") == "true") {
        activeUser = userSerialize(JSON.parse(window.localStorage.getItem("user")))
        changeLogInInterface(activeUser);
    } else {
        dialog.classList = "c-modal c-modal--medium loginModal"
        dialog.innerHTML = `<div>
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-end g--margin-bottom-5">
                            <i class="c-icon c-icon--small c-icon--close-light fa-sharp fa-solid fa-xmark close"></i>
                            </div>
                        </div>
                        <div class="l-columns">
                            <form id="formLogin" class="c-bubble">
                                <div class="c-title">Inicio de sesión</div>
                                <label class="c-label" for="usuario">Email</label>
                                <input id="usuario" class="c-input c-input--w-100" name="usuario" type="text"
                                    placeholder="Escribe aquí tu correo">

                                <label class="c-label" for="password">Contraseña</label>
                                <input id="password" class="c-input c-input--w-100" name="password" type="password"
                                    placeholder="Escribe aquí tu contraseña">
                                <div class="g--text-align-center">
                                    <button id="botonInicioSesion" class="c-button g--margin-top-10" type="submit">Inicia sesión</button><br>
                                    <button class="c-button c-button--principal-terciario g--margin-top-2">¿Has olvidado tu contraseña?</button>
                                </div>
                            </form>
                           
                            <div class="g--text-align-center">
                                <div class="c-title c-title--alternativo">Bienvenido/a a</div>
                                <img src="./assets/img/EducaCafe-2-08.png" alt="educafe_logo" class="c-img">
                                <div>
                                    <button class="c-button c-button--alternativo-terciario g--margin-bottom-2">¿No tienes cuenta? Regístrate</button><br>
                                    <button id="registro" class="c-button c-button--secundario">Regístrarse</button>
                                </div>
                            </div>
                        </div>`;

        animacionSalidaModal("loginModal", "c-modal--close");
        document.getElementById("registro").onclick =  modalRegistro;
        document.getElementById("formLogin").onsubmit = (event) => iniciarSesion(event);
        dialog.showModal();
    }
}

function modalRegistro() {
    let dialog = document.getElementById("dialog");
    dialog.close();

    dialog.classList = "c-modal c-modal--xsmall registroModal";
    dialog.innerHTML = `<div class="c-bubble">
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                                <div class="c-title">Formulario de registro</div>
                                <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                            </div>
                            <form id="formRegistro">
                                <label class="c-label" for="nombre">Nombre</label>
                                <input id="nombre" class="c-input c-input--w-100" name="nombre" type="text"
                                    placeholder="Escribe tu nombre">

                                <label class="c-label" for="apellidos">Apellidos</label>
                                <input id="apellidos" class="c-input c-input--w-100" type="text" name="apellidos"
                                    placeholder="Escribe tus apellidos">

                                <label class="c-label" for="correo">Correo electrónico</label>
                                <input id="correo" class="c-input c-input--w-100" name="correo" type="text"
                                    placeholder="Escribe tu correo electrónico">

                                <label class="c-label" for="password">Contraseña</label>
                                <input id="password" class="c-input c-input--w-100" type="password" name="password"
                                    placeholder="Escribe tu contraseña">

                                <label class="c-label" for="confirmPassword">Confirmar contraseña</label>
                                <input id="confirmPassword" class="c-input c-input--w-100" type="password"
                                    name="confirmPassword" placeholder="Confirma tu contraseña">
                            </form>
                            <div class="g--text-align-right g--margin-top-10">
                                <button id="botonRegistro" class="c-button">Confirmar registro</button>
                            </div>
                        </div>`;
    document.getElementById("botonRegistro").onclick = registrarUsuario;
    animacionSalidaModal("registroModal", "c-modal--close");
    dialog.showModal();
}

function modalPago(id_carrito) {
    let dialog = document.getElementById("dialog");
    dialog.close();

    dialog.classList = "c-modal c-modal--xsmall pagoModal";
    dialog.innerHTML =  `<div class="c-bubble">
                            <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                                <div class="c-title">Formulario de pago</div>
                                <i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
                            </div>
                            <form id="formPago" onsubmit="return false;">
                                <label class="c-label" for="nombreTarjeta">Nombre de la Tarjeta</label>
                                <input id="nombreTarjeta" class="c-input c-input--w-100" name="nombreTarjeta" type="text" size="47"
                                    placeholder="Tal y como aparece en la tarjeta">
                            
                                <label class="c-label" for="numeroTarjeta">Número de la Tarjeta</label>
                                <input id="numeroTarjeta" class="c-input c-input--w-100" name="numeroTarjeta" type="text" size="47"
                                    placeholder="XXXX-XXXX-XXXX-XXXX">
                            
                                <div class="l-flex l-flex--justify-content-space-between">
                                    <div>
                                        <label class="c-label display--block" for="fecha">Fecha de caducidad</label>
                                        <input class="c-input display--inline-block" id="mesTarjeta" type="text" maxlength="2" size="4"
                                            name="mesTarjeta" placeholder="MM">
                                        <input class="c-input display--inline-block" id="anyoTarjeta" type="text" maxlength="2" size="4"
                                            name="anyoTarjeta" placeholder="YY">
                                    </div>
                                    <div>
                                        <label class="c-label" for="codigoSeguridad">Código</label>
                                        <input class="c-input" id="codigoSeguridad" type="text" maxlength="3" size="6" name="codigoSeguridad"
                                            placeholder="3 dígitos">
                                    </div>
                                </div>
                                <label class="c-label">Formas de pago válidas:</label>
                                <div class="c-icon--lighter">
                                    <i class="fa-brands fa-cc-visa fa-3x"></i>
                                    <i class="fa-brands fa-cc-mastercard fa-3x"></i>
                                    <i class="fa-brands fa-cc-paypal fa-3x"></i>
                                    <i class="fa-brands fa-cc-apple-pay fa-3x"></i>
                                    <i class="fa-brands fa-cc-amazon-pay fa-3x"></i>
                                </div>
                                <div id="carrito-${id_carrito}" class="g--text-align-right g--margin-top-10">
                                    <button class="c-button confirmarPago">Confirmar pago</button>
                                </div>
                            </form>
                        </div>`;

    animacionSalidaModal("pagoModal", "c-modal--close");
    asignarEvento("confirmarPago", "click", realizarPago)
    dialog.showModal();
}

function confirmar(carritoId) {
    let dialog = document.getElementById("confirmacion");
    dialog.close();

    dialog.classList = "c-modal c-modal--xxsmall confirmacionModal";
    dialog.innerHTML =  `<div class="c-bubble">
                        <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between">
                                <div class="c-title c-title--medium">Eliminar</div>
                        </div>
                        <div class="g--text-align-center g--margin-7">
                            <i class="c-icon c-icon--grey c-icon--big fa-solid fa-trash-can"></i>
                            <div class="c-text c-text--principal-bold c-text--xl c-text--center">¿Desea eliminar el carrito con id ${carritoId}?</div>
                        </div>
                        <div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
                            <button id="botonAceptar" class="c-button">Eliminar</button>
                            <button id="botonCancelar" class="c-button close">Cancelar</button>
                        </div>`;
                        
    document.getElementById("botonAceptar").onclick = () => {borrarCarrito(carritoId);dialog.close()};
    animacionSalidaModal("confirmacionModal", "c-modal--close");
    dialog.showModal();
}