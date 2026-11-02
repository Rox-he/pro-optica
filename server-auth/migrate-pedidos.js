// Migración del Parcial 2: crea las tablas "pedidos" y "notificaciones".
// Se puede correr varias veces sin problema (solo crea lo que falta).
//
//   npm run migrate:pedidos
//
require('dotenv').config();
const pool = require('./db');

const CREATE_PEDIDOS = `
  CREATE TABLE IF NOT EXISTS pedidos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       INT           NULL,
    cliente_nombre   VARCHAR(120)  NOT NULL,
    cliente_correo   VARCHAR(150)  NOT NULL,
    cliente_telefono VARCHAR(20)   NULL,
    producto_id      INT           NULL,
    armazon          VARCHAR(150)  NOT NULL,
    notas            TEXT          NULL,
    estatus          ENUM('en_proceso','listo','entregado') NOT NULL DEFAULT 'en_proceso',
    gestionado_por   INT           NULL,
    listo_en         DATETIME      NULL,
    creado_en        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_usuario  FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)  ON DELETE SET NULL,
    CONSTRAINT fk_pedidos_producto FOREIGN KEY (producto_id)    REFERENCES productos(id) ON DELETE SET NULL,
    CONSTRAINT fk_pedidos_gestor   FOREIGN KEY (gestionado_por) REFERENCES usuarios(id)  ON DELETE SET NULL,
    INDEX idx_pedidos_estatus (estatus),
    INDEX idx_pedidos_usuario (usuario_id)
  ) ENGINE=InnoDB`;

// Avisos que se le muestran al cliente en el wearable (historial de notificaciones).
const CREATE_NOTIFICACIONES = `
  CREATE TABLE IF NOT EXISTS notificaciones (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id    INT           NOT NULL,
    tipo          ENUM('cita','pedido','promocion') NOT NULL,
    titulo        VARCHAR(120)  NOT NULL,
    mensaje       VARCHAR(255)  NOT NULL,
    referencia_id INT           NULL,
    leida         BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_notif_usuario (usuario_id, leida),
    INDEX idx_notif_ref (tipo, referencia_id)
  ) ENGINE=InnoDB`;

async function migrar() {
  await pool.query(CREATE_PEDIDOS);
  console.log('✅ Tabla "pedidos" lista.');
  await pool.query(CREATE_NOTIFICACIONES);
  console.log('✅ Tabla "notificaciones" lista.');
  console.log('Migración del Parcial 2 terminada.');
}

migrar()
  .catch(err => { console.error('❌ Error en la migración:', err.message); process.exitCode = 1; })
  .finally(() => pool.end());
