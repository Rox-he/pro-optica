import { Injectable } from '@angular/core';

export interface EventoPromo {
  id: string;
  nombre: string;
  mensaje: string;
  titulo: string;
  descripcion: string;
  descuento: string;
  colorFondo: string;
  colorAcento: string;
  icono: string;
  inicio: { mes: number; dia: number };
  fin: { mes: number; dia: number };
}

const ICONO_SOL = `<svg viewBox="0 0 64 64" width="56"><circle cx="32" cy="32" r="14" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="60"/><line x1="4" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="19" y2="19"/><line x1="45" y1="45" x2="52" y2="52"/><line x1="12" y1="52" x2="19" y2="45"/><line x1="45" y1="19" x2="52" y2="12"/></g></svg>`;
const ICONO_MOCHILA = `<svg viewBox="0 0 64 64" width="56"><rect x="14" y="22" width="36" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="4"/><path d="M22 22v-6a10 10 0 0 1 20 0v6" fill="none" stroke="currentColor" stroke-width="4"/><line x1="24" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
const ICONO_REGALO = `<svg viewBox="0 0 64 64" width="56"><rect x="10" y="26" width="44" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><line x1="10" y1="38" x2="54" y2="38" stroke="currentColor" stroke-width="4"/><line x1="32" y1="26" x2="32" y2="56" stroke="currentColor" stroke-width="4"/><path d="M32 26c-10 0-12-14 0-14s2 14 0 14c10 0 12-14 0-14s-2 14 0 14" fill="none" stroke="currentColor" stroke-width="4"/></svg>`;
const ICONO_BOLSA = `<svg viewBox="0 0 64 64" width="56"><path d="M14 22h36l-3 32a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4Z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M22 22v-4a10 10 0 0 1 20 0v4" fill="none" stroke="currentColor" stroke-width="4"/></svg>`;
const ICONO_FLOR = `<svg viewBox="0 0 64 64" width="56"><circle cx="32" cy="32" r="7" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="14" r="8"/><circle cx="32" cy="50" r="8"/><circle cx="14" cy="32" r="8"/><circle cx="50" cy="32" r="8"/></g></svg>`;

const EVENTOS: EventoPromo[] = [
  {
    id: 'verano',
    nombre: 'Promo de Verano',
    mensaje: 'Promo de Verano · lentes de sol y armazones ligeros',
    titulo: '¡Llegó el verano!',
    descripcion: 'Protege tu vista bajo el sol con lentes oscuros y armazones ligeros de nuestra colección de temporada.',
    descuento: '20% OFF',
    colorFondo: '#0E6E8C',
    colorAcento: '#FFC93C',
    icono: ICONO_SOL,
    inicio: { mes: 6, dia: 1 },
    fin: { mes: 6, dia: 30 },
  },
  {
    id: 'regreso-clases',
    nombre: 'Regreso a Clases',
    mensaje: 'Regreso a Clases · armazones infantiles',
    titulo: 'Listos para regresar a clases',
    descripcion: 'Armazones resistentes y a la moda para los más pequeños de la casa, con revisión visual incluida.',
    descuento: '15% OFF',
    colorFondo: '#7A3E9D',
    colorAcento: '#F2B9D1',
    icono: ICONO_MOCHILA,
    inicio: { mes: 8, dia: 1 },
    fin: { mes: 8, dia: 15 },
  },
  {
    id: 'aniversario',
    nombre: 'Aniversario Óptica Convicción',
    mensaje: 'Aniversario · todo el catálogo',
    titulo: '¡Estamos de aniversario!',
    descripcion: 'Para celebrar contigo, todo nuestro catálogo de armazones y lentes tiene un descuento especial solo por hoy.',
    descuento: '25% OFF',
    colorFondo: '#C9779E',
    colorAcento: '#FFD166',
    icono: ICONO_REGALO,
    inicio: { mes: 10, dia: 18 },
    fin: { mes: 10, dia: 18 },
  },
  {
    id: 'buen-fin',
    nombre: 'Buen Fin',
    mensaje: 'Buen Fin · toda la tienda',
    titulo: 'Llegó el Buen Fin',
    descripcion: 'Aprovecha los mejores precios del año en armazones, lentes de contacto y accesorios en ambas sucursales.',
    descuento: '20% OFF',
    colorFondo: '#0D213A',
    colorAcento: '#6B8FCE',
    icono: ICONO_BOLSA,
    inicio: { mes: 11, dia: 14 },
    fin: { mes: 11, dia: 17 },
  },
  {
    id: 'dia-madres',
    nombre: 'Día de las Madres',
    mensaje: 'Día de las Madres · 2x1 en armazones',
    titulo: 'Feliz Día de las Madres',
    descripcion: 'Consiente a mamá con un armazón nuevo: en la compra de uno, el segundo va por nuestra cuenta.',
    descuento: '2x1',
    colorFondo: '#13315C',
    colorAcento: '#F2B9D1',
    icono: ICONO_FLOR,
    inicio: { mes: 5, dia: 1 },
    fin: { mes: 5, dia: 10 },
  },
];

@Injectable({ providedIn: 'root' })
export class EventoCalendarioService {

  obtenerEventoActivo(fecha: Date = new Date()): EventoPromo | null {
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();

    for (const evento of EVENTOS) {
      if (this.estaEnRango(mes, dia, evento.inicio, evento.fin)) {
        return evento;
      }
    }
    return null;
  }

  private estaEnRango(
    mes: number, dia: number,
    inicio: { mes: number; dia: number }, fin: { mes: number; dia: number }
  ): boolean {
    const valor = mes * 100 + dia;
    const valorInicio = inicio.mes * 100 + inicio.dia;
    const valorFin = fin.mes * 100 + fin.dia;
    return valor >= valorInicio && valor <= valorFin;
  }
}