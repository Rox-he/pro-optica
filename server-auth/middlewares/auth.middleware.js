const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'optica-conviccion-jwt-secret-2026';

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' });
  try {
    req.usuario = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol))
      return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    next();
  };
}

module.exports = { verificarToken, requiereRol, JWT_SECRET };