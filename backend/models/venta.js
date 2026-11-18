
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
  nombreCliente: { type: DataTypes.STRING(50), allowNull: false },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
});

module.exports = Venta;
