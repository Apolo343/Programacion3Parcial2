
const fs = require('fs');
const path = require('path');
const { Producto } = require('../models');
const { CARPETA_UPLOADS } = require('../middlewares/upload');

function borrarImagenDelServidor(rutaPublica) {
  if (!rutaPublica || !rutaPublica.startsWith('/uploads/')) return;
  const archivo = path.join(CARPETA_UPLOADS, path.basename(rutaPublica));
  fs.unlink(archivo, () => {}); // si no existe, ignoramos el error
}

async function crear({ nombre, descripcion, precio, categoria }, file) {
  return Producto.create({
    nombre,
    descripcion,
    precio: Number(precio),
    categoria,
    imagen: '/uploads/' + file.filename,
    activo: true,
  });
}

async function actualizar(id, { nombre, descripcion, precio, categoria }, file) {
  const producto = await Producto.findByPk(id);
  if (!producto) return null;

  const cambios = { nombre, descripcion, precio: Number(precio), categoria };
  if (file) {
    borrarImagenDelServidor(producto.imagen); 
    cambios.imagen = '/uploads/' + file.filename;
  }
  return producto.update(cambios);
}

async function cambiarEstado(id, activo) {
  const producto = await Producto.findByPk(id);
  if (!producto) return null;
  return producto.update({ activo });
}

module.exports = { crear, actualizar, cambiarEstado };
