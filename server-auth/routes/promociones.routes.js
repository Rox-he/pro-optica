// Promociones por temporada: las administra el Editor/Administrador y las consumen
// el sitio web (banner y portada) y el wearable.
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');
const { proteger } = require('../middlewares/async.middleware');
const { validarPromocion } = require('../helpers/promociones.validacion');
const { formatear, fechaReferencia, vigenteEn } = require('../helpers/promociones.repo');

const staff = [verificarToken, requiereRol('Administrador', 'Editor')];

// ═══ GET promoción vigente hoy (público) ═══  Opcional: ?fecha=YYYY-MM-DD para simular otro día
router.get('/vigente', async (req, res) => {
  const p = await vigenteEn(fechaReferencia(req.query.fecha));
  if (p) delete p._anio;
  res.json(p);
});

// ═══ GET todas (Editor / Administrador) ═══
router.get('/', ...staff, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM promociones ORDER BY (mes_inicio * 100 + dia_inicio), id');
  res.json(rows.map(r => ({ ...r, activa: !!r.activa })));
});

// ═══ POST crear ═══
router.post('/', ...staff, async (req, res) => {
  const v = validarPromocion(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const d = v.datos;
  const [r] = await pool.execute(
    `INSERT INTO promociones (nombre, titulo, descuento, detalle, descripcion, icono, color_fondo, color_acento,
                              mes_inicio, dia_inicio, mes_fin, dia_fin, activa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [d.nombre, d.titulo, d.descuento, d.detalle, d.descripcion, d.icono, d.color_fondo, d.color_acento,
     d.mes_inicio, d.dia_inicio, d.mes_fin, d.dia_fin]);
  const [rows] = await pool.execute('SELECT * FROM promociones WHERE id = ?', [r.insertId]);
  res.status(201).json({ ...rows[0], activa: !!rows[0].activa });
});

// ═══ PUT editar ═══
router.put('/:id', ...staff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  const [existe] = await pool.execute('SELECT id FROM promociones WHERE id = ?', [id]);
  if (!existe.length) return res.status(404).json({ error: 'Promoción no encontrada' });
  const v = validarPromocion(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const d = v.datos;
  await pool.execute(
    `UPDATE promociones SET nombre=?, titulo=?, descuento=?, detalle=?, descripcion=?, icono=?, color_fondo=?,
            color_acento=?, mes_inicio=?, dia_inicio=?, mes_fin=?, dia_fin=? WHERE id=?`,
    [d.nombre, d.titulo, d.descuento, d.detalle, d.descripcion, d.icono, d.color_fondo, d.color_acento,
     d.mes_inicio, d.dia_inicio, d.mes_fin, d.dia_fin, id]);
  const [rows] = await pool.execute('SELECT * FROM promociones WHERE id = ?', [id]);
  res.json({ ...rows[0], activa: !!rows[0].activa });
});

// ═══ PUT activar / desactivar ═══
router.put('/:id/activa', ...staff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  if (typeof req.body.activa !== 'boolean') return res.status(400).json({ error: 'Indica activa: true o false' });
  const [r] = await pool.execute('UPDATE promociones SET activa = ? WHERE id = ?', [req.body.activa, id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Promoción no encontrada' });
  res.json({ mensaje: req.body.activa ? 'Promoción activada' : 'Promoción desactivada', id, activa: req.body.activa });
});

// ═══ DELETE eliminar ═══
router.delete('/:id', ...staff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  const [r] = await pool.execute('DELETE FROM promociones WHERE id = ?', [id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Promoción no encontrada' });
  res.json({ mensaje: 'Promoción eliminada', id });
});

module.exports = proteger(router);
