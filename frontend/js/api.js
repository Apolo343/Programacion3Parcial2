
const Api = {
  async pedir(ruta, opciones = {}) {
    let respuesta;
    try {
      respuesta = await fetch(CONFIG.API_URL + ruta, opciones);
    } catch (e) {
      throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      const error = new Error(datos.mensaje || 'Ocurrió un error inesperado');
      error.errores = datos.errores || {}; 
      error.status = respuesta.status;
      throw error;
    }
    return datos;
  },

  listarProductos({ categoria, pagina = 1, limite = CONFIG.PRODUCTOS_POR_PAGINA }) {
    const params = new URLSearchParams({ page: pagina, limit: limite });
    if (categoria) params.set('categoria', categoria);
    return this.pedir('/productos?' + params.toString());
  },


  crearVenta(nombre, carrito) {
    return this.pedir('/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        nombre,
        items: carrito.map((l) => ({ productoId: l.id, cantidad: l.cantidad })),
      }),
    });
  },

  async descargarTicket(ventaId) {
    let respuesta;
    try {
      respuesta = await fetch(`${CONFIG.API_URL}/ventas/${ventaId}/ticket.pdf`);
    } catch (e) {
      throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
    }
    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      throw new Error(datos.mensaje || 'No se pudo generar el PDF');
    }
    return respuesta.blob();
  },
};
