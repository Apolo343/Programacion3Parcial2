
(function () {
if (!Store.requerirNombre()) return; 

const lista = $('#lista');
const pieCarrito = $('#pie-carrito');
const avisoCarrito = $('#aviso');
const modal = $('#modal-confirmar');
const botonAceptar = $('#modal-aceptar');

$('#saludo').textContent = `Cliente: ${Store.getNombre()}`;

function pintar() {
  const carrito = Store.getCarrito();

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="vacio tarjeta">
        <p>Tu carrito está vacío.</p>
        <a class="btn" href="productos.html">Ir a ver productos</a>
      </div>`;
    pieCarrito.hidden = true;
    return;
  }

  lista.innerHTML = carrito
    .map(
      (l) => `
      <article class="linea">
        <img src="${escapar(urlImagen(l.imagen))}" alt="${escapar(l.nombre)}">
        <div class="linea__info">
          <div>
            <div class="linea__nombre">${escapar(l.nombre)}</div>
            <div class="linea__precio">${formatoPesos(l.precio)} c/u</div>
          </div>
          <div class="stepper">
            <button type="button" data-accion="quitar" data-id="${l.id}" aria-label="Quitar una unidad">−</button>
            <span>${l.cantidad}</span>
            <button type="button" data-accion="agregar" data-id="${l.id}" aria-label="Agregar una unidad">+</button>
          </div>
          <div class="linea__subtotal">${formatoPesos(l.precio * l.cantidad)}</div>
          <button type="button" class="btn btn--sec btn--chico" data-accion="eliminar" data-id="${l.id}">Eliminar</button>
        </div>
      </article>`
    )
    .join('');

  $('#total').textContent = formatoPesos(Store.total());
  pieCarrito.hidden = false;
}

lista.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const linea = Store.getCarrito().find((l) => l.id === id);

  if (boton.dataset.accion === 'agregar' && linea) Store.agregar(linea); 
  if (boton.dataset.accion === 'quitar') Store.quitar(id); 
  if (boton.dataset.accion === 'eliminar') Store.eliminar(id); 
});

$('#btn-vaciar').addEventListener('click', () => Store.vaciar());


$('#btn-confirmar').addEventListener('click', () => {
  avisoCarrito.hidden = true;
  const items = Store.totalItems();
  $('#modal-detalle').textContent =
    `Vas a comprar ${items} ${items === 1 ? 'producto' : 'productos'} por un total de ${formatoPesos(Store.total())}.`;
  modal.showModal(); 
});

$('#modal-cancelar').addEventListener('click', () => modal.close());

botonAceptar.addEventListener('click', async () => {
  botonAceptar.disabled = true; 
  botonAceptar.textContent = 'Procesando…';
  try {
    const { data: venta } = await Api.crearVenta(Store.getNombre(), Store.getCarrito());
    Store.setVenta(venta); 
    Store.vaciar();
    window.location.href = 'ticket.html';
  } catch (error) {
    modal.close();
    avisoCarrito.textContent = error.message;
    avisoCarrito.hidden = false;
    botonAceptar.disabled = false;
    botonAceptar.textContent = 'Confirmar';
  }
});

window.addEventListener('carrito:cambio', pintar);
pintar();
})();
