require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const editorRoutes = require('./routes/editor.routes');
const productosRoutes = require('./routes/productos.routes');
const citasRoutes = require('./routes/citas.routes');
const buscarRoutes = require('./routes/buscar.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const wearableRoutes = require('./routes/wearable.routes');
const promocionesRoutes = require('./routes/promociones.routes');
// ...

const app = express();
const PORT = process.env.PORT || 3001;

// En producción, restringe el CORS a tu dominio del frontend (Vercel o tu dominio propio)
// usando la variable de entorno FRONTEND_URL. Si no está definida, permite todo (útil en local).
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : {};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/buscar', buscarRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/wearable', wearableRoutes);
app.use('/api/promociones', promocionesRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true, port: PORT }));
// Solo se enciende el servidor cuando se ejecuta directamente (npm start);
// las pruebas importan la app sin abrir el puerto.
if (require.main === module) {
  app.listen(PORT, () => console.log(`API auth (MySQL) corriendo en http://localhost:${PORT}`));
}

module.exports = app;