
module.exports = {
  PUERTO: process.env.PORT || 3000,

  SESSION_SECRET: process.env.SESSION_SECRET || 'cambiar-este-secreto-en-produccion',

  EMPRESA: 'LuckyTech',
  ALUMNOS: ['Sebastian Safatle', 'Thiago Perez'],
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500',

  ADMIN_DEMO: {
    nombre: 'Administrador',
    email: 'admin@luckytech.com',
    password: 'Admin1234',
  },

  CATEGORIAS: {
    juegos: 'Juegos',
    perifericos: 'Periféricos',
  },
};
