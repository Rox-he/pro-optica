// Prepara una base de datos DE PRUEBA (optica_conviccion_test), separada de la real,
// con el mismo esquema (schema.sql) y datos ficticios. Nunca toca optica_conviccion.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const DB_PRUEBA = 'optica_conviccion_test';

// Datos de prueba (ficticios)
const ADMIN  = { nombre: 'Admin Prueba',  email: 'admin.prueba@test.mx',  password: 'Admin-Prueba-1', rol_id: 1 };
const EDITOR = { nombre: 'Editor Prueba', email: 'editor.prueba@test.mx', password: 'Editor-Prueba-1', rol_id: 2 };

async function reiniciarBD() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  try {
    await conexion.query(`DROP DATABASE IF EXISTS \`${DB_PRUEBA}\``);
    const esquema = fs.readFileSync(path.join(__dirname, '..', '..', 'schema.sql'), 'utf8')
      .replace(/optica_conviccion/g, DB_PRUEBA);
    await conexion.query(esquema);
    await conexion.changeUser({ database: DB_PRUEBA });
    for (const u of [ADMIN, EDITOR]) {
      const hash = await bcrypt.hash(u.password, 4); // costo bajo: solo para pruebas
      const [r] = await conexion.execute(
        'INSERT INTO usuarios (nombre, email, password_hash, activo) VALUES (?, ?, ?, TRUE)',
        [u.nombre, u.email, hash]);
      await conexion.execute('INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)', [r.insertId, u.rol_id]);
    }
  } finally {
    await conexion.end();
  }
}

module.exports = { DB_PRUEBA, ADMIN, EDITOR, reiniciarBD };
