const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');
const { emailValido } = require('../helpers/validaciones.helper');
const { proteger } = require('../middlewares/async.middleware');
const { crearNotificacion } = require('../helpers/notificaciones.helper');
const { MESES } = require('../helpers/promociones');
const { verificarToken, requiereRol, JWT_SECRET } = require('../middlewares/auth.middleware');

const ESTATUS_VALIDOS = ['pendiente', 'confirmada', 'rechazada'];

// Si la petición trae un token válido devuelve el id del usuario; si no, null.
// Sirve para ligar la cita a la cuenta del cliente sin obligarlo a iniciar sesión.
function usuarioIdOpcional(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], JWT_SECRET).id ?? null;
  } catch {
    return null;
  }
}

// "YYYY-MM-DD" válido (rechaza fechas imposibles como 2026-02-31)
function fechaValida(f) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === f;
}

// "HH:MM" en 24 h
function horaValida(h) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
}

// ═══ POST crear solicitud de cita (público, desde el formulario) ═══
router.post('/', async (req, res) => {
  const { nombre, telefono, correo, servicio, sucursal, mensaje, fecha_cita, hora_cita } = req.body;

  if (!nombre || !telefono || !correo || !servicio || !sucursal || !fecha_cita || !hora_cita) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (!emailValido(correo)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido' });
  }
  if (!fechaValida(fecha_cita) || !horaValida(hora_cita)) {
    return res.status(400).json({ error: 'Fecha u hora inválida' });
  }
  // La hora de la cita es hora local de la óptica (Querétaro, UTC-6 todo el año),
  // sin importar en qué zona horaria corra el servidor.
  if (new Date(`${fecha_cita}T${hora_cita}:00-06:00`) < new Date()) {
    return res.status(400).json({ error: 'La fecha y hora de la cita ya pasaron' });
  }

  try {
    const [resultado] = await pool.execute(
      `INSERT INTO citas (usuario_id, nombre, telefono, correo, servicio, sucursal, mensaje, fecha_cita, hora_cita)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioIdOpcional(req), nombre, telefono, correo, servicio, sucursal, mensaje || null, fecha_cita, hora_cita]
    );
    res.status(201).json({ mensaje: 'Solicitud recibida', id: resultado.insertId, estatus: 'pendiente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
});

// ═══ GET mis citas (cliente con sesión iniciada) ═══
// Va antes de "/:id/..." para que "mias" no se interprete como un id.
router.get('/mias', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, servicio, sucursal, fecha_cita, hora_cita, estatus, creado_en
         FROM citas WHERE usuario_id = ?
         ORDER BY fecha_cita DESC, hora_cita DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus citas' });
  }
});

// ═══ GET listar todas las citas (Editor / Administrador) ═══
router.get('/', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.usuario_id, c.nombre, c.telefono, c.correo, c.servicio, c.sucursal, c.mensaje,
              c.fecha_cita, c.hora_cita, c.estatus, c.creado_en, c.actualizado_en,
              g.nombre AS gestionado_por
         FROM citas c
         LEFT JOIN usuarios g ON g.id = c.gestionado_por
         ORDER BY c.creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// ═══ PUT confirmar o rechazar una cita (Editor / Administrador) ═══
// body: { estatus: 'confirmada' | 'rechazada' | 'pendiente' }
router.put('/:id/estatus', verificarToken, requiereRol('Administrador', 'Editor'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { estatus } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  if (!ESTATUS_VALIDOS.includes(estatus)) {
    return res.status(400).json({ error: `Estatus inválido. Usa: ${ESTATUS_VALIDOS.join(', ')}` });
  }

  try {
    const [existe] = await pool.execute(
      'SELECT id, usuario_id, sucursal, fecha_cita, hora_cita FROM citas WHERE id = ?', [id]);
    if (!existe.length) return res.status(404).json({ error: 'Cita no encontrada' });

    await pool.execute(
      'UPDATE citas SET estatus = ?, gestionado_por = ? WHERE id = ?',
      [estatus, estatus === 'pendiente' ? null : req.usuario.id, id]
    );
    // Al confirmar, el cliente (si tiene cuenta ligada) recibe el aviso en su wearable.
    if (estatus === 'confirmada') {
      const c = existe[0];
      let cuando = '';
      if (c.fecha_cita) {
        const [, m, d] = String(c.fecha_cita).slice(0, 10).split('-').map(Number);
        cuando = `${d} ${MESES[m - 1]}` + (c.hora_cita ? ` · ${String(c.hora_cita).slice(0, 5)}` : '');
      }
      await crearNotificacion({
        usuarioId: c.usuario_id,
        tipo: 'cita',
        titulo: 'Tu cita fue confirmada',
        mensaje: [cuando, String(c.sucursal).split(' — ')[0]].filter(Boolean).join(' · '),
        referenciaId: id,
      });
    }
    res.json({ mensaje: `Cita ${estatus}`, id, estatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

module.exports = proteger(router);
