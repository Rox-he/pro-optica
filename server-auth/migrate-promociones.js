// Migración de Promociones: crea la tabla "promociones" y, si está vacía, carga las 5 promociones
// de temporada que ya mostraba el sitio. Se puede correr varias veces sin problema.
//
//   npm run migrate:promociones
//
require('dotenv').config();
const pool = require('./db');

const CREATE = `
  CREATE TABLE IF NOT EXISTS promociones (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(80)  NOT NULL,
    titulo       VARCHAR(120) NOT NULL,
    descuento    VARCHAR(30)  NOT NULL,
    detalle      VARCHAR(150) NOT NULL DEFAULT '',
    descripcion  VARCHAR(255) NOT NULL DEFAULT '',
    icono        VARCHAR(20)  NOT NULL DEFAULT 'etiqueta',
    color_fondo  CHAR(7)      NOT NULL DEFAULT '#0D213A',
    color_acento CHAR(7)      NOT NULL DEFAULT '#FFC93C',
    mes_inicio   TINYINT      NOT NULL,
    dia_inicio   TINYINT      NOT NULL,
    mes_fin      TINYINT      NOT NULL,
    dia_fin      TINYINT      NOT NULL,
    activa       BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_promos_fechas (activa, mes_inicio, dia_inicio)
  ) ENGINE=InnoDB`;

const INICIALES = require('./helpers/promociones.semilla');

async function migrar() {
  await pool.query(CREATE);
  console.log('✅ Tabla "promociones" lista.');
  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM promociones');
  if (n === 0) {
    for (const p of INICIALES) {
      await pool.execute(
        `INSERT INTO promociones (nombre, titulo, descuento, detalle, descripcion, icono, color_fondo, color_acento,
                                  mes_inicio, dia_inicio, mes_fin, dia_fin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.nombre, p.titulo, p.descuento, p.detalle, p.descripcion, p.icono, p.color_fondo, p.color_acento,
         p.mes_inicio, p.dia_inicio, p.mes_fin, p.dia_fin]);
    }
    console.log(`✅ Se cargaron ${INICIALES.length} promociones de temporada.`);
  } else {
    console.log(`= Ya había ${n} promociones; no se cargó nada.`);
  }
}

migrar()
  .catch(err => { console.error('❌ Error en la migración:', err.message); process.exitCode = 1; })
  .finally(() => pool.end());
