// Reglas de validación (separadas de las rutas para poder probarlas).
// Devuelven el mensaje de error, o null si los datos son válidos.
const PASSWORD_MIN = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function emailValido(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim());
}

function validarRegistro({ nombre, email, password } = {}) {
  if (!nombre || !email || !password) return 'Todos los campos son requeridos';
  if (!emailValido(email)) return 'El correo no tiene un formato válido';
  if (password.length < PASSWORD_MIN) return `La contraseña debe tener mínimo ${PASSWORD_MIN} caracteres`;
  return null;
}

// Precio: número mayor que 0. Stock: entero mayor o igual a 0 (opcional).
function validarProducto({ nombre, marca, categoria, precio, stock } = {}) {
  if (!nombre || !marca || !categoria || precio === undefined || precio === null || precio === '')
    return 'Nombre, marca, categoría y precio son requeridos';
  const p = Number(precio);
  if (!Number.isFinite(p) || p <= 0) return 'El precio debe ser un número mayor a 0';
  if (stock !== undefined && stock !== null && stock !== '') {
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) return 'El stock debe ser un número entero mayor o igual a 0';
  }
  return null;
}

module.exports = { validarRegistro, validarProducto, emailValido, PASSWORD_MIN };
