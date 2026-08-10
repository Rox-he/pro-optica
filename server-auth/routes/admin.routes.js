const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');
const { getCompleto } = require('../helpers/usuario.helper');

// ═══ Listar usuarios ═══
router.get('/users', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM usuarios ORDER BY id');
  const usuarios = await Promise.all(rows.map(getCompleto));
  res.json(usuarios);
});

// ═══ Crear usuario ═══
router.post('/users', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const { nombre, email, password, rol_nombre } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  if (password.length < 8)
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });

  const [existe] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ error: 'El email ya está registrado' });

  const [rolRows] = await pool.execute('SELECT id FROM roles WHERE nombre = ?', [rol_nombre || 'Editor']);
  if (!rolRows.length) return res.status(400).json({ error: 'Rol no válido' });

  const password_hash = await bcrypt.hash(password, 10);
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password_hash, activo) VALUES (?, ?, ?, TRUE)',
    [nombre, email, password_hash]
  );
  await pool.execute('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)', [resultado.insertId, rolRows[0].id]);

  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [resultado.insertId]);
  res.status(201).json(await getCompleto(rows[0]));
});

// ═══ Editar nombre/email ═══
router.put('/users/:id', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email } = req.body;
  if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' });

  const [rows] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

  const [dup] = await pool.execute('SELECT id FROM usuarios WHERE email = ? AND id <> ?', [email, id]);
  if (dup.length) return res.status(409).json({ error: 'El email ya está en uso por otro usuario' });

  await pool.execute('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, id]);
  const [actualizado] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
  res.json(await getCompleto(actualizado[0]));
});

// ═══ Cambiar rol ═══
router.put('/users/:id/rol', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { rol_nombre } = req.body;
  const [rolRows] = await pool.execute('SELECT id FROM roles WHERE nombre = ?', [rol_nombre]);
  if (!rolRows.length) return res.status(400).json({ error: 'Rol no válido' });

  await pool.execute('DELETE FROM usuario_rol WHERE usuario_id = ?', [id]);
  await pool.execute('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)', [id, rolRows[0].id]);
  res.json({ mensaje: `Rol actualizado a ${rol_nombre}` });
});

// ═══ Activar / desactivar usuario ═══
router.put('/users/:id/estado', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { activo } = req.body;
  if (id === req.usuario.id) return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });

  const [rows] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

  await pool.execute('UPDATE usuarios SET activo = ? WHERE id = ?', [!!activo, id]);
  res.json({ mensaje: activo ? 'Usuario activado' : 'Usuario desactivado' });
});

// ═══ Eliminar usuario definitivamente ═══
router.delete('/users/:id', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.usuario.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });

  const [rows] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

  await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  res.json({ mensaje: 'Usuario eliminado permanentemente' });
});

module.exports = router;