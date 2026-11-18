
const bcrypt = require('bcryptjs');
const { Usuario, Producto } = require('../models');
const productosService = require('../services/productos.service');
const { CATEGORIAS, ADMIN_DEMO } = require('../config/config');

// ------------------------------ LOGIN ------------------------------

function mostrarLogin(req, res) {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { error: null, errores: {}, email: '', adminDemo: ADMIN_DEMO });
}

async function login(req, res, next) {
  const { email, password } = req.body;

  // .scope('conPassword') -> incluye el hash (el defaultScope lo oculta)
  const usuario = await Usuario.scope('conPassword').findOne({ where: { email } });
  // bcrypt.compare hashea lo ingresado y lo compara con el hash guardado
  const passwordOk = usuario ? await bcrypt.compare(password, usuario.password) : false;

  if (!passwordOk) {
    return res.status(401).render('admin/login', {
      error: 'Correo o contraseña incorrectos',
      errores: {},
      email,
      adminDemo: ADMIN_DEMO,
    });
  }

  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.admin = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
    res.redirect('/admin/dashboard');
  });
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

// ---------------------------- DASHBOARD ----------------------------

async function dashboard(req, res) {
  const productos = await Producto.findAll({ order: [['id', 'ASC']] });

  const porCategoria = {};
  Object.keys(CATEGORIAS).forEach((clave) => {
    porCategoria[clave] = productos.filter((p) => p.categoria === clave);
  });

  res.render('admin/dashboard', { porCategoria, categorias: CATEGORIAS, mensaje: req.query.msg || null });
}

// ----------------------- ALTA / MODIFICACIÓN -----------------------

function renderFormulario(res, { producto = null, valores = {}, errores = {}, status = 200 }) {
  res.status(status).render('admin/producto-form', {
    esEdicion: Boolean(producto),
    producto,
    valores, 
    errores,
    categorias: CATEGORIAS,
  });
}

function mostrarFormAlta(req, res) {
  renderFormulario(res, {});
}

async function alta(req, res) {
  await productosService.crear(req.body, req.file);
  res.redirect('/admin/dashboard?msg=Producto agregado correctamente');
}

async function mostrarFormEditar(req, res) {
  const producto = await Producto.findByPk(req.params.id);
  if (!producto) return res.status(404).render('error', { codigo: 404, mensaje: 'Producto no encontrado' });
  renderFormulario(res, { producto, valores: producto.toJSON() });
}

async function editar(req, res) {
  const producto = await productosService.actualizar(req.params.id, req.body, req.file);
  if (!producto) return res.status(404).render('error', { codigo: 404, mensaje: 'Producto no encontrado' });
  res.redirect('/admin/dashboard?msg=Cambios guardados correctamente');
}

// --------------------- BAJA LÓGICA / REACTIVAR ---------------------

async function desactivar(req, res) {
  await productosService.cambiarEstado(req.params.id, false);
  res.redirect('/admin/dashboard?msg=Producto desactivado');
}

async function reactivar(req, res) {
  await productosService.cambiarEstado(req.params.id, true);
  res.redirect('/admin/dashboard?msg=Producto reactivado');
}

module.exports = {
  mostrarLogin,
  login,
  logout,
  dashboard,
  renderFormulario,
  mostrarFormAlta,
  alta,
  mostrarFormEditar,
  editar,
  desactivar,
  reactivar,
};
