
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

async function crear(req, res) {
  const { nombre, email, password } = req.body;

  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    return res.status(409).json({ ok: false, mensaje: 'Ya existe un usuario con ese correo' });
  }

  const hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, password: hash, rol: 'admin' });

  res.status(201).json({
    ok: true,
    mensaje: 'Administrador creado',
    data: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
}

module.exports = { crear };
