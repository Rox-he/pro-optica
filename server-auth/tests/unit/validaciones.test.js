// PRUEBAS UNITARIAS — validación del registro (lógica pura, sin base de datos)
const test = require('node:test');
const assert = require('node:assert/strict');
const { validarRegistro, validarProducto, emailValido } = require('../../helpers/validaciones.helper');

test('UT-01 caso válido: datos completos y contraseña de 12 caracteres', () => {
  const error = validarRegistro({ nombre: 'Ana Cliente', email: 'ana@test.mx', password: 'Ana12345!xyz' });
  assert.equal(error, null);
});

test('UT-02 caso límite: contraseña de exactamente 8 caracteres es válida', () => {
  assert.equal(validarRegistro({ nombre: 'Ana', email: 'ana@test.mx', password: '12345678' }), null);
});

test('UT-03 caso límite: contraseña de 7 caracteres se rechaza', () => {
  const error = validarRegistro({ nombre: 'Ana', email: 'ana@test.mx', password: '1234567' });
  assert.equal(error, 'La contraseña debe tener mínimo 8 caracteres');
});

test('UT-04 caso inválido: falta el nombre', () => {
  const error = validarRegistro({ email: 'ana@test.mx', password: '12345678' });
  assert.equal(error, 'Todos los campos son requeridos');
});

test('UT-05 caso inválido: campos vacíos o sin datos no provocan excepción', () => {
  assert.equal(validarRegistro({ nombre: '', email: '', password: '' }), 'Todos los campos son requeridos');
  assert.equal(validarRegistro(), 'Todos los campos son requeridos');
});

test('UT-13 correo sin formato válido se rechaza en el registro', () => {
  assert.equal(validarRegistro({ nombre: 'A', email: 'abc', password: '12345678' }), 'El correo no tiene un formato válido');
  assert.equal(validarRegistro({ nombre: 'A', email: 'a@b', password: '12345678' }), 'El correo no tiene un formato válido');
  assert.equal(emailValido('ana@test.mx'), true);
});

test('UT-14 producto válido: precio mayor a 0 y stock entero', () => {
  assert.equal(validarProducto({ nombre: 'A', marca: 'M', categoria: 'C', precio: 1899.5, stock: 4 }), null);
  assert.equal(validarProducto({ nombre: 'A', marca: 'M', categoria: 'C', precio: '250' }), null);
});

test('UT-15 producto inválido: precio negativo, cero o no numérico', () => {
  for (const precio of [-500, 0, 'abc'])
    assert.equal(validarProducto({ nombre: 'A', marca: 'M', categoria: 'C', precio }), 'El precio debe ser un número mayor a 0');
});

test('UT-16 producto inválido: stock negativo o decimal; faltan campos', () => {
  for (const stock of [-3, 1.5])
    assert.equal(validarProducto({ nombre: 'A', marca: 'M', categoria: 'C', precio: 10, stock }), 'El stock debe ser un número entero mayor o igual a 0');
  assert.equal(validarProducto({ nombre: 'A', marca: 'M', categoria: 'C' }), 'Nombre, marca, categoría y precio son requeridos');
});
