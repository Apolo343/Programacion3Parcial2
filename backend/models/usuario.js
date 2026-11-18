
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    nombre: { type: DataTypes.STRING(60), allowNull: false },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true, 
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false }, 
    rol: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'admin' },
  },
  {
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { conPassword: { attributes: { include: ['password'] } } },
  }
);

module.exports = Usuario;
