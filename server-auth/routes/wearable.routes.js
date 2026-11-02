// Endpoint que consume la app del wearable (Wear OS).
// El cliente inicia sesión con POST /api/auth/login y manda el token en cada petición:
//   Authorization: Bearer <token>
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middlewares/auth.middleware');
const { proteger } = require('../middlewares/async.middleware');
const { MESES, ahoraLocal, promocionVigente } = require('../helpers/promociones');
const { fechaReferencia, vigenteEn } = require('../helpers/promociones.repo');
const { crearNotificacion } = require('../helpers/notificaciones.helper');

const VENTANA_CITA_DIAS = 7; // cuántos días adelante se considera "cita próxima"

// "2026-10-15" → "15 oct"
function fechaCorta(fecha) {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES[m - 1]}`;
}

// Texto de la cita según qué tan cerca esté.
function textoCita(minutos, fecha, hora) {
  if (minutos <= 60) return `Tu cita es en ${Math.max(minutos, 1)} min`;
  if (minutos < 24 * 60) return `Tu cita es hoy a las ${hora}`;
  return `Tu cita es el ${fechaCorta(fecha)} a las ${hora}`;
}

// ═══ GET avisos del cliente: cita próxima, pedido, promoción vigente e historial ═══
// Opcional (solo para pruebas/demostración): ?fecha=YYYY-MM-DD para simular otro día
// y ver, por ejemplo, la promoción del Buen Fin.
router.get('/avisos', verificarToken, async (req, res) => {
  const uid = req.usuario.id;
  try {
    // ── Cita confirmada más próxima ──
    const ahoraMs = Date.now();
    const [citas] = await pool.execute(
      `SELECT id, servicio, sucursal, fecha_cita, hora_cita
         FROM citas
        WHERE (usuario_id = ? OR correo = (SELECT email FROM usuarios WHERE id = ?))
          AND estatus = 'confirmada' AND fecha_cita IS NOT NULL AND hora_cita IS NOT NULL
        ORDER BY fecha_cita, hora_cita`,
      [uid, uid]
    );
    let cita = null;
    for (const c of citas) {
      const hora = String(c.hora_cita).slice(0, 5);
      const inicioMs = new Date(`${c.fecha_cita}T${hora}:00-06:00`).getTime(); // hora local de la óptica
      const minutos = Math.ceil((inicioMs - ahoraMs) / 60000);
      if (minutos >= 0 && minutos <= VENTANA_CITA_DIAS * 24 * 60) {
        cita = {
          id: c.id,
          titulo: textoCita(minutos, c.fecha_cita, hora),
          subtitulo: String(c.sucursal).split(' — ')[0],
          servicio: c.servicio,
          fecha_cita: c.fecha_cita,
          hora_cita: hora,
          minutos_restantes: minutos,
        };
        break;
      }
    }

    // ── Pedido más reciente que no se ha entregado ──
    const [pedidos] = await pool.execute(
      `SELECT id, armazon, estatus, listo_en
         FROM pedidos
        WHERE usuario_id = ? AND estatus IN ('listo','en_proceso')
        ORDER BY (estatus = 'listo') DESC, creado_en DESC
        LIMIT 1`,
      [uid]
    );
    const pedido = pedidos.length ? {
      id: pedidos[0].id,
      estatus: pedidos[0].estatus,
      titulo: pedidos[0].estatus === 'listo' ? 'Tu armazón ya está listo' : 'Tu pedido va en proceso',
      subtitulo: pedidos[0].estatus === 'listo' ? 'Pasa a recogerlo cuando gustes' : pedidos[0].armazon,
      armazon: pedidos[0].armazon,
      listo_en: pedidos[0].listo_en,
    } : null;

    // ── Promoción vigente (tabla "promociones"; hora de la óptica o la fecha simulada) ──
    const ref = fechaReferencia(req.query.fecha);
    let promocion = null;
    try {
      promocion = await vigenteEn(ref);
    } catch (e) {
      // Si la tabla aún no existe (falta correr la migración), se usa la lista fija de siempre.
      promocion = promocionVigente(ref);
    }
    if (promocion && promocion._anio) {
      // Aviso al historial: una sola vez por promoción y por año (referencia = id·10000 + año).
      await crearNotificacion({
        usuarioId: uid, tipo: 'promocion',
        titulo: promocion.titulo, mensaje: promocion.subtitulo,
        referenciaId: promocion.id * 10000 + promocion._anio,
      });
      delete promocion._anio;
    }

    // ── Historial (avisos guardados) ──
    const [historial] = await pool.execute(
      `SELECT id, tipo, titulo, mensaje, leida, creado_en
         FROM notificaciones WHERE usuario_id = ?
         ORDER BY creado_en DESC, id DESC LIMIT 30`,
      [uid]
    );
    const noLeidas = historial.filter(h => !h.leida).length;

    res.json({
      generado_en: new Date().toISOString(),
      cita,
      pedido,
      promocion,
      historial: historial.map(h => ({ ...h, leida: !!h.leida })),
      no_leidas: noLeidas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los avisos' });
  }
});

// ═══ PUT marcar todos los avisos como leídos ═══ (va antes de "/:id/leida")
router.put('/avisos/leidas', verificarToken, async (req, res) => {
  try {
    const [r] = await pool.execute(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE', [req.usuario.id]);
    res.json({ mensaje: 'Avisos marcados como leídos', actualizados: r.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar los avisos' });
  }
});

// ═══ PUT marcar un aviso como leído ═══
router.put('/avisos/:id/leida', verificarToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Id inválido' });
  try {
    const [r] = await pool.execute(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?', [id, req.usuario.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Aviso no encontrado' });
    res.json({ mensaje: 'Aviso leído', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el aviso' });
  }
});

module.exports = proteger(router);
