
const form = $('#form-bienvenida');
const inputNombre = $('#nombre');
const errorNombre = $('#error-nombre');
const campoNombre = $('#campo-nombre');
const aviso = $('#aviso');

if (new URLSearchParams(location.search).get('aviso') === 'nombre') {
  aviso.textContent = 'Primero ingresá tu nombre para poder ver los productos.';
  aviso.hidden = false;
}

inputNombre.value = Store.getNombre();
inputNombre.addEventListener('input', () => {
  inputNombre.value = inputNombre.value.replace(/[^\p{L} ]/gu, '');
});

const REGEX_NOMBRE = /^[\p{L} ]{2,50}$/u;

function validar(nombre) {
  if (!nombre) return 'Ingresá tu nombre para continuar.';
  if (!REGEX_NOMBRE.test(nombre)) return 'Usá solo letras (entre 2 y 50 caracteres).';
  return '';
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = inputNombre.value.trim().replace(/\s+/g, ' ');
  const mensaje = validar(nombre);

  errorNombre.textContent = mensaje;
  campoNombre.classList.toggle('con-error', Boolean(mensaje));
  if (mensaje) {
    inputNombre.focus();
    return;
  }

  Store.setNombre(nombre);
  window.location.href = 'productos.html'; 
});
