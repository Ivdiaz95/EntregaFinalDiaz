
//Declaramos Constantes:
const contenedorProductos = document.getElementById("contenedor-productos");
const carritoLateral = document.getElementById("carritoLateral");
const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const carritoItems = document.getElementById("carrito-items");
const carritoTotal = document.getElementById("carrito-total");
const vaciarCarrito = document.getElementById("vaciarCarrito");
const comprarBtn = document.getElementById("comprar");
const cerrarFormularioBtn = document.getElementById("cerrarFormulario"); // El nuevo botón para cerrar


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

abrirCarrito.addEventListener("click", () => carritoLateral.classList.add("activo"));
cerrarCarrito.addEventListener("click", () => carritoLateral.classList.remove("activo"));
 
// Cargar productos desde JSON
fetch("./DataBase/productos.json")
  .then(res => res.json())
  .then(data => mostrarProductos(data))
  .catch(err => console.error("Error al cargar productos:", err));

// Muestreo de tarjetas de productos productos:
function mostrarProductos(productos) {
  contenedorProductos.innerHTML = "";
  productos.forEach(prod => {

    const div = document.createElement("div");

    div.classList.add("producto");

    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <div class=>
       <h3>${prod.nombre}</h3>
       <p>$${prod.precio}</p>
       <button class="agregar-carrito" data-id="${prod.id}">Agregar al carrito</button>
      </div>
    `;
    contenedorProductos.appendChild(div);
  });

  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const producto = productos.find(p => p.id === id);
      agregarAlCarrito(producto);
    });
  });
}

function agregarAlCarrito(producto) {
  const existe = carrito.find(p => p.id === producto.id);
  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();

  carritoLateral.classList.add("activo")  

}
 
//Carrito nuevo:

// --- Asegúrate de que estas funciones existan en tu código ---
function restarProductoDelCarrito(e) {
    const idProducto = parseInt(e.target.dataset.id);
    const productoExistente = carrito.find((item) => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad--;
        if (productoExistente.cantidad <= 0) {
            // Si la cantidad llega a 0, eliminar el producto del carrito
            carrito = carrito.filter((item) => item.id !== idProducto);
        }
    }
    actualizarCarrito(); // Volver a renderizar el carrito
}

function sumarProductoAlCarrito(e) {
    const idProducto = parseInt(e.target.dataset.id);
    const productoExistente = carrito.find((item) => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad++;
    }
    actualizarCarrito(); // Volver a renderizar el carrito
}
// -----------------------------------------------------------

function actualizarCarrito() {
  carritoItems.innerHTML = ""; // Limpiar el contenido actual del carrito
  let total = 0; // Inicializar el total

  // Si el carrito está vacío
  if (carrito.length === 0) {
    carritoItems.innerHTML = "<p>El carrito está vacío.</p>";
    carritoLateral.classList.remove("activo"); // Ocultar el carrito lateral si está vacío
  } else {
    // Crear y añadir el encabezado de las columnas
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("item-carrito-header");
    headerDiv.innerHTML = `
        <span class="header-controles">Cant.</span>
        <span class="header-producto">Producto</span>
        <span class="header-precio-unidad">P. Unit.</span>
        <span class="header-subtotal">Subtotal</span>
        <span class="header-eliminar"></span> `;
    carritoItems.appendChild(headerDiv);

    // Iterar sobre cada producto en el carrito para mostrarlo
    carrito.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("item-carrito-fila");

      div.innerHTML = `
        <div class="controles-cantidad-prod"> <button class="restar-item" data-id="${prod.id}">-</button>
            <span class="cantidad-display">${prod.cantidad}</span>
            <button class="sumar-item" data-id="${prod.id}">+</button>
        </div>
        <p class="nombre-producto">${prod.nombre}</p> <span class="precio-unidad">$${prod.precio.toFixed(2)}</span>
        <span class="subtotal-producto">$${(prod.precio * prod.cantidad).toFixed(2)}</span>
        <div class="eliminar-columna"> <button class="eliminar-item" data-id="${prod.id}">❌</button>
        </div>
      `;
      carritoItems.appendChild(div);
      total += prod.precio * prod.cantidad; // Sumar al total
    });

    carritoLateral.classList.add("activo"); // Asegurarse de que el carrito lateral esté visible
  }

  carritoTotal.textContent = total.toFixed(2); // Actualizar el total en el DOM
  localStorage.setItem("carrito", JSON.stringify(carrito)); // Guardar el carrito en localStorage

  // Re-asignar event listeners después de crear/recrear los elementos del carrito

  // Listener para el botón de eliminar (LA X) - SIN CONFIRMACIÓN
  document.querySelectorAll(".eliminar-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      carrito = carrito.filter(p => p.id !== id); // Filtrar para eliminar el producto
      actualizarCarrito(); // Volver a renderizar
    });
  });

  // Asignar listeners para los botones de restar y sumar
  document.querySelectorAll(".restar-item").forEach(btn => {
    btn.addEventListener("click", restarProductoDelCarrito);
  });

  document.querySelectorAll(".sumar-item").forEach(btn => {
    btn.addEventListener("click", sumarProductoAlCarrito);
  });
}







//Formulario de venta

vaciarCarrito.addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
  document.querySelector(".formulario").classList.add("oculto");
});

comprarBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("Tu carrito está vacío", "", "info");

    return;
  }
  //oculta carrito
  carritoLateral.classList.remove("activo")  
  // Mostrar formulario
  document.querySelector(".formulario").classList.remove("oculto");

  // Opcional: desplazarse al formulario
  document.querySelector(".formulario").scrollIntoView({ behavior: "smooth" });
});

//Compra finalizada
document.getElementById("form-cliente").addEventListener("submit", function (e) {
  e.preventDefault();

  Swal.fire("¡Gracias por tu compra!", "Nos pondremos en contacto pronto", "success");

  carrito = [];
  actualizarCarrito();

  // Ocultar el formulario de nuevo
  document.querySelector(".formulario").classList.add("oculto");

  // Resetear campos
  this.reset();
});

cerrarFormularioBtn.addEventListener("click", () => {
  document.querySelector(".formulario").classList.add("oculto");
});
