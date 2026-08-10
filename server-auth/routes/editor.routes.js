const express = require('express');
const router = express.Router();
const { verificarToken, requiereRol } = require('../middlewares/auth.middleware');

router.get('/contenido', verificarToken, requiereRol('Administrador', 'Editor'), (req, res) => {
  res.json({ mensaje: `Panel de edición activo para ${req.usuario.rol}` });
});

module.exports = router;