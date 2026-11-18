
const { sequelize, Venta, Producto, VentaProducto } = require('../models');
const { generarPdf, numeroCompra } = require('../services/ticketPdf.service');

const redondear = (n) => Math.round(n * 100) / 100;

function formatearVenta(venta) {
  const productos = (venta.productos || []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    imagen: p.imagen,
    cantidad: p.VentaProducto.cantidad,
    precioUnitario: p.VentaProducto.precioUnitario,
    subtotal: redondear(p.VentaProducto.cantidad * p.VentaProducto.precioUnitario),
  }));
  return {
    id: venta.id,
    nombreCliente: venta.nombreCliente,
    fecha: venta.fecha,
    total: venta.total,
    productos,
  };
}

async function crear(req, res) {
  const { nombre, items } = req.body;

  const cantidades = new Map(); 
  for (const item of items) {
    const id = Number(item.productoId);
    cantidades.set(id, (cantidades.get(id) || 0) + Number(item.cantidad));
  }
  const ids = [...cantidades.keys()];

 
  const productos = await Producto.findAll({ where: { id: ids, activo: true } });
  if (productos.length !== ids.length) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Alguno de los productos no existe o ya no está disponible',
    });
  }

  const ventaId = await sequelize.transaction(async (t) => {
    const venta = await Venta.create({ nombreCliente: nombre.trim(), total: 0 }, { transaction: t });

    let total = 0;
    for (const producto of productos) {
      const cantidad = cantidades.get(producto.id);
      await VentaProducto.create(
        {
          ventaId: venta.id,
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precio, 
        },
        { transaction: t }
      );
      total += producto.precio * cantidad;
    }

    await venta.update({ total: redondear(total) }, { transaction: t });
    return venta.id;
  });

  const venta = await Venta.findByPk(ventaId, { include: [{ model: Producto, as: 'productos' }] });
  res.status(201).json({ ok: true, mensaje: 'Compra registrada', data: formatearVenta(venta) });
}

async function listar(req, res) {
  const ventas = await Venta.findAll({
    include: [{ model: Producto, as: 'productos' }], 
    order: [['fecha', 'DESC']],
  });
  res.json({ ok: true, data: ventas.map(formatearVenta) });
}

async function obtener(req, res) {
  const venta = await Venta.findByPk(req.params.id, {
    include: [{ model: Producto, as: 'productos' }],
  });
  if (!venta) return res.status(404).json({ ok: false, mensaje: 'Venta no encontrada' });
  res.json({ ok: true, data: formatearVenta(venta) });
}

async function descargarTicket(req, res) {
  const venta = await Venta.findByPk(req.params.id, {
    include: [{ model: Producto, as: 'productos' }],
  });
  if (!venta) return res.status(404).json({ ok: false, mensaje: 'Venta no encontrada' });
  const pdf = await generarPdf(formatearVenta(venta));
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="ticket-${numeroCompra(venta.id).slice(1)}.pdf"`,
    'Content-Length': pdf.length,
  });
  res.send(pdf);
}

module.exports = { crear, listar, obtener, descargarTicket };
