// Validación de una promoción (se usa en la API y en las pruebas unitarias).
// Las fechas se repiten cada año: se guardan como mes/día, igual que en el sitio.
const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const ICONOS = ['sol', 'mochila', 'regalo', 'bolsa', 'flor', 'etiqueta'];

const entero = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v);

// Devuelve { ok:true, datos } con los campos ya limpios, o { ok:false, error }.
function validarPromocion(b = {}) {
  const nombre = String(b.nombre ?? '').trim();
  const descuento = String(b.descuento ?? '').trim();
  const detalle = String(b.detalle ?? '').trim();
  const titulo = String(b.titulo ?? '').trim() || nombre;
  const descripcion = String(b.descripcion ?? '').trim();
  const icono = b.icono ? String(b.icono) : 'etiqueta';
  const color_fondo = b.color_fondo ? String(b.color_fondo) : '#0D213A';
  const color_acento = b.color_acento ? String(b.color_acento) : '#FFC93C';

  if (!nombre || !descuento) return { ok: false, error: 'El nombre y el descuento son requeridos' };
  if (nombre.length > 80) return { ok: false, error: 'El nombre no puede pasar de 80 caracteres' };
  if (descuento.length > 30) return { ok: false, error: 'El descuento no puede pasar de 30 caracteres' };
  if (detalle.length > 150) return { ok: false, error: 'El detalle no puede pasar de 150 caracteres' };
  if (descripcion.length > 255) return { ok: false, error: 'La descripción no puede pasar de 255 caracteres' };

  const mes_inicio = entero(b.mes_inicio), dia_inicio = entero(b.dia_inicio);
  const mes_fin = entero(b.mes_fin), dia_fin = entero(b.dia_fin);
  for (const [m, d] of [[mes_inicio, dia_inicio], [mes_fin, dia_fin]]) {
    if (!Number.isInteger(m) || m < 1 || m > 12) return { ok: false, error: 'El mes debe estar entre 1 y 12' };
    if (!Number.isInteger(d) || d < 1 || d > DIAS_POR_MES[m - 1]) return { ok: false, error: 'El día no es válido para ese mes' };
  }
  if (mes_fin * 100 + dia_fin < mes_inicio * 100 + dia_inicio)
    return { ok: false, error: 'La fecha final no puede ser anterior a la inicial' };

  if (!COLOR_RE.test(color_fondo) || !COLOR_RE.test(color_acento))
    return { ok: false, error: 'Los colores deben ser hexadecimales, por ejemplo #0D213A' };
  if (!ICONOS.includes(icono)) return { ok: false, error: 'Ícono no válido' };

  return { ok: true, datos: { nombre, descuento, detalle, titulo, descripcion, icono, color_fondo, color_acento,
                              mes_inicio, dia_inicio, mes_fin, dia_fin } };
}

module.exports = { validarPromocion, ICONOS, COLOR_RE };
