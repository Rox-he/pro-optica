const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');

// ═══ GET todos los productos (público) ═══
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos WHERE activo = TRUE');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ═══ GET un producto puntual (público) ═══
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// ═══ POST crear producto (Editor / Administrador) ═══
router.post('/', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const { nombre, marca, categoria, descripcion, precio, color, material, genero, imagen, stock } = req.body;
  if (!nombre || !marca || !categoria || !precio) {
    return res.status(400).json({ error: 'Nombre, marca, categoría y precio son requeridos' });
  }
  try {
    const [resultado] = await pool.execute(
      `INSERT INTO productos (nombre, marca, categoria, descripcion, precio, color, material, genero, imagen, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, marca, categoria, descripcion || null, precio, color || null, material || null, genero || null, imagen || null, stock || 0]
    );
    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [resultado.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ═══ PUT editar producto (Editor / Administrador) ═══
router.put('/:id', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, marca, categoria, descripcion, precio, color, material, genero, imagen, stock, activo } = req.body;

  const [existe] = await pool.execute('SELECT id FROM productos WHERE id = ?', [id]);
  if (!existe.length) return res.status(404).json({ error: 'Producto no encontrado' });

  try {
    await pool.execute(
      `UPDATE productos SET nombre=?, marca=?, categoria=?, descripcion=?, precio=?, color=?, material=?, genero=?, imagen=?, stock=?, activo=?
       WHERE id=?`,
      [nombre, marca, categoria, descripcion || null, precio, color || null, material || null, genero || null, imagen || null, stock || 0, activo !== undefined ? !!activo : true, id]
    );
    const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ═══ DELETE eliminar producto (Editor / Administrador) ═══
router.delete('/:id', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const id = parseInt(req.params.id);
  const [existe] = await pool.execute('SELECT id FROM productos WHERE id = ?', [id]);
  if (!existe.length) return res.status(404).json({ error: 'Producto no encontrado' });

  try {
    await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;