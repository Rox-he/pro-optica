// Promociones por temporada (mismas fechas que el sitio web:
// src/app/shared/services/evento-calendario.service.ts).
// Si cambias una fecha o agregas una promoción allá, repítelo aquí.
const PROMOCIONES = [
  { id: 'dia-madres',     nombre: 'Día de las Madres',  descuento: '2x1',    detalle: 'en armazones',          inicio: { mes: 5,  dia: 1  }, fin: { mes: 5,  dia: 10 } },
  { id: 'verano',         nombre: 'Promo de Verano',    descuento: '20% OFF', detalle: 'lentes de sol y armazones ligeros', inicio: { mes: 6,  dia: 1  }, fin: { mes: 6,  dia: 30 } },
  { id: 'regreso-clases', nombre: 'Regreso a Clases',   descuento: '15% OFF', detalle: 'armazones infantiles',  inicio: { mes: 8,  dia: 1  }, fin: { mes: 8,  dia: 15 } },
  { id: 'aniversario',    nombre: 'Aniversario Óptica Convicción', descuento: '25% OFF', detalle: 'todo el catálogo', inicio: { mes: 10, dia: 18 }, fin: { mes: 10, dia: 18 } },
  { id: 'buen-fin',       nombre: 'Buen Fin',           descuento: '20% OFF', detalle: 'toda la tienda',        inicio: { mes: 11, dia: 14 }, fin: { mes: 11, dia: 17 } },
];

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Fecha/hora actual de la óptica (Querétaro, UTC-6 todo el año), sin importar
// la zona horaria del servidor. Devuelve { y, m, d, hh, mm, ms } (m = 1..12).
function ahoraLocal(base = Date.now()) {
  const d = new Date(base - 6 * 3600 * 1000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes() };
}

// Promoción vigente en una fecha { m, d } (o null si no hay ninguna).
function promocionVigente({ m, d }) {
  const v = m * 100 + d;
  const p = PROMOCIONES.find(x => v >= x.inicio.mes * 100 + x.inicio.dia && v <= x.fin.mes * 100 + x.fin.dia);
  if (!p) return null;
  return {
    id: p.id,
    titulo: p.nombre,
    subtitulo: `${p.descuento} · ${p.detalle}`,
    descuento: p.descuento,
    vigente_hasta: `${p.fin.dia} ${MESES[p.fin.mes - 1]}`,
  };
}

module.exports = { PROMOCIONES, MESES, ahoraLocal, promocionVigente };
