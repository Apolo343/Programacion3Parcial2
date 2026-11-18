
const { body, param, query, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { CATEGORIAS } = require('../config/config');
const { CARPETA_UPLOADS } = require('./upload');

const CLAVES_CATEGORIA = Object.keys(CATEGORIAS);

function borrarArchivoSubido(req) {
  if (req.file) {
    fs.unlink(path.join(CARPETA_UPLOADS, req.file.filename), () => {});
  }
}

function validar(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();
  borrarArchivoSubido(req);
  return res.status(400).json({
    ok: false,
    mensaje: 'Hay datos inválidos',
    errores: Object.fromEntries(
      Object.entries(errores.mapped()).map(([campo, e]) => [campo, e.msg])
    ),
  });
}

function validarVista(renderizar) {
  return (req, res, next) => {
    const errores = validationResult(req);
    if (errores.isEmpty()) return next();
    borrarArchivoSubido(req);
    const simples = Object.fromEntries(
      Object.entries(errores.mapped()).map(([campo, e]) => [campo, e.msg])
    );
    return renderizar(req, res, simples);
  };
}


const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
];

const validarListadoProductos = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit debe estar entre 1 y 50'),
  query('categoria')
    .optional()
    .isIn(CLAVES_CATEGORIA)
    .withMessage('categoria debe ser: ' + CLAVES_CATEGORIA.join(' o ')),
];

/**
 * @param {boolean} imagenObligatoria 
 */
const validarProducto = (imagenObligatoria) => [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),
  body('categoria')
    .isIn(CLAVES_CATEGORIA).withMessage('Elegí una categoría válida'),
  body('imagen').custom((valor, { req }) => {
    if (imagenObligatoria && !req.file) throw new Error('La imagen es obligatoria');
    return true;
  }),
];

const validarActivo = [
  body('activo').isBoolean().withMessage('activo debe ser true o false'),
];

const validarVenta = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres')
    .matches(/^[\p{L} ]+$/u).withMessage('El nombre solo puede contener letras y espacios'),
  body('items').isArray({ min: 1 }).withMessage('El carrito no puede estar vacío'),
  body('items.*.productoId').isInt({ min: 1 }).withMessage('productoId inválido'),
  body('items.*.cantidad')
    .isInt({ min: 1, max: 99 }).withMessage('La cantidad debe ser un entero entre 1 y 99'),
];

const validarUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 60 }).withMessage('El nombre es demasiado largo'),
  body('email').trim().toLowerCase().isEmail().withMessage('Ingresá un correo válido'),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Za-z]/).withMessage('La contraseña debe incluir al menos una letra')
    .matches(/\d/).withMessage('La contraseña debe incluir al menos un número'),
];

const validarLogin = [
  body('email').trim().toLowerCase().isEmail().withMessage('Ingresá un correo válido'),
  body('password').notEmpty().withMessage('Ingresá la contraseña'),
];

module.exports = {
  validar,
  validarVista,
  validarId,
  validarListadoProductos,
  validarProducto,
  validarActivo,
  validarVenta,
  validarUsuario,
  validarLogin,
};
