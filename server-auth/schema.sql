-- ═══════════════════════════════════════════════════════════════════
-- Óptica Convicción — Esquema de autenticación y roles (MySQL)
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS optica_conviccion
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE optica_conviccion;

-- ── Tabla: usuarios ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  activo        BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Tabla: roles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)   NOT NULL UNIQUE,
  descripcion VARCHAR(255)  NULL
) ENGINE=InnoDB;

-- ── Tabla: permisos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permisos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)   NOT NULL UNIQUE,
  descripcion VARCHAR(255)  NULL
) ENGINE=InnoDB;

-- ── Tabla puente: usuario_rol (N:M usuarios ↔ roles) ────────────────
CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id  INT NOT NULL,
  rol_id      INT NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id)     REFERENCES roles(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Tabla puente: rol_permiso (N:M roles ↔ permisos) ────────────────
CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id      INT NOT NULL,
  permiso_id  INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id)     REFERENCES roles(id)    ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ═══════════════════════════════════════════════════════════════════
-- Datos base: roles y permisos (los usuarios se insertan con seed.js
-- porque la contraseña debe ir hasheada con bcrypt desde Node)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'Administrador', 'Acceso total al sitio y gestión de usuarios'),
  (2, 'Editor',        'Puede editar contenido pero no gestionar usuarios')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO permisos (id, nombre, descripcion) VALUES
  (1, 'ver_dashboard',     'Ver panel de administración'),
  (2, 'gestionar_usuarios', 'Crear, editar y eliminar usuarios'),
  (3, 'editar_contenido',  'Editar servicios y productos'),
  (4, 'ver_contenido',     'Ver páginas públicas del sitio'),
  (5, 'enviar_formulario', 'Enviar formulario de contacto')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  (1,1),(1,2),(1,3),(1,4),(1,5),   -- Administrador: todos los permisos
  (2,1),(2,3),(2,4),(2,5)          -- Editor: sin gestionar_usuarios
ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id);

-- NOTA: el rol "Usuario" (id 3) se eliminó. Si tu base de datos ya existía
-- con datos previos, corre este bloque una sola vez para limpiarlo:
-- DELETE FROM usuario_rol WHERE rol_id = 3;
-- DELETE FROM rol_permiso WHERE rol_id = 3;
-- DELETE FROM roles WHERE id = 3;

-- ── Tabla: productos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)   NOT NULL,
  marca       VARCHAR(80)    NOT NULL,
  categoria   VARCHAR(60)    NOT NULL,
  descripcion TEXT           NULL,
  precio      DECIMAL(10,2)  NOT NULL,
  color       VARCHAR(50)    NULL,
  material    VARCHAR(50)    NULL,
  genero      VARCHAR(20)    NULL,
  imagen      VARCHAR(255)   NULL,
  stock       INT            NOT NULL DEFAULT 0,
  activo      BOOLEAN        NOT NULL DEFAULT TRUE,
  creado_en   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Tabla: citas ─────────────────────────────────────────────────────
-- Solicitudes de cita enviadas desde el formulario de contacto.
-- El asesor (Editor/Administrador) las confirma o rechaza; el estatus es
-- el dato que consultará la app del wearable para notificar al cliente.
-- usuario_id es opcional: si el cliente tenía sesión iniciada al agendar,
-- la cita queda ligada a su cuenta.
CREATE TABLE IF NOT EXISTS citas (
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
  CONSTRAINT fk_citas_usuario   FOREIGN KEY (usuario_id)     REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_citas_gestor    FOREIGN KEY (gestionado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_citas_estatus (estatus),
  INDEX idx_citas_usuario (usuario_id)
) ENGINE=InnoDB;

-- ── Parcial 2 ─────────────────────────────────────────────────────────
-- ── Tabla: pedidos (Parcial 2) ───────────────────────────────────────
-- Pedido de lentes de un cliente. Al pasar a "listo" se genera el aviso
-- "Tu armazón ya está listo" para su wearable. usuario_id se llena solo
-- cuando el correo del pedido coincide con una cuenta registrada.
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
) ENGINE=InnoDB;

-- ── Tabla: notificaciones (Parcial 2) ────────────────────────────────
-- Historial de avisos que consulta la app del wearable.
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
) ENGINE=InnoDB;

-- ── Tabla: promociones ───────────────────────────────────────────────
-- Promociones por temporada (se repiten cada año: mes/día). Las administra
-- el Editor/Administrador; las leen el sitio web y el wearable.
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
) ENGINE=InnoDB;
