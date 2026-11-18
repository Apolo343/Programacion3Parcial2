
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const CARPETA_UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
const TAMANO_MAXIMO_MB = 20; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARPETA_UPLOADS),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + crypto.randomBytes(6).toString('hex') + extension);
  },
});

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
  const error = new Error('El archivo debe ser una imagen (jpg, png, webp o gif)');
  error.status = 400;
  cb(error); 
};

const upload = multer({ storage, fileFilter, limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024 } });

const subirImagen = upload.single('imagen');

module.exports = { subirImagen, CARPETA_UPLOADS };
