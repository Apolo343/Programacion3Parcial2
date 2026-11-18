
function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatoPesos(numero) {
  return Number(numero || 0)
    .toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }); 
}

function urlImagen(ruta) {
  if (!ruta) return 'img/logo.svg';
  return ruta.startsWith('http') ? ruta : CONFIG.BACKEND_URL + ruta;
}

function fechaHoy() {
  return new Date().toLocaleDateString('es-AR');
}

const $ = (selector, contexto = document) => contexto.querySelector(selector);
