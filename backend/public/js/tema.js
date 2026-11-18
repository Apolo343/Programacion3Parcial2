
(function () {
  const CLAVE = 'tema';

  function temaInicial() {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch (e) { /* localStorage bloqueado: seguimos con el valor por defecto */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }

  document.documentElement.setAttribute('data-tema', temaInicial());

  window.alternarTema = function () {
    const nuevo = document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.setAttribute('data-tema', nuevo);
    try { localStorage.setItem(CLAVE, nuevo); } catch (e) { /* ignorar */ }
    return nuevo;
  };
})();
