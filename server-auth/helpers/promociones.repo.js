// Acceso a la tabla "promociones" y regla de "¿cuál está vigente hoy?".
const pool = require('../db');
const { MESES, ahoraLocal } = require('./promociones');

// Fila de la BD → objeto que consumen el sitio web y el reloj.
function formatear(p) {
  return {
    id: p.id,
    titulo: p.titulo || p.nombre,
    nombre: p.nombre,
    subtitulo: p.detalle ? `${p.descuento} · ${p.detalle}` : p.descuento,
    descuento: p.descuento,
    detalle: p.detalle || '',
    descripcion: p.descripcion || '',
    color_fondo: p.color_fondo,
    color_acento: p.color_acento,
    icono: p.icono,
    vigente_hasta: `${p.dia_fin} ${MESES[p.mes_fin - 1]}`,
  };
}

// Fecha {m, d} a partir de ?fecha=YYYY-MM-DD (simulación) o de la hora de la óptica.
function fechaReferencia(sim) {
  const hoy = ahoraLocal();
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(sim || ''))) {
    const [, m, d] = String(sim).split('-').map(Number);
    return { ...hoy, m, d };
  }
  return hoy;
}

// Promoción activa que cubre la fecha (null si no hay). Si hay varias, gana la de inicio más reciente.
async function vigenteEn({ m, d, y }) {
  const v = m * 100 + d;
  const [rows] = await pool.execute(
    `SELECT * FROM promociones
      WHERE activa = TRUE AND (mes_inicio * 100 + dia_inicio) <= ? AND (mes_fin * 100 + dia_fin) >= ?
      ORDER BY (mes_inicio * 100 + dia_inicio) DESC, id DESC LIMIT 1`, [v, v]);
  return rows.length ? { ...formatear(rows[0]), _anio: y } : null;
}

module.exports = { formatear, fechaReferencia, vigenteEn };
