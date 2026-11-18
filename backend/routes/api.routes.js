
const { Router } = require('express');
const productos = require('../controllers/productos.controller');
const ventas = require('../controllers/ventas.controller');
const usuarios = require('../controllers/usuarios.controller');
const { requireAdminApi } = require('../middlewares/auth');
const { subirImagen } = require('../middlewares/upload');
const v = require('../middlewares/validaciones');

const router = Router();

router.get('/productos', v.validarListadoProductos, v.validar, productos.listar);
router.get('/productos/:id', v.validarId, v.validar, productos.obtener);
router.post('/productos', requireAdminApi, subirImagen, v.validarProducto(true), v.validar, productos.crear);
router.put('/productos/:id', requireAdminApi, subirImagen, v.validarId, v.validarProducto(false), v.validar, productos.actualizar);
router.patch('/productos/:id/activo', requireAdminApi, v.validarId, v.validarActivo, v.validar, productos.cambiarEstado);
router.delete('/productos/:id', requireAdminApi, v.validarId, v.validar, productos.desactivar);

router.post('/ventas', v.validarVenta, v.validar, ventas.crear);
router.get('/ventas', requireAdminApi, ventas.listar);
router.get('/ventas/:id', v.validarId, v.validar, ventas.obtener);
router.get('/ventas/:id/ticket.pdf', v.validarId, v.validar, ventas.descargarTicket);

router.post('/usuarios', v.validarUsuario, v.validar, usuarios.crear);


module.exports = router;
