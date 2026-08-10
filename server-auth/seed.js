require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

const USUARIOS_DEMO = [
  { nombre: 'Admin Convicción', email: 'admin@opticaconviccion.mx',   password: 'Admin2026!',   rol_id: 1 },
  { nombre: 'Editor Demo',      email: 'editor@opticaconviccion.mx',  password: 'Editor2026!',  rol_id: 2 },
];

async function seed() {
  for (const u of USUARIOS_DEMO) {
    const [existente] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [u.email]);
    if (existente.length) {
      console.log(`↷ ${u.email} ya existe, se omite`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const [resultado] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password_hash, activo) VALUES (?, ?, ?, TRUE)',
      [u.nombre, u.email, hash]
    );
    await pool.execute(
      'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)',
      [resultado.insertId, u.rol_id]
    );
    console.log(`✅ Creado ${u.email}`);
  }

  console.log('\nUsuarios de prueba:');
  console.log('  admin@opticaconviccion.mx   / Admin2026!   → Administrador');
  console.log('  editor@opticaconviccion.mx  / Editor2026!  → Editor');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
