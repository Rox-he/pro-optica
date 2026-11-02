// PRUEBAS UNITARIAS — middleware de autenticación y control de roles.
// Se usan dobles de prueba (req, res y next falsos) para aislar el middleware de Express y de la BD.
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { verificarToken, requiereRol, JWT_SECRET } = require('../../middlewares/auth.middleware');

// Dobles de prueba
function crearRes() {
  const res = { codigo: null, cuerpo: null };
  res.status = (c) => { res.codigo = c; return res; };
  res.json = (b) => { res.cuerpo = b; return res; };
  return res;
}
function crearNext() {
  const next = () => { next.llamado = true; };
  next.llamado = false;
  return next;
}
const firmar = (datos, opciones = { expiresIn: '1h' }) => jwt.sign(datos, JWT_SECRET, opciones);

test('UT-06 verificarToken: token válido deja pasar y guarda al usuario en req', () => {
  const req = { headers: { authorization: `Bearer ${firmar({ id: 7, email: 'a@b.mx', rol: 'Editor' })}` } };
  const res = crearRes(); const next = crearNext();
  verificarToken(req, res, next);
  assert.equal(next.llamado, true);
  assert.equal(req.usuario.id, 7);
  assert.equal(req.usuario.rol, 'Editor');
});

test('UT-07 verificarToken: sin encabezado Authorization responde 401', () => {
  const res = crearRes(); const next = crearNext();
  verificarToken({ headers: {} }, res, next);
  assert.equal(res.codigo, 401);
  assert.equal(res.cuerpo.error, 'Token requerido');
  assert.equal(next.llamado, false);
});

test('UT-08 verificarToken: token mal formado responde 401', () => {
  const res = crearRes(); const next = crearNext();
  verificarToken({ headers: { authorization: 'Bearer esto-no-es-un-token' } }, res, next);
  assert.equal(res.codigo, 401);
  assert.equal(res.cuerpo.error, 'Token inválido o expirado');
  assert.equal(next.llamado, false);
});

test('UT-09 verificarToken: token vencido responde 401', () => {
  const vencido = firmar({ id: 1, rol: 'Administrador' }, { expiresIn: -10 });
  const res = crearRes(); const next = crearNext();
  verificarToken({ headers: { authorization: `Bearer ${vencido}` } }, res, next);
  assert.equal(res.codigo, 401);
  assert.equal(next.llamado, false);
});

test('UT-10 verificarToken: token firmado con otra clave responde 401', () => {
  const falso = jwt.sign({ id: 1, rol: 'Administrador' }, 'otra-clave');
  const res = crearRes(); const next = crearNext();
  verificarToken({ headers: { authorization: `Bearer ${falso}` } }, res, next);
  assert.equal(res.codigo, 401);
  assert.equal(next.llamado, false);
});

test('UT-11 requiereRol: rol permitido deja pasar', () => {
  const res = crearRes(); const next = crearNext();
  requiereRol('Administrador', 'Editor')({ usuario: { rol: 'Editor' } }, res, next);
  assert.equal(next.llamado, true);
  assert.equal(res.codigo, null);
});

test('UT-12 requiereRol: rol no permitido responde 403', () => {
  const res = crearRes(); const next = crearNext();
  requiereRol('Administrador')({ usuario: { rol: 'Editor' } }, res, next);
  assert.equal(res.codigo, 403);
  assert.match(res.cuerpo.error, /permisos insuficientes/);
  assert.equal(next.llamado, false);
});
