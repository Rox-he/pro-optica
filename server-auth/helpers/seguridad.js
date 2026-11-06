// Endurecimiento de la API (sin dependencias nuevas).
// 1) Cabeceras de seguridad  2) límite de intentos fallidos de login y de registros
// 3) errores controlados: nunca se devuelve la traza interna (rutas, SQL, versiones)

function aplicarSeguridad(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Railway está detrás de un proxy: así req.ip es la IP real del cliente

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Límite en memoria: VENTANA_MS de ventana; solo cuentan los intentos fallidos de login (401)
  const VENTANA_MS = 15 * 60 * 1000;
  const MAX_FALLOS_LOGIN = Number(process.env.LIMITE_LOGIN_FALLOS) || 10;
  const MAX_REGISTROS = Number(process.env.LIMITE_REGISTROS) || 20;
  const fallos = new Map(), registros = new Map();
  const vigentes = (mapa, ip) => { const ahora = Date.now(); const l = (mapa.get(ip) || []).filter(t => ahora - t < VENTANA_MS); mapa.set(ip, l); return l; };
  setInterval(() => { for (const m of [fallos, registros]) for (const k of m.keys()) if (!vigentes(m, k).length) m.delete(k); }, VENTANA_MS).unref();

  app.use('/api/auth/login', (req, res, next) => {
    if (req.method !== 'POST') return next();
    if (vigentes(fallos, req.ip).length >= MAX_FALLOS_LOGIN) {
      res.setHeader('Retry-After', String(Math.ceil(VENTANA_MS / 1000)));
      return res.status(429).json({ error: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.' });
    }
    res.on('finish', () => { if (res.statusCode === 401) vigentes(fallos, req.ip).push(Date.now()); });
    next();
  });
  app.use('/api/auth/register', (req, res, next) => {
    if (req.method !== 'POST') return next();
    const l = vigentes(registros, req.ip);
    if (l.length >= MAX_REGISTROS) return res.status(429).json({ error: 'Demasiados registros desde esta red. Intenta más tarde.' });
    l.push(Date.now());
    next();
  });
}

// Se monta DESPUÉS de todas las rutas
function manejoDeErrores(app) {
  app.use('/api', (req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'La solicitud es demasiado grande' });
    console.error('[ERROR]', req.method, req.originalUrl, err && err.stack ? err.stack : err); // la traza solo queda en el log del servidor
    res.status(500).json({ error: 'Error interno del servidor' });
  });
}

module.exports = { aplicarSeguridad, manejoDeErrores };
