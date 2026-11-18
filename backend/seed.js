
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, Producto, Usuario, Venta, VentaProducto } = require('./models');
const { ADMIN_DEMO } = require('./config/config');
const { CARPETA_UPLOADS } = require('./middlewares/upload');

const CARPETA_FOTOS = path.join(__dirname, 'public', 'fotos');
const EXTENSIONES_FOTO = ['jpg', 'jpeg', 'png', 'webp'];

// [nombre, descripción, precio, activo (opcional, por defecto true)]
const JUEGOS = [
  ['Red Dead Redemption 2', 'Juego de mundo abierto ambientado en el Lejano Oeste. Tiene una historia profunda, un mundo enorme y muchísimas actividades.', 115000],
  ['The Witcher 3: Wild Hunt', 'RPG de fantasía en el que controlás a Geralt, un cazador de monstruos que debe encontrar a una persona muy importante para él.', 65000],
  ['Elden Ring', 'Juego de acción y rol de mundo abierto con combates difíciles, exploración y una enorme variedad de enemigos y jefes.', 90000],
  ['Cyberpunk 2077', 'RPG futurista ambientado en una ciudad tecnológica llena de delincuencia, corporaciones y conflictos.', 85000],
  ['Grand Theft Auto V', 'Juego de mundo abierto con una historia profunda y actividades variadas.', 55000],
  ['God of War Ragnarök', 'Juego de acción y aventura en el que Kratos y su hijo Atreus emprenden un viaje por la mitología nórdica.', 95000],
  ['Hogwarts Legacy', 'Aventura de mundo abierto ambientada en el universo de Harry Potter. Podés crear tu propio mago, aprender hechizos y explorar Hogwarts.', 57000],
  ['Resident Evil 4 Remake', 'Juego de terror y supervivencia en el que debés rescatar a la hija del presidente mientras enfrentás criaturas peligrosas.', 54000],
  ['The Last of Us Part I', 'Aventura de supervivencia en un mundo devastado por una infección. Sigue la historia de Joel y Ellie mientras intentan sobrevivir.', 110000],
  ['Forza Horizon 5', 'Juego de carreras de mundo abierto ambientado en México, con una gran variedad de autos, competencias y paisajes.', 60000],
  // Inactivo a propósito, para probar "Activar" desde el panel
  ['Sekiro: Shadows Die Twice', 'Juego de acción ambientado en el Japón feudal. Combina combates exigentes con espadas, sigilo y enfrentamientos contra jefes.', 105000, false],
];

const PERIFERICOS = [
  ['Mouse Gamer Pro 16000 DPI LuckyTech', 'Mouse óptico con 7 botones programables, iluminación RGB y sensor de alta precisión.', 18500],
  ['Teclado Mecánico RGB LuckyTech', 'Teclado mecánico switches rojos, retroiluminado RGB, formato TKL y cable trenzado.', 42900],
  ['Auriculares Gamer 7.1 LuckyTech', 'Auriculares con sonido envolvente 7.1, micrófono desmontable y almohadillas de memory foam.', 56700],
  ['Joystick Inalámbrico PC/Android LuckyTech', 'Control inalámbrico con vibración dual, compatible con PC y celulares.', 22800],
  ['Mousepad XL Antideslizante LuckyTech', 'Alfombrilla de 80x30cm con base de goma y superficie de tela de baja fricción.', 7900],
  ['Monitor Gamer 24" 144Hz LuckyTech', 'Monitor Full HD con panel IPS, 144Hz y 1ms de respuesta. HDMI y DisplayPort.', 189900],
  ['Micrófono USB para Streaming LuckyTech', 'Micrófono de condensador con trípode, filtro antipop y patrón cardioide.', 31200],
  ['Webcam Full HD 1080p LuckyTech', 'Webcam con micrófono integrado, enfoque automático y corrección de luz.', 24300],
  ['Volante con Pedales LuckyTech', 'Volante con retroalimentación de fuerza y pedalera de 2 ejes para simuladores de carreras.', 89900],
  ['Control Pro para Consola LuckyTech', 'Control con gatillos ajustables, botones traseros programables y batería de 30 horas.', 38900],
  // Inactivo a propósito, para probar "Activar" desde el panel
  ['Teclado Membrana Básico LuckyTech', 'Teclado de membrana con layout español. Modelo discontinuado.', 9800, false],
];


let semilla = 42;
function aleatorio() {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
}
const entre = (min, max) => Math.floor(aleatorio() * (max - min + 1)) + min;
const diasAtras = (dias, hora = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, entre(0, 59), 0, 0);
  return d;
};

function copiarFoto(n) {
  const foto = EXTENSIONES_FOTO
    .map((ext) => `${n}.${ext}`)
    .find((nombre) => fs.existsSync(path.join(CARPETA_FOTOS, nombre)));
  if (!foto) {
    throw new Error(`Falta la foto del producto ${n}: poné public/fotos/${n}.jpg (o .png, .webp)`);
  }
  const archivo = `seed-${n}${path.extname(foto)}`;
  fs.copyFileSync(path.join(CARPETA_FOTOS, foto), path.join(CARPETA_UPLOADS, archivo));
  return archivo;
}

async function sembrar() {
  console.log('Recreando tablas...');
  await sequelize.sync({ force: true });

  fs.mkdirSync(CARPETA_UPLOADS, { recursive: true });
  fs.readdirSync(CARPETA_UPLOADS)
    .filter((f) => f.startsWith('seed-'))
    .forEach((f) => fs.unlinkSync(path.join(CARPETA_UPLOADS, f)));

  const hash = await bcrypt.hash(ADMIN_DEMO.password, 10);
  await Usuario.create({
    nombre: ADMIN_DEMO.nombre,
    email: ADMIN_DEMO.email,
    password: hash,
    rol: 'admin',
  });

  let n = 0;
  const crearProductos = async (lista, categoria) => {
    for (const [nombre, descripcion, precio, activo = true] of lista) {
      n += 1;
      const archivo = copiarFoto(n);
      await Producto.create({ nombre, descripcion, precio, categoria, imagen: '/uploads/' + archivo, activo });
    }
  };
  await crearProductos(JUEGOS, 'juegos');
  await crearProductos(PERIFERICOS, 'perifericos');
  const activos = await Producto.findAll({ where: { activo: true } });

  const clientes = ['Lucía', 'Martín', 'Sofía', 'Joaquín', 'Valentina', 'Mateo', 'Camila', 'Tomás'];
  for (let i = 0; i < 12; i++) {
    const fecha = diasAtras(entre(0, 29), entre(9, 21));
    const venta = await Venta.create({ nombreCliente: clientes[entre(0, clientes.length - 1)], fecha, total: 0 });


    const cuantos = entre(1, 4);
    const elegidos = new Set();
    while (elegidos.size < cuantos) elegidos.add(activos[entre(0, activos.length - 1)]);

    let total = 0;
    for (const p of elegidos) {
      const cantidad = entre(1, 3);
      await VentaProducto.create({ ventaId: venta.id, productoId: p.id, cantidad, precioUnitario: p.precio });
      total += cantidad * p.precio;
    }
    await venta.update({ total: Math.round(total * 100) / 100 });
  }

  console.log('Seed completo:');
  console.log(`  - Administrador: ${ADMIN_DEMO.email} / ${ADMIN_DEMO.password}`);
  console.log(`  - Productos: ${await Producto.count()} (activos: ${activos.length})`);
  console.log(`  - Ventas: ${await Venta.count()}`);
}

sembrar()
  .then(() => sequelize.close())
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  });
