
const sequelize = require('../config/database');
const Producto = require('./producto');
const Usuario = require('./usuario');
const Venta = require('./venta');
const VentaProducto = require('./ventaProducto');

Venta.belongsToMany(Producto, {
  through: VentaProducto,
  as: 'productos',
  foreignKey: 'ventaId',
  otherKey: 'productoId',
});
Producto.belongsToMany(Venta, {
  through: VentaProducto,
  as: 'ventas',
  foreignKey: 'productoId',
  otherKey: 'ventaId',
});

module.exports = { sequelize, Producto, Usuario, Venta, VentaProducto };
