
const { Producto } = require('../models');
const productosService = require('../services/productos.service');

const esAdmin = (req) => Boolean(req.session && req.session.admin);

async function listar(req, res) {
  const pagina = parseInt(req.query.page, 10) || 1;
  const porPagina = parseInt(req.query.limit, 10) || 6;

  const where = {};
  if (req.query.categoria) where.categoria = req.query.categoria;
  if (!(req.query.incluirInactivos === 'true' && esAdmin(req))) where.activo = true;

  const { count, rows } = await Producto.findAndCountAll({
    where,
    limit: porPagina,
    offset: (pagina - 1) * porPagina,
    order: [['id', 'ASC']],
  });

  res.json({
    ok: true,
    data: rows,
    paginacion: {
      paginaActual: pagina,
      porPagina,
      totalItems: count,
      totalPaginas: Math.max(1, Math.ceil(count / porPagina)),
    },
  });
}

async function obtener(req, res) {
  const producto = await Producto.findByPk(req.params.id);
  // Un producto inactivo solo lo puede ver un admin
  if (!producto || (!producto.activo && !esAdmin(req))) {
    return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
  }
  res.json({ ok: true, data: producto });
}

async function crear(req, res) {
  const producto = await productosService.crear(req.body, req.file);
  res.status(201).json({ ok: true, mensaje: 'Producto creado', data: producto });
}

async function actualizar(req, res) {
  const producto = await productosService.actualizar(req.params.id, req.body, req.file);
  if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
  res.json({ ok: true, mensaje: 'Producto modificado', data: producto });
}

async function cambiarEstado(req, res) {
  const activo = req.body.activo === true || req.body.activo === 'true';
  const producto = await productosService.cambiarEstado(req.params.id, activo);
  if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
  res.json({ ok: true, mensaje: activo ? 'Producto reactivado' : 'Producto desactivado', data: producto });
}

async function desactivar(req, res) {
  const producto = await productosService.cambiarEstado(req.params.id, false);
  if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
  res.json({ ok: true, mensaje: 'Producto dado de baja (baja lógica)', data: producto });
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, desactivar };
