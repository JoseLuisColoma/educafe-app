class Carrito {
	constructor(id, fecha, estado = null, id_usuario = null, productos = []) {
		this.id = id;
		this.fecha = fecha;
		this.estado = estado;
		this.id_usuario = id_usuario;
		this.productos = productos;
	}

	anyadeArticulo(articulo) {
		let posicion = this.productos.findIndex(e => e.id_producto == articulo.id_producto);
		if (posicion >= 0) {
			this.productos[posicion].cantidad++
		} else {
			this.productos.push(articulo);
		}
	}

	borraArticulo(id_producto) {
		let posicion = this.productos.findIndex(e => e.id_producto == id_producto)
		this.productos.splice(posicion, 1);
		this.actualizarCarrito();
	}

	modificaUnidades(id_producto, n) {
		let posicion = this.productos.findIndex(e => e.id_producto == id_producto)
		if (n == "suma") {
			this.productos[posicion].cantidad++
		} else if (n == "resta" && this.productos[posicion].cantidad > 1) {
			this.productos[posicion].cantidad--
		} else {
			this.borraArticulo(id_producto);
		}
		this.actualizarCarrito();
		this.numeroArticulosTotal();
	}

	actualizarCarrito() {
		if (this.productos != 0) {
			let dialog = document.getElementById("dialog");
			dialog.classList = "c-modal c-modal--large carritoModal";
			let htmlCarrito = ` <div class="c-bubble">
									<div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-bottom-5">
										<div class="c-title">Carrito ${this.id}</div>
										<i class="c-icon c-icon--close fa-sharp fa-solid fa-xmark close"></i>
									</div>
									<div class="c-cart-row c-cart-row--bold">
										<div></div>
										<div>Nombre</div>
										<div>Descripción</div>
										<div>Precio</div>
										<div>Unidades</div>
										<div>Total</div>
										<div></div>
									</div>`;

			this.getProducts().then(response => {
				let htmlProductos = response[0];
				let precioTotal = response[1];
				htmlCarrito += htmlProductos
				htmlCarrito += `	<div class="l-flex l-flex--align-items-center l-flex--justify-content-space-between g--margin-vertical-8">
										<div class="c-title">Importe: ${precioTotal.toFixed(2)}€</div>
										<button id="confirmarCarrito" class="c-button">Confirmar carrito</button>
									</div>
								</div`;
				dialog.innerHTML = htmlCarrito;
				animacionSalidaModal("carritoModal", "c-modal--close");


				Array.from(document.getElementsByClassName("mas")).forEach(boton => boton.addEventListener("click", () => { this.modificaUnidades(boton.parentNode.parentNode.id.split("-")[1], "suma") }))
				Array.from(document.getElementsByClassName("menos")).forEach(boton => boton.addEventListener("click", () => { this.modificaUnidades(boton.parentNode.parentNode.id.split("-")[1], "resta") }))
				Array.from(document.getElementsByClassName("eliminar")).forEach(boton => boton.addEventListener("click", () => { this.borraArticulo(boton.parentNode.parentNode.id.split("-")[1]) }))
				document.getElementById("confirmarCarrito").onclick = () => {
					if (localStorage.getItem("isLogin") == "true") {
						request("GET", "carritos/" + this.id, null)
							.then(() => {
								request("PUT", "carritos/" + this.id, this)
									.then(() => {
										alert("El carrito con id " + this.id + " ha sido guardado correctamente", "Aviso")
										modalPago(this.id);
									})
									.catch(alert("No se ha podido guardar el carrito correctamente.", "ERROR"))
							})
							.catch(() => {
								request("POST", "carritos", this)
									.then(() => {
										alert("El carrito con id " + this.id + " ha sido guardado correctamente", "Aviso")
										modalPago(this.id);
									})
									.catch(alert("No se ha podido guardar el carrito correctamente.", "ERROR"))
							})

					} else {
						document.getElementById("dialog").close()
						alert("Es necesario estar registrado para realizar esta operación.", "Registrate")
					}
				}

				if (!dialog.open) {
					dialog.showModal();
				}
			}).catch(e => alert("La operación no se ha podido completar. (" + e.statusCode + " - " + e.statusText + ")", "ERROR"))
		} else {
			dialog.close();
		}
	}

	numeroArticulosTotal() {
		let numProductos = 0;

		this.productos.forEach(element => {
			numProductos += element.cantidad;
		});
		let burbuja = document.getElementById("cart_menu_num");
		burbuja.innerHTML = numProductos;
		burbuja.classList = "c-icon__burbuja c-icon--xsmall";
	}



	async getProducts() {
		let htmlProductos = "";
		let precioTotal = 0
		for (const product of this.productos) {
			let p = await request("GET", "productos/" + product.id_producto)
			htmlProductos += `<div class="c-cart-row" id="row-${p.id}">
								<img src="./assets/img/fotosProductos/producto_${p.id}.jpg" class="c-cart-row__img">
								<div>${p.nombre}</div>
								<div>${p.descripcion}</div>
								<div>${p.precio.toFixed(2)}€</div>
								<div>${product.cantidad}</div>
								<div>${(p.precio * product.cantidad).toFixed(2)}€</div>
								<div>
									<button class="c-button mas" >+</button>
									<button class="c-button menos">-</button>
									<button class="c-button c-button--terciario eliminar">Eliminar</button>
								</div>
							</div>`;
			precioTotal += p.precio * product.cantidad;
		}
		return [htmlProductos, precioTotal];
	}
}