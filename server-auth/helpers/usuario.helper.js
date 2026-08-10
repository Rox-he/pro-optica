const pool = require('../db');

// Arma el usuario con sus roles y permisos (con JOINs)
async function getCompleto(usuarioRow) {
  const [rolesRows] = await pool.execute(
    `SELECT r.id, r.nombre FROM roles r
     JOIN usuario_rol ur ON ur.rol_id = r.id
     WHERE ur.usuario_id = ?`,
    [usuarioRow.id]
  );

  let permisos = [];
  if (rolesRows.length) {
    const rolIds = rolesRows.map(r => r.id);
    const placeholders = rolIds.map(() => '?').join(',');
    const [permisosRows] = await pool.query(
      `SELECT DISTINCT p.nombre FROM permisos p
       JOIN rol_permiso rp ON rp.permiso_id = p.id
       WHERE rp.rol_id IN (${placeholders})`,
      rolIds
    );
    permisos = permisosRows.map(p => p.nombre);
  }

  return {
    id: usuarioRow.id,
    nombre: usuarioRow.nombre,
    email: usuarioRow.email,
    activo: !!usuarioRow.activo,
    creado_en: usuarioRow.creado_en,
    roles: rolesRows.map(r => r.nombre),
    rol: rolesRows[0]?.nombre || 'Sin rol',
    permisos,
  };
}

module.exports = { getCompleto };