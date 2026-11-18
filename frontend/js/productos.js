
(function () {
if (!Store.requerirNombre()) return; 

const elGrilla = $('#grilla');
const elPaginacion = $('#paginacion');
const elPestanas = $('#pestanas');
const elAviso = $('#aviso');
const barra = $('#barra-carrito');

$('#saludo').textContent = `Hola, ${Store.getNombre()}. Elegí lo que quieras y agregalo al carrito.`;

const claves = Object.keys(CONFIG.CATEGORIAS);
const catUrl = new URLSearchParams(location.search).get('cat');
let categoria = claves.includes(catUrl) ? catUrl : claves[0];
let pagina = 1;
let productosPagina = []; 

function pintarPestanas() {
  elPestanas.innerHTML = claves
    .map(
      (clave) => `
      <button type="button" class="pestana" role="tab" data-cat="${clave}"
              aria-selected="${clave === categoria}">${escapar(CONFIG.CATEGORIAS[clave])}</button>`
    )
    .join('');
}

elPestanas.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-cat]');
  if (!boton || boton.dataset.cat === categoria) return;
  categoria = boton.dataset.cat;
  pagina = 1;
  pintarPestanas();
  cargar();
});

function tarjeta(p) {
  const cantidad = Store.cantidadDe(p.id);

  const controles =
    cantidad > 0
      ? `<div class="stepper" aria-label="Cantidad en el carrito">
           <button type="button" data-accion="quitar" data-id="${p.id}" aria-label="Quitar una unidad">−</button>
           <span>${cantidad}</span>
           <button type="button" data-accion="agregar" data-id="${p.id}" aria-label="Agregar una unidad">+</button>
         </div>`
      : `<button type="button" class="btn" data-accion="agregar" data-id="${p.id}">Agregar al carrito</button>`;

  return `
    <article class="producto">
      <img src="${escapar(urlImagen(p.imagen))}" alt="${escapar(p.nombre)}" loading="lazy">
      <div class="producto__cuerpo">
        <h3 class="producto__nombre">${escapar(p.nombre)}</h3>
        <p class="producto__desc">${escapar(p.descripcion)}</p>
        <span class="producto__precio">${formatoPesos(p.precio)}</span>
        <div class="producto__acciones">
          ${controles}
        </div>
      </div>
    </article>`;
}

function pintarGrilla() {
  elGrilla.innerHTML = productosPagina.length
    ? productosPagina.map(tarjeta).join('')
    : '<p class="vacio">No hay productos disponibles en esta categoría.</p>';
}

elGrilla.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const producto = productosPagina.find((p) => p.id === id);
  if (!producto) return;

  if (boton.dataset.accion === 'agregar') Store.agregar(producto);
  else Store.quitar(id);
});

function pintarPaginacion(info) {
  const { paginaActual, totalPaginas } = info;
  if (totalPaginas <= 1) {
    elPaginacion.innerHTML = '';
    return;
  }
  let numeros = '';
  for (let i = 1; i <= totalPaginas; i++) {
    numeros += `<button type="button" data-pagina="${i}" ${i === paginaActual ? 'aria-current="page"' : ''}>${i}</button>`;
  }
  elPaginacion.innerHTML = `
    <button type="button" data-pagina="${paginaActual - 1}" ${paginaActual === 1 ? 'disabled' : ''}>← Anterior</button>
    ${numeros}
    <button type="button" data-pagina="${paginaActual + 1}" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente →</button>`;
}

elPaginacion.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-pagina]');
  if (!boton || boton.disabled) return;
  pagina = Number(boton.dataset.pagina);
  cargar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

async function cargar() {
  elAviso.hidden = true;
  elGrilla.innerHTML = '<p class="cargando">Cargando productos…</p>';
  try {
    const { data, paginacion } = await Api.listarProductos({ categoria, pagina });
    productosPagina = data;
    pintarGrilla();
    pintarPaginacion(paginacion);
  } catch (error) {
    elGrilla.innerHTML = '';
    elPaginacion.innerHTML = '';
    elAviso.textContent = error.message;
    elAviso.hidden = false;
  }
}

function pintarBarra() {
  const items = Store.totalItems();
  barra.hidden = items === 0;
  $('#barra-resumen').textContent = `${items} ${items === 1 ? 'producto' : 'productos'} · ${formatoPesos(Store.total())}`;
}

window.addEventListener('carrito:cambio', () => {
  pintarGrilla();
  pintarBarra();
});

pintarPestanas();
pintarBarra();
cargar();
})();
