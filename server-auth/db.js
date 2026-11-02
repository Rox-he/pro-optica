require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'optica_conviccion',
  waitForConnections: true,
  connectionLimit: 10,
  // Las columnas DATE (p. ej. citas.fecha_cita) se devuelven como "YYYY-MM-DD" y no como
  // objeto Date, para que el día no se recorra según la zona horaria del servidor.
  dateStrings: ['DATE'],
});

module.exports = pool;
