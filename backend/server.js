
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const config = require('./config/config');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/api.routes');
const adminRoutes = require('./routes/admin.routes');
const { fechaHora, soloFecha, moneda } = require('./utils/formato');
const { cerrarNavegador } = require('./services/ticketPdf.service');

const app = express();

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: config.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }, 
  })
);

fs.mkdirSync(path.join(__dirname, 'public', 'uploads'), { recursive: true });
app.use(express.static(path.join(__dirname, 'public')));

app.locals.empresa = config.EMPRESA;
app.locals.alumnos = config.ALUMNOS;
app.locals.frontendUrl = config.FRONTEND_URL;
app.locals.fechaHora = fechaHora;
app.locals.soloFecha = soloFecha;
app.locals.moneda = moneda;
app.use((req, res, next) => {
  res.locals.admin = req.session.admin || null; 
  res.locals.rutaActual = req.path;
  next();
});


app.use('/api', apiRoutes); 
app.use('/admin', adminRoutes); 
app.get('/', (req, res) => res.redirect('/admin/login'));

app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
  }
  res.status(404).render('error', { codigo: 404, mensaje: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  const esErrorDeSubida = err.name === 'MulterError';
  const status = esErrorDeSubida ? 400 : err.status || 500;
  let mensaje = err.message;
  if (err.code === 'LIMIT_FILE_SIZE') mensaje = 'La imagen supera el máximo de 20 MB';
  if (status === 500) {
    console.error(err); 
    mensaje = 'Error interno del servidor';
  }

  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ ok: false, mensaje });
  }
  res.status(status).render('error', { codigo: status, mensaje });
});

async function iniciar() {
  await sequelize.sync();
  app.listen(config.PUERTO, () => {
    console.log(`Servidor listo en http://localhost:${config.PUERTO}`);
    console.log(`Back office:      http://localhost:${config.PUERTO}/admin/login`);
  });
}


['SIGINT', 'SIGTERM'].forEach((senal) =>
  process.on(senal, () => cerrarNavegador().finally(() => process.exit(0)))
);

if (require.main === module) iniciar();

module.exports = app;
