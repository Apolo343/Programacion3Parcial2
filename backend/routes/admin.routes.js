
const { Router } = require('express');
const admin = require('../controllers/admin.controller');
const { requireAdminView } = require('../middlewares/auth');
const { subirImagen } = require('../middlewares/upload');
const v = require('../middlewares/validaciones');
const { Producto } = require('../models');
const { ADMIN_DEMO } = require('../config/config');

const router = Router();

router.get('/login', admin.mostrarLogin);
router.post(
  '/login',
  v.validarLogin,
  v.validarVista((req, res, errores) =>
    res.status(400).render('admin/login', {
      error: null,
      errores,
      email: req.body.email || '',
      adminDemo: ADMIN_DEMO,
    })
  ),
  admin.login
);
router.post('/logout', admin.logout);

router.use(requireAdminView);

router.get('/dashboard', admin.dashboard);

router.get('/productos/nuevo', admin.mostrarFormAlta);
router.post(
  '/productos',
  subirImagen,
  v.validarProducto(true),
  v.validarVista((req, res, errores) =>
    admin.renderFormulario(res, { valores: req.body, errores, status: 400 })
  ),
  admin.alta
);

router.get('/productos/:id/editar', v.validarId, v.validar, admin.mostrarFormEditar);
router.post(
  '/productos/:id/editar',
  subirImagen,
  v.validarId,
  v.validarProducto(false),
  v.validarVista(async (req, res, errores) => {
    const producto = await Producto.findByPk(req.params.id);
    admin.renderFormulario(res, { producto, valores: { ...req.body }, errores, status: 400 });
  }),
  admin.editar
);

router.post('/productos/:id/desactivar', v.validarId, v.validar, admin.desactivar);
router.post('/productos/:id/reactivar', v.validarId, v.validar, admin.reactivar);

module.exports = router;
