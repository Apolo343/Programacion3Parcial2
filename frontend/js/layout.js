
(function () {
  const paginaActual = location.pathname.split('/').pop() || 'index.html';

  const activa = paginaActual;

  const enlaces = [
    { href: 'index.html', texto: 'Inicio' },
    { href: 'productos.html', texto: 'Productos' },
    { href: 'carrito.html', texto: 'Carrito', conContador: true },
  ];

  const nav = enlaces
    .map(
      (e) => `
      <a href="${e.href}" class="${activa === e.href ? 'activo' : ''}">
        ${e.texto}
        ${e.conContador ? '<span class="contador" id="contador-carrito" hidden>0</span>' : ''}
      </a>`
    )
    .join('');

  const header = document.getElementById('app-header');
  if (header) {
    header.className = 'cabecera';
    header.innerHTML = `
      <a class="marca" href="index.html" aria-label="Ir al inicio">
        <img class="logo" src="img/logo.svg" alt="Logo de ${escapar(CONFIG.EMPRESA)}">
        <span>
          <span class="nombre-app">${escapar(CONFIG.EMPRESA)}</span>
          <span class="alumnos">Alumnos: ${escapar(CONFIG.ALUMNOS.join(' · '))}</span>
        </span>
      </a>

      <button class="btn-menu" type="button" id="btn-menu" aria-label="Abrir menú" aria-expanded="false">☰</button>

      <nav class="nav" id="menu" aria-label="Navegación principal">
        ${nav}
        <a class="enlace-admin" href="${CONFIG.BACKEND_URL}/admin/login">Administrador</a>
        <button type="button" class="btn-tema" id="btn-tema" aria-label="Cambiar tema claro u oscuro"></button>
      </nav>`;
  }

  const pie = document.getElementById('app-footer');
  if (pie) {
    pie.className = 'pie';
    pie.innerHTML = `© ${new Date().getFullYear()} ${escapar(CONFIG.EMPRESA)} · Programación III · UTN Avellaneda · ${escapar(CONFIG.ALUMNOS.join(' · '))}`;
  }

  const btnMenu = document.getElementById('btn-menu');
  const menu = document.getElementById('menu');
  if (btnMenu && menu) {
    btnMenu.addEventListener('click', () => {
      const abierto = menu.classList.toggle('abierto');
      btnMenu.setAttribute('aria-expanded', abierto);
    });
  }

  const btnTema = document.getElementById('btn-tema');
  function pintarBotonTema() {
    const oscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
    btnTema.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
  }
  if (btnTema) {
    pintarBotonTema();
    btnTema.addEventListener('click', () => {
      window.alternarTema(); 
      pintarBotonTema();
    });
  }

  function actualizarContador() {
    const contador = document.getElementById('contador-carrito');
    if (!contador) return;
    const total = Store.totalItems();
    contador.textContent = total;
    contador.hidden = total === 0;
  }
  actualizarContador();
  window.addEventListener('carrito:cambio', actualizarContador);
})();
