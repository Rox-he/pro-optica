// PRUEBAS UNITARIAS — validación de promociones (sin base de datos, sin red).
const test = require('node:test');
const assert = require('node:assert/strict');
const { validarPromocion } = require('../../helpers/promociones.validacion');

const base = { nombre: 'Buen Fin', descuento: '20% OFF', mes_inicio: 11, dia_inicio: 14, mes_fin: 11, dia_fin: 17 };

test('UT-17 una promoción completa es válida y se rellenan colores, ícono y título por defecto', () => {
  const r = validarPromocion(base);
  assert.equal(r.ok, true);
  assert.equal(r.datos.titulo, 'Buen Fin');
  assert.equal(r.datos.icono, 'etiqueta');
  assert.match(r.datos.color_fondo, /^#[0-9a-f]{6}$/i);
});

test('UT-18 sin nombre o sin descuento se rechaza', () => {
  assert.equal(validarPromocion({ ...base, nombre: '  ' }).ok, false);
  assert.equal(validarPromocion({ ...base, descuento: '' }).ok, false);
});

test('UT-19 mes fuera de 1-12 y día que no existe en el mes se rechazan', () => {
  assert.equal(validarPromocion({ ...base, mes_inicio: 13 }).ok, false);
  assert.equal(validarPromocion({ ...base, mes_inicio: 0 }).ok, false);
  assert.equal(validarPromocion({ ...base, mes_inicio: 4, dia_inicio: 31, mes_fin: 5, dia_fin: 1 }).ok, false);
  assert.equal(validarPromocion({ ...base, mes_inicio: 2, dia_inicio: 29, mes_fin: 3, dia_fin: 1 }).ok, true);
  assert.equal(validarPromocion({ ...base, mes_inicio: 2, dia_inicio: 30, mes_fin: 3, dia_fin: 1 }).ok, false);
});

test('UT-20 la fecha final no puede ser anterior a la inicial', () => {
  const r = validarPromocion({ ...base, mes_fin: 11, dia_fin: 10 });
  assert.equal(r.ok, false);
  assert.match(r.error, /anterior/);
});

test('UT-21 color no hexadecimal o ícono desconocido se rechazan; los números llegan como texto también', () => {
  assert.equal(validarPromocion({ ...base, color_fondo: 'rojo' }).ok, false);
  assert.equal(validarPromocion({ ...base, icono: 'dragon' }).ok, false);
  const r = validarPromocion({ ...base, mes_inicio: '11', dia_inicio: '14', mes_fin: '11', dia_fin: '17' });
  assert.equal(r.ok, true);
  assert.equal(r.datos.mes_inicio, 11);
});
