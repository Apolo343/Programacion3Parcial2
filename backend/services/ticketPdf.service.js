// Genera el ticket en PDF en el servidor con Puppeteer: arma el ticket como HTML y lo "imprime" a PDF con Chrome.
const puppeteer = require('puppeteer');
const { EMPRESA } = require('../config/config');
const { fechaHora, moneda, escaparHtml } = require('../utils/formato');

// Abrir Chrome tarda, así que se abre una sola vez y se reutiliza en cada pedido
let navegador = null;

async function obtenerNavegador() {
  if (!navegador) {
    const esRootLinux = typeof process.getuid === 'function' && process.getuid() === 0;
    navegador = puppeteer.launch({
      headless: true,
      args: esRootLinux ? ['--no-sandbox', '--disable-setuid-sandbox'] : [], // Chrome no arranca como root con sandbox
    });
    navegador.then((b) => b.on('disconnected', () => { navegador = null; })).catch(() => { navegador = null; });
  }
  return navegador;
}

function numeroCompra(id) {
  return '#' + String(id).padStart(6, '0'); // 42 -> #000042
}

// Todo dato que viene de la base pasa por escaparHtml
function armarHtml(venta) {
  const filas = venta.productos
    .map(
      (p) => `
      <tr>
        <td>${escaparHtml(p.nombre)}</td>
        <td class="num">${p.cantidad}</td>
        <td class="num">${moneda(p.precioUnitario)}</td>
        <td class="num">${moneda(p.subtotal)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #111; margin: 0; font-size: 12px; }
  h1 { text-align: center; margin: 0; font-size: 26px; }
  .sub { text-align: center; margin: 4px 0 18px; font-size: 14px; color: #444; }
  .meta p { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { text-align: left; border-bottom: 2px solid #111; padding: 6px 4px; }
  td { padding: 6px 4px; border-bottom: 1px solid #ddd; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .total { display: flex; justify-content: space-between; margin-top: 14px; font-size: 16px; font-weight: bold; }
  .gracias { text-align: center; margin-top: 26px; font-size: 13px; }
</style>
</head>
<body>
  <h1>${escaparHtml(EMPRESA)}</h1>
  <p class="sub">Ticket de compra</p>
  <div class="meta">
    <p><strong>Cliente:</strong> ${escaparHtml(venta.nombreCliente)}</p>
    <p><strong>Fecha:</strong> ${escaparHtml(fechaHora(venta.fecha))}</p>
    <p><strong>N° de compra:</strong> ${numeroCompra(venta.id)}</p>
  </div>
  <table>
    <thead><tr><th>Producto</th><th class="num">Cant.</th><th class="num">P. unit.</th><th class="num">Subtotal</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="total"><span>TOTAL</span><span>${moneda(venta.total)}</span></div>
  <p class="gracias">¡Gracias por tu compra!</p>
</body>
</html>`;
}

// Recibe la venta ya formateada (formatearVenta) y devuelve un Buffer con el PDF
async function generarPdf(venta) {
  const browser = await obtenerNavegador();
  const pagina = await browser.newPage();
  try {
    await pagina.setContent(armarHtml(venta), { waitUntil: 'load' });
    const pdf = await pagina.pdf({
      format: 'A5',
      printBackground: true,
      margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await pagina.close();
  }
}

// Cierra Chrome (lo usa el servidor al apagarse)
async function cerrarNavegador() {
  if (navegador) {
    const b = await navegador;
    navegador = null;
    await b.close();
  }
}

module.exports = { generarPdf, cerrarNavegador, numeroCompra };
