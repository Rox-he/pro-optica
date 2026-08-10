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