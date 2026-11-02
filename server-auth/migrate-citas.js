// Migración de la tabla "citas": agrega fecha/hora, estatus y relación con usuarios.
// Se puede correr varias veces sin problema (solo aplica lo que falta).
//
//   node migrate-citas.js
//
// Si la tabla "citas" no existe todavía, la crea completa.
require('dotenv').config();
const pool = require('./db');

const CREATE_CITAS = `
  CREATE TABLE citas (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id     INT           NULL,
    nombre         VARCHAR(120)  NOT NULL,
    telefono       VARCHAR(20)   NOT NULL,
    correo         VARCHAR(150)  NOT NULL,
    servicio       VARCHAR(80)   NOT NULL,
    sucursal       VARCHAR(120)  NOT NULL,
    mensaje        TEXT          NULL,
    fecha_cita     DATE          NULL,
    hora_cita      TIME          NULL,
    estatus        ENUM('pendiente','confirmada','rechazada') NOT NULL DEFAULT 'pendiente',
    gestionado_por INT           NULL,
    creado_en      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_usuario FOREIGN KEY (usuario_id)     REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_citas_gestor  FOREIGN KEY (gestionado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_citas_estatus (estatus),
    INDEX idx_citas_usuario (usuario_id)
  ) ENGINE=InnoDB`;

// columna -> definición. Se agregan solo si no existen.
const COLUMNAS = {
  usuario_id:     'INT NULL',
  fecha_cita:     'DATE NULL',
  hora_cita:      'TIME NULL',
  estatus:        "ENUM('pendiente','confirmada','rechazada') NOT NULL DEFAULT 'pendiente'",
  gestionado_por: 'INT NULL',
  actualizado_en: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
};

async function existeTabla() {
  const [r] = await pool.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?', ['citas']);
  return r.length > 0;
}

async function columnasActuales() {
  const [r] = await pool.query(
    'SELECT column_name AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?', ['citas']);
  return new Set(r.map(x => x.c));
}

async function existeIndiceOFk(nombre) {
  const [r] = await pool.query(
    `SELECT 1 FROM information_schema.table_constraints
       WHERE table_schema = DATABASE() AND table_name = 'citas' AND constraint_name = ?`, [nombre]);
  return r.length > 0;
}

async function migrar() {
  if (!(await existeTabla())) {
    await pool.query(CREATE_CITAS);
    console.log('✅ Tabla "citas" creada completa.');
    return;
  }

  const hay = await columnasActuales();
  const teniaAtendida = hay.has('atendida');
  const teniaEstatus = hay.has('estatus');

  for (const [col, def] of Object.entries(COLUMNAS)) {
    if (!hay.has(col)) {
      await pool.query(`ALTER TABLE citas ADD COLUMN ${col} ${def}`);
      console.log(`✅ Columna agregada: ${col}`);
    }
  }

  // Las citas que ya estaban marcadas como "atendida" pasan a "confirmada".
  // Solo se hace en la primera migración (cuando "estatus" todavía no existía).
  if (!teniaEstatus && teniaAtendida) {
    const [r] = await pool.query("UPDATE citas SET estatus = 'confirmada' WHERE atendida = 1");
    console.log(`✅ ${r.affectedRows} cita(s) atendida(s) pasaron a "confirmada".`);
  }

  if (!(await existeIndiceOFk('fk_citas_usuario'))) {
    await pool.query('ALTER TABLE citas ADD CONSTRAINT fk_citas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL');
    console.log('✅ Llave foránea citas.usuario_id → usuarios.id');
  }
  if (!(await existeIndiceOFk('fk_citas_gestor'))) {
    await pool.query('ALTER TABLE citas ADD CONSTRAINT fk_citas_gestor FOREIGN KEY (gestionado_por) REFERENCES usuarios(id) ON DELETE SET NULL');
    console.log('✅ Llave foránea citas.gestionado_por → usuarios.id');
  }

  console.log('Migración de citas terminada.');
}

migrar()
  .catch(err => { console.error('❌ Error en la migración:', err.message); process.exitCode = 1; })
  .finally(() => pool.end());
