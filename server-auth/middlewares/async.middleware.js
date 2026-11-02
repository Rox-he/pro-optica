// Envuelve cada ruta de un router para que un error dentro de una función async
// (por ejemplo, un fallo de la base de datos) responda 500 en lugar de tumbar el servidor.
function proteger(router) {
  for (const capa of router.stack) {
    if (!capa.route) continue;
    for (const c of capa.route.stack) {
      const original = c.handle;
      if (original.length >= 4 || original.__protegida) continue; // manejadores de error
      const envuelta = function (req, res, next) {
        try {
          const r = original(req, res, next);
          if (r && typeof r.catch === 'function') {
            r.catch((err) => {
              console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
              if (res.headersSent) return next(err);
              res.status(500).json({ error: 'Error interno del servidor' });
            });
          }
        } catch (err) {
          next(err);
        }
      };
      envuelta.__protegida = true;
      c.handle = envuelta;
    }
  }
  return router;
}

module.exports = { proteger };
