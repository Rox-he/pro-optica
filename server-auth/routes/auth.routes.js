const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verificarToken, JWT_SECRET } = require('../middlewares/auth.middleware');
const { getCompleto } = require('../helpers/usuario.helper');
const { validarRegistro } = require('../helpers/validaciones.helper');
const { proteger } = require('../middlewares/async.middleware');

const JWT_EXPIRES = '8h';

// ═══ REGISTRO ═══
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  const errorValidacion = validarRegistro({ nombre, email, password });
  if (errorValidacion) return res.status(400).json({ error: errorValidacion });

  const [existe] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ error: 'El email ya está registrado' });

  const password_hash = await bcrypt.hash(password, 10);
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password_hash, activo) VALUES (?, ?, ?, TRUE)',
    [nombre, email, password_hash]
  );
  // Las cuentas creadas con el registro público reciben el rol "Cliente", que no
  // tiene permisos de edición. Si el rol aún no existe en la base, se crea.
  let [rolCliente] = await pool.execute("SELECT id FROM roles WHERE nombre = 'Cliente'");
  if (!rolCliente.length) {
    await pool.execute("INSERT INTO roles (nombre, descripcion) VALUES ('Cliente', 'Cuenta de cliente: sin acceso al panel')");
    [rolCliente] = await pool.execute("SELECT id FROM roles WHERE nombre = 'Cliente'");
  }
  await pool.execute('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)', [resultado.insertId, rolCliente[0].id]);

  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [resultado.insertId]);
  const completo = await getCompleto(rows[0]);
  const token = jwt.sign({ id: completo.id, email, rol: completo.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.status(201).json({ mensaje: 'Usuario registrado', token, usuario: completo });
});

// ═══ LOGIN ═══
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  const usuario = rows[0];
  if (!usuario || !usuario.activo)
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const valida = await bcrypt.compare(password, usuario.password_hash);
  if (!valida) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const completo = await getCompleto(usuario);
  const token = jwt.sign({ id: usuario.id, email, rol: completo.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  console.log(`[LOGIN] ${email} (${completo.rol})`);
  res.json({ mensaje: 'Sesión iniciada', token, usuario: completo });
});

// ═══ ME ═══
router.get('/me', verificarToken, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(await getCompleto(rows[0]));
});

// ═══ LOGOUT ═══
router.post('/logout', verificarToken, (req, res) => {
  console.log(`[LOGOUT] ${req.usuario.email}`);
  res.json({ mensaje: 'Sesión cerrada correctamente' });
});

module.exports = proteger(router);