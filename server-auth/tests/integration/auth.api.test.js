// PRUEBAS DE INTEGRACIÓN — API real (Express) + base de datos MySQL de prueba.
// No hay mocks: cada petición pasa por rutas, middleware, bcrypt, JWT y SQL reales.
process.env.DB_NAME = 'optica_conviccion_test'; // debe ir ANTES de importar la app
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { reiniciarBD, ADMIN, EDITOR } = require('../helpers/db-test');

let app, pool;

test.before(async () => {
  await reiniciarBD();
  app = require('../../index');
  pool = require('../../db');
});

test.after(async () => { if (pool) await pool.end(); });

const login = (email, password) => request(app).post('/api/auth/login').send({ email, password });

// ── Registro ──────────────────────────────────────────────────────────
test('IT-01 registro correcto: crea la cuenta en la BD con contraseña cifrada y rol Cliente', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ nombre: 'Ana Cliente', email: 'ana@test.mx', password: 'Ana-12345' });
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.usuario.rol, 'Cliente');
  assert.equal(res.body.usuario.password_hash, undefined, 'la respuesta no debe incluir el hash');

  const [filas] = await pool.execute('SELECT password_hash FROM usuarios WHERE email = ?', ['ana@test.mx']);
  assert.equal(filas.length, 1);
  assert.notEqual(filas[0].password_hash, 'Ana-12345');
  assert.match(filas[0].password_hash, /^\$2[aby]\$/, 'la contraseña debe guardarse con bcrypt');
});

test('IT-02 registro con correo repetido responde 409 y no duplica el registro', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ nombre: 'Otra Ana', email: 'ana@test.mx', password: 'Otra-12345' });
  assert.equal(res.status, 409);
  const [filas] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', ['ana@test.mx']);
  assert.equal(filas.length, 1);
});

test('IT-03 registro con contraseña corta responde 400 y no guarda nada', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ nombre: 'Beto', email: 'beto@test.mx', password: '1234567' });
  assert.equal(res.status, 400);
  const [filas] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', ['beto@test.mx']);
  assert.equal(filas.length, 0);
});

// ── Inicio de sesión ──────────────────────────────────────────────────
test('IT-04 login correcto devuelve token y /me regresa al mismo usuario', async () => {
  const res = await login('ana@test.mx', 'Ana-12345');
  assert.equal(res.status, 200);
  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.email, 'ana@test.mx');
});

test('IT-05 contraseña incorrecta y correo inexistente dan el mismo 401 (no revela cuál falló)', async () => {
  const mala = await login('ana@test.mx', 'incorrecta');
  const noExiste = await login('nadie@test.mx', 'Ana-12345');
  assert.equal(mala.status, 401);
  assert.equal(noExiste.status, 401);
  assert.equal(mala.body.error, 'Credenciales incorrectas');
  assert.equal(noExiste.body.error, 'Credenciales incorrectas');
});

test('IT-06 una cuenta desactivada no puede iniciar sesión', async () => {
  await pool.execute('UPDATE usuarios SET activo = FALSE WHERE email = ?', ['ana@test.mx']);
  const res = await login('ana@test.mx', 'Ana-12345');
  assert.equal(res.status, 401);
  await pool.execute('UPDATE usuarios SET activo = TRUE WHERE email = ?', ['ana@test.mx']);
});

// ── Control de acceso por rol ─────────────────────────────────────────
test('IT-07 /api/admin/users: sin token 401, Editor 403, Administrador 200 sin exponer hashes', async () => {
  const sinToken = await request(app).get('/api/admin/users');
  assert.equal(sinToken.status, 401);

  const tokenEditor = (await login(EDITOR.email, EDITOR.password)).body.token;
  const comoEditor = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tokenEditor}`);
  assert.equal(comoEditor.status, 403);

  const tokenAdmin = (await login(ADMIN.email, ADMIN.password)).body.token;
  const comoAdmin = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(comoAdmin.status, 200);
  assert.ok(comoAdmin.body.length >= 3);
  assert.ok(comoAdmin.body.every(u => u.password_hash === undefined));
});

test('IT-08 un token firmado con otra clave no da acceso, aunque diga ser Administrador', async () => {
  const falso = jwt.sign({ id: 1, email: ADMIN.email, rol: 'Administrador' }, 'clave-falsa');
  const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${falso}`);
  assert.equal(res.status, 401);
});

// ── Correcciones de la Práctica 7 ─────────────────────────────────────
test('IT-09 una cuenta de registro público (Cliente) no puede modificar el catálogo', async () => {
  const reg = await request(app).post('/api/auth/register')
    .send({ nombre: 'Luis Cliente', email: 'luis@test.mx', password: 'Luis-12345' });
  const token = reg.body.token;
  const crear = await request(app).post('/api/productos').set('Authorization', `Bearer ${token}`)
    .send({ nombre: 'Armazón', marca: 'M', categoria: 'Armazones', precio: 100 });
  assert.equal(crear.status, 403);
  const [filas] = await pool.execute("SELECT id FROM productos WHERE nombre = 'Armazón'");
  assert.equal(filas.length, 0, 'no debe guardarse nada');
});

test('IT-10 cambiar el rol de un usuario inexistente responde 404 y la API sigue viva', async () => {
  const token = (await login(ADMIN.email, ADMIN.password)).body.token;
  const res = await request(app).put('/api/admin/users/999999/rol')
    .set('Authorization', `Bearer ${token}`).send({ rol_nombre: 'Editor' });
  assert.equal(res.status, 404);
  const salud = await request(app).get('/api/health');
  assert.equal(salud.status, 200);
});

test('IT-11 registro con correo sin formato válido responde 400 y no guarda nada', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ nombre: 'Malo', email: 'esto-no-es-un-correo', password: 'Clave-12345' });
  assert.equal(res.status, 400);
  const [filas] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', ['esto-no-es-un-correo']);
  assert.equal(filas.length, 0);
});

test('IT-12 producto con precio o stock negativo responde 400 y no se guarda', async () => {
  const token = (await login(EDITOR.email, EDITOR.password)).body.token;
  for (const cuerpo of [{ precio: -500, stock: 1 }, { precio: 100, stock: -3 }, { precio: 'abc', stock: 1 }]) {
    const res = await request(app).post('/api/productos').set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Inválido', marca: 'M', categoria: 'Armazones', ...cuerpo });
    assert.equal(res.status, 400, JSON.stringify(cuerpo));
  }
  const [filas] = await pool.execute("SELECT id FROM productos WHERE nombre = 'Inválido'");
  assert.equal(filas.length, 0);
});

// ── Promociones (módulo del sitio + wearable) ─────────────────────────
const promo = (extra = {}) => ({
  nombre: 'Promo Prueba', descuento: '30% OFF', detalle: 'todo el catálogo',
  mes_inicio: 3, dia_inicio: 10, mes_fin: 3, dia_fin: 20, ...extra,
});

test('IT-13 /promociones/vigente es público y devuelve null cuando no hay ninguna promoción', async () => {
  const res = await request(app).get('/api/promociones/vigente?fecha=2026-03-15');
  assert.equal(res.status, 200);
  assert.equal(res.body, null);
});

test('IT-14 crear promoción: sin token 401, Cliente 403, fechas inválidas 400 y nada se guarda', async () => {
  const sinToken = await request(app).post('/api/promociones').send(promo());
  assert.equal(sinToken.status, 401);

  const cliente = (await login('ana@test.mx', 'Ana-12345')).body.token;
  const comoCliente = await request(app).post('/api/promociones').set('Authorization', `Bearer ${cliente}`).send(promo());
  assert.equal(comoCliente.status, 403);

  const editor = (await login(EDITOR.email, EDITOR.password)).body.token;
  for (const cuerpo of [{ mes_fin: 2 }, { dia_inicio: 40 }, { nombre: '' }, { color_fondo: 'rojo' }]) {
    const res = await request(app).post('/api/promociones').set('Authorization', `Bearer ${editor}`).send(promo(cuerpo));
    assert.equal(res.status, 400, JSON.stringify(cuerpo));
  }
  const [filas] = await pool.execute('SELECT id FROM promociones');
  assert.equal(filas.length, 0);
});

test('IT-15 el Editor crea una promoción y el sitio la recibe solo dentro de sus fechas', async () => {
  const editor = (await login(EDITOR.email, EDITOR.password)).body.token;
  const crear = await request(app).post('/api/promociones').set('Authorization', `Bearer ${editor}`).send(promo());
  assert.equal(crear.status, 201);
  assert.equal(crear.body.activa, true);

  const dentro = await request(app).get('/api/promociones/vigente?fecha=2026-03-15');
  assert.equal(dentro.body.descuento, '30% OFF');
  assert.equal(dentro.body.color_fondo, '#0D213A');
  const fuera = await request(app).get('/api/promociones/vigente?fecha=2026-03-21');
  assert.equal(fuera.body, null);
});

test('IT-16 desactivar una promoción la quita del sitio; editarla y borrarla funciona; id inexistente da 404', async () => {
  const editor = (await login(EDITOR.email, EDITOR.password)).body.token;
  const auth = { Authorization: `Bearer ${editor}` };
  const [[{ id }]] = await pool.query("SELECT id FROM promociones WHERE nombre = 'Promo Prueba'");

  const off = await request(app).put(`/api/promociones/${id}/activa`).set(auth).send({ activa: false });
  assert.equal(off.status, 200);
  assert.equal((await request(app).get('/api/promociones/vigente?fecha=2026-03-15')).body, null);

  const malo = await request(app).put(`/api/promociones/${id}/activa`).set(auth).send({ activa: 'si' });
  assert.equal(malo.status, 400);

  await request(app).put(`/api/promociones/${id}/activa`).set(auth).send({ activa: true });
  const edit = await request(app).put(`/api/promociones/${id}`).set(auth).send(promo({ descuento: '35% OFF' }));
  assert.equal(edit.status, 200);
  assert.equal((await request(app).get('/api/promociones/vigente?fecha=2026-03-15')).body.descuento, '35% OFF');

  assert.equal((await request(app).put('/api/promociones/999999').set(auth).send(promo())).status, 404);
  assert.equal((await request(app).delete('/api/promociones/999999').set(auth)).status, 404);
  assert.equal((await request(app).delete(`/api/promociones/${id}`).set(auth)).status, 200);
  const [filas] = await pool.execute('SELECT id FROM promociones WHERE id = ?', [id]);
  assert.equal(filas.length, 0);
});

test('IT-17 el wearable recibe la promoción vigente y queda UN solo aviso en el historial (aunque consulte varias veces)', async () => {
  const editor = (await login(EDITOR.email, EDITOR.password)).body.token;
  await request(app).post('/api/promociones').set('Authorization', `Bearer ${editor}`).send(promo({ nombre: 'Promo Reloj' }));
  const cliente = (await login('ana@test.mx', 'Ana-12345')).body.token;

  let ultimo;
  for (let i = 0; i < 3; i++) {
    ultimo = await request(app).get('/api/wearable/avisos?fecha=2026-03-12').set('Authorization', `Bearer ${cliente}`);
    assert.equal(ultimo.status, 200);
  }
  assert.equal(ultimo.body.promocion.titulo, 'Promo Reloj');
  const avisos = ultimo.body.historial.filter(h => h.tipo === 'promocion');
  assert.equal(avisos.length, 1);
  assert.equal(ultimo.body.no_leidas >= 1, true);

  const sinPromo = await request(app).get('/api/wearable/avisos?fecha=2026-07-01').set('Authorization', `Bearer ${cliente}`);
  assert.equal(sinPromo.body.promocion, null);
  const sinToken = await request(app).get('/api/wearable/avisos');
  assert.equal(sinToken.status, 401);
});
