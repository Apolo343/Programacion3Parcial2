
const Store = {
  getNombre() { return sessionStorage.getItem('nombre') || ''; },
  setNombre(nombre) { sessionStorage.setItem('nombre', nombre); },

  getCarrito() {
    try {
      return JSON.parse(sessionStorage.getItem('carrito')) || [];
    } catch (e) {
      return []; 
    }
  },

  guardarCarrito(carrito) {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent('carrito:cambio'));
  },

  agregar(producto, cantidad = 1) {
    const carrito = this.getCarrito();
    const linea = carrito.find((l) => l.id === producto.id);
    if (linea) {
      linea.cantidad = Math.min(99, linea.cantidad + cantidad); 
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad,
      });
    }
    this.guardarCarrito(carrito);
  },

  quitar(id, cantidad = 1) {
    const carrito = this.getCarrito();
    const linea = carrito.find((l) => l.id === id);
    if (!linea) return;
    linea.cantidad -= cantidad;
    this.guardarCarrito(carrito.filter((l) => l.cantidad > 0));
  },

  eliminar(id) {
    this.guardarCarrito(this.getCarrito().filter((l) => l.id !== id));
  },

  vaciar() { this.guardarCarrito([]); },

  cantidadDe(id) {
    const linea = this.getCarrito().find((l) => l.id === id);
    return linea ? linea.cantidad : 0;
  },

  totalItems() { return this.getCarrito().reduce((suma, l) => suma + l.cantidad, 0); },

  total() {
    const suma = this.getCarrito().reduce((s, l) => s + l.precio * l.cantidad, 0);
    return Math.round(suma * 100) / 100;
  },

  setVenta(venta) { sessionStorage.setItem('venta', JSON.stringify(venta)); },
  getVenta() {
    try { return JSON.parse(sessionStorage.getItem('venta')); } catch (e) { return null; }
  },

  reiniciar() { sessionStorage.clear(); },


  requerirNombre() {
    if (!this.getNombre()) {
      window.location.replace('index.html?aviso=nombre');
      return false;
    }
    return true;
  },
};
