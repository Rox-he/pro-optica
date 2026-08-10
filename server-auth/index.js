require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const editorRoutes = require('./routes/editor.routes');
const productosRoutes = require('./routes/productos.routes');
const citasRoutes = require('./routes/citas.routes');
const buscarRoutes = require('./routes/buscar.routes');
// ...

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/buscar', buscarRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true, port: PORT }));
app.listen(PORT, () => console.log(`API auth (MySQL) corriendo en http://localhost:${PORT}`));