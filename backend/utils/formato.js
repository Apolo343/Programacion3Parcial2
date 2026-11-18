
const ZONA = 'America/Argentina/Buenos_Aires';

function fechaHora(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-AR', { timeZone: ZONA });
}

function soloFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-AR', { timeZone: ZONA });
}

function moneda(numero) {
  return Number(numero || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { fechaHora, soloFecha, moneda, escaparHtml };
