const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');

// ═══ POST crear solicitud de cita (público, desde el formulario) ═══
router.post('/', async (req, res) => {
  const { nombre, telefono, correo, servicio, sucursal, mensaje } = req.body;
  if (!nombre || !telefono || !correo || !servicio || !sucursal) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const [resultado] = await pool.execute(
      'INSERT INTO citas (nombre, telefono, correo, servicio, sucursal, mensaje) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, telefono, correo, servicio, sucursal, mensaje || null]
    );
    res.status(201).json({ mensaje: 'Solicitud recibida', id: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
});

// ═══ GET listar todas las citas (Editor / Administrador) ═══
router.get('/', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM citas ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// ═══ PUT marcar cita como atendida/no atendida (Editor / Administrador) ═══
router.put('/:id/atendida', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { atendida } = req.body;

  const [existe] = await pool.execute('SELECT id FROM citas WHERE id = ?', [id]);
  if (!existe.length) return res.status(404).json({ error: 'Cita no encontrada' });

  try {
    await pool.execute('UPDATE citas SET atendida = ? WHERE id = ?', [!!atendida, id]);
    res.json({ mensaje: atendida ? 'Marcada como atendida' : 'Marcada como pendiente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

module.exports = router;