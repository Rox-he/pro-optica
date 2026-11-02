const pool = require('../db');

// Guarda un aviso para el wearable del cliente. Si ya existe un aviso del mismo
// tipo para ese registro (p. ej. el mismo pedido), no lo duplica.
async function crearNotificacion({ usuarioId, tipo, titulo, mensaje, referenciaId = null }) {
  if (!usuarioId) return false; // el cliente no tiene cuenta ligada: no hay a quién avisar
  if (referenciaId !== null) {
    const [ya] = await pool.execute(
      'SELECT id FROM notificaciones WHERE usuario_id = ? AND tipo = ? AND referencia_id = ? LIMIT 1',
      [usuarioId, tipo, referenciaId]
    );
    if (ya.length) return false;
  }
  await pool.execute(
    'INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, referencia_id) VALUES (?, ?, ?, ?, ?)',
    [usuarioId, tipo, titulo, mensaje, referenciaId]
  );
  return true;
}

module.exports = { crearNotificacion };
