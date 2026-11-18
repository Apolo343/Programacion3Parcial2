
const botonMenu = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
if (botonMenu && menu) {
  botonMenu.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', abierto);
  });
}

const botonRapido = document.getElementById('acceso-rapido');
if (botonRapido) {
  botonRapido.addEventListener('click', () => {
    document.getElementById('email').value = botonRapido.dataset.email;
    document.getElementById('password').value = botonRapido.dataset.password;
  });
}

const modal = document.getElementById('modal-confirmar');
if (modal) {
  const formModal = modal.querySelector('form');
  const textoModal = modal.querySelector('#modal-mensaje');
  const botonConfirmar = modal.querySelector('#modal-confirmar-btn');

  document.querySelectorAll('.js-confirmar').forEach((boton) => {
    boton.addEventListener('click', () => {
      formModal.action = boton.dataset.accion; 
      textoModal.textContent = boton.dataset.mensaje;
      botonConfirmar.className = 'btn ' + (boton.dataset.estilo || 'btn--peligro');
      modal.showModal();
    });
  });

  modal.querySelector('#modal-cancelar').addEventListener('click', () => modal.close());
}

const inputImagen = document.getElementById('imagen');
const vistaPrevia = document.getElementById('vista-previa');
if (inputImagen && vistaPrevia) {
  inputImagen.addEventListener('change', () => {
    const archivo = inputImagen.files[0];
    if (!archivo) return;
    vistaPrevia.src = URL.createObjectURL(archivo);
    vistaPrevia.hidden = false;
  });
}

const btnTema = document.getElementById('btn-tema');
if (btnTema) {
  const pintarBotonTema = () => {
    const oscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
    btnTema.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
  };
  pintarBotonTema();
  btnTema.addEventListener('click', () => {
    window.alternarTema();
    pintarBotonTema();
  });
}
