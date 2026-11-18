
(function () {
const venta = Store.getVenta();
if (!venta) {
  // Entró a ticket.html sin haber comprado
  window.location.replace('productos.html');
  return;
}

const numeroCompra = '#' + String(venta.id).padStart(6, '0'); // 42 -> #000042

$('#t-empresa').textContent = CONFIG.EMPRESA;
$('#t-cliente').textContent = venta.nombreCliente;
$('#t-fecha').textContent = fechaHoy();
$('#t-numero').textContent = numeroCompra;
$('#t-total').textContent = formatoPesos(venta.total);

$('#t-lineas').innerHTML = venta.productos
  .map(
    (p) => `
    <tr>
      <td>${escapar(p.nombre)}</td>
      <td class="num">${p.cantidad}</td>
      <td class="num">${formatoPesos(p.precioUnitario)}</td>
      <td class="num">${formatoPesos(p.subtotal)}</td>
    </tr>`
  )
  .join('');

const btnPdf = $('#btn-pdf');
const avisoPdf = $('#aviso-pdf');

btnPdf.addEventListener('click', async () => {
  avisoPdf.hidden = true;
  btnPdf.disabled = true;
  btnPdf.textContent = 'Generando PDF…';
  try {
    const pdf = await Api.descargarTicket(venta.id);
    const url = URL.createObjectURL(pdf);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `ticket-${String(venta.id).padStart(6, '0')}.pdf`;
    enlace.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    avisoPdf.textContent = error.message;
    avisoPdf.hidden = false;
  } finally {
    btnPdf.disabled = false;
    btnPdf.textContent = '⬇ Descargar PDF';
  }
});

function reiniciarSistema() {
  Store.reiniciar();
  window.location.href = 'index.html';
}
$('#btn-nueva').addEventListener('click', reiniciarSistema);
$('#btn-salir').addEventListener('click', reiniciarSistema);
})();
