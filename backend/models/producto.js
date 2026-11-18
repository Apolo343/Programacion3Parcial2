
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { CATEGORIAS } = require('../config/config');

const Producto = sequelize.define('Producto', {
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false, // columna obligatoria (NOT NULL)
    validate: { notEmpty: true },
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '',
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0.01 }, 
  },
  categoria: {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: { isIn: [Object.keys(CATEGORIAS)] },
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, 
  },
});

module.exports = Producto;
