const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');
const { proteger } = require('../middlewares/async.middleware');
const { crearNotificacion } = require('../helpers/notificaciones.helper');

const ESTATUS_VALIDOS = ['en_proceso', 'listo', 'entregado'];
const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ═══ GET buscar si el correo ya tiene cuenta (Editor / Administrador) ═══
// Sirve para avisar en el formulario si el cliente recibirá avisos en su reloj.
router.get('/buscar-cliente', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const correo = String(req.query.correo || '').trim();
  if (!CORREO_RE.test(correo)) return res.json({ existe: false });
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre FROM usuarios WHERE LOWER(email) = LOWER(?) AND activo = TRUE LIMIT 1', [correo]);
    res.json(rows.length ? { existe: true, nombre: rows[0].nombre } : { existe: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar al cliente' });
  }
});

// ═══ GET mis pedidos (cliente con sesión iniciada) ═══
router.get('/mios', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, armazon, estatus, listo_en, creado_en
         FROM pedidos WHERE usuario_id = ? ORDER BY creado_en DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus pedidos' });
  }
});

// ═══ GET listar todos los pedidos (Editor / Administrador) ═══
router.get('/', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.usuario_id, p.cliente_nombre, p.cliente_correo, p.cliente_telefono,
              p.producto_id, p.armazon, p.notas, p.estatus, p.listo_en, p.creado_en, p.actualizado_en,
              g.nombre AS gestionado_por
         FROM pedidos p
         LEFT JOIN usuarios g ON g.id = p.gestionado_por
         ORDER BY p.creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// ═══ POST registrar un pedido (Editor / Administrador) ═══
// body: { cliente_nombre, cliente_correo, cliente_telefono?, producto_id?, armazon?, notas? }
// Si se manda producto_id, el nombre del armazón se toma del catálogo.
// Si el correo coincide con una cuenta, el pedido queda ligado a ella (para avisarle en el reloj).
router.post('/', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const { cliente_nombre, cliente_correo, cliente_telefono, producto_id, armazon, notas } = req.body;

  if (!cliente_nombre || !cliente_correo) {
    return res.status(400).json({ error: 'Nombre y correo del cliente son requeridos' });
  }
  if (!CORREO_RE.test(String(cliente_correo).trim())) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  try {
    let nombreArmazon = armazon ? String(armazon).trim() : '';
    let productoId = null;

    if (producto_id) {
      const [prod] = await pool.execute('SELECT id, marca, nombre FROM productos WHERE id = ?', [producto_id]);
      if (!prod.length) return res.status(400).json({ error: 'El producto elegido no existe' });
      productoId = prod[0].id;
      nombreArmazon = `${prod[0].marca} ${prod[0].nombre}`.slice(0, 150);
    }
    if (!nombreArmazon) return res.status(400).json({ error: 'Elige un armazón del catálogo o escríbelo' });

    const correo = String(cliente_correo).trim();
    const [cuenta] = await pool.execute(
      'SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?) AND activo = TRUE LIMIT 1', [correo]);

    const [r] = await pool.execute(
      `INSERT INTO pedidos (usuario_id, cliente_nombre, cliente_correo, cliente_telefono, producto_id, armazon, notas, gestionado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cuenta[0]?.id ?? null, String(cliente_nombre).trim(), correo, cliente_telefono || null,
       productoId, nombreArmazon, notas || null, req.usuario.id]
    );
    res.status(201).json({
      mensaje: 'Pedido registrado',
      id: r.insertId,
      estatus: 'en_proceso',
      cuenta_vinculada: cuenta.length > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el pedido' });
  }
});

// ═══ PUT cambiar el estatus de un pedido (Editor / Administrador) ═══
// body: { estatus: 'en_proceso' | 'listo' | 'entregado' }
// Al pasar a "listo" se genera el aviso "Tu armazón ya está listo" para el wearable del cliente.
router.put('/:id/estatus', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { estatus } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  if (!ESTATUS_VALIDOS.includes(estatus)) {
    return res.status(400).json({ error: `Estatus inválido. Usa: ${ESTATUS_VALIDOS.join(', ')}` });
  }

  try {
    const [rows] = await pool.execute('SELECT id, usuario_id, armazon FROM pedidos WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });

    await pool.execute(
      `UPDATE pedidos
          SET estatus = ?, gestionado_por = ?,
              listo_en = CASE WHEN ? = 'listo' THEN NOW()
                              WHEN ? = 'en_proceso' THEN NULL
                              ELSE listo_en END
        WHERE id = ?`,
      [estatus, req.usuario.id, estatus, estatus, id]
    );

    let avisado = false;
    if (estatus === 'listo') {
      avisado = await crearNotificacion({
        usuarioId: rows[0].usuario_id,
        tipo: 'pedido',
        titulo: 'Tu armazón ya está listo',
        mensaje: 'Pasa a recogerlo cuando gustes',
        referenciaId: id,
      });
    }
    res.json({ mensaje: 'Pedido actualizado', id, estatus, aviso_enviado: avisado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

module.exports = proteger(router);
