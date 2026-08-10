require('dotenv').config();
const pool = require('./db');
const esClient = require('./es-client');

const INDEX_NAME = 'productos';

async function indexarProductos() {
  try {
    // 1. Traer todos los productos de MySQL
    const [productos] = await pool.execute('SELECT * FROM productos WHERE activo = TRUE');
    console.log(`Encontrados ${productos.length} productos en MySQL.`);

    // 2. Borrar el índice si ya existe (para empezar limpio cada vez)
    const existe = await esClient.indices.exists({ index: INDEX_NAME });
    if (existe) {
      await esClient.indices.delete({ index: INDEX_NAME });
      console.log('Índice anterior eliminado.');
    }

    // 3. Crear el índice con mapeo básico
    await esClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          nombre:      { type: 'text' },
          marca:       { type: 'text' },
          categoria:   { type: 'keyword' },
          descripcion: { type: 'text' },
          color:       { type: 'text' },
          material:    { type: 'text' },
          genero:      { type: 'keyword' },
          precio:      { type: 'float' },
          imagen:      { type: 'keyword' },
        }
      }
    });
    console.log('Índice creado.');

    // 4. Indexar cada producto (bulk insert)
    const operaciones = productos.flatMap(p => [
      { index: { _index: INDEX_NAME, _id: p.id } },
      {
        nombre: p.nombre,
        marca: p.marca,
        categoria: p.categoria,
        descripcion: p.descripcion,
        color: p.color,
        material: p.material,
        genero: p.genero,
        precio: p.precio,
        imagen: p.imagen,
      }
    ]);

    const resultado = await esClient.bulk({ refresh: true, operations: operaciones });

    if (resultado.errors) {
      console.error('Hubo errores al indexar:', JSON.stringify(resultado.items, null, 2));
    } else {
      console.log(`${productos.length} productos indexados correctamente en Elasticsearch.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error al indexar:', err);
    process.exit(1);
  }
}

indexarProductos();