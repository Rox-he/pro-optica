const express = require('express');
const router = express.Router();
const esClient = require('../es-client');

const INDEX_NAME = 'productos';

router.get('/', async (req, res) => {
  const q = req.query.q;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Falta el parámetro de búsqueda (q)' });
  }

  try {
    const resultado = await esClient.search({
      index: INDEX_NAME,
      query: {
        multi_match: {
          query: q,
          fields: ['nombre^3', 'marca^2', 'categoria', 'descripcion', 'color', 'material'],
          fuzziness: 'AUTO' // tolera errores de tipeo
        }
      }
    });

    const productos = resultado.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));

    res.json({ total: resultado.hits.total.value, resultados: productos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});

module.exports = router;