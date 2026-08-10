import { Injectable } from '@angular/core';
import { Temporada } from '../models/temporada.model';

@Injectable({ providedIn: 'root' })
export class TemporadaService {

  private readonly temporadas: Temporada[] = [
    {
      id: 'primavera',
      nombre: 'Primavera',
      mensaje: 'Renueva tu mirada esta primavera',
      icono: '🌸',
      particula: '🌸',
      animacion: 'caer',
      colorPrimario: '#8BC34A',
      colorSecundario: '#F1F8E9',
      coleccionDestacada: 'Armazones ligeros y colores pastel',
      imagenBanner: 'assets/banners/primavera.jpg'
    },
    {
      id: 'verano',
      nombre: 'Verano',
      mensaje: 'Protege tu vista este verano',
      icono: '☀️',
      particula: '✨',
      animacion: 'flotar',
      colorPrimario: '#0E6E8C',
      colorSecundario: '#E1F5FE',
      coleccionDestacada: 'Lentes de sol con protección UV400',
      imagenBanner: 'assets/banners/verano.jpg'
    },
    {
      id: 'otono',
      nombre: 'Otoño',
      mensaje: 'Estilo cálido para el regreso a clases',
      icono: '🍂',
      particula: '🍂',
      animacion: 'caer',
      colorPrimario: '#D2691E',
      colorSecundario: '#FBE9E7',
      coleccionDestacada: 'Armazones en tonos tierra',
      imagenBanner: 'assets/banners/otono.jpg'
    },
    {
      id: 'invierno',
      nombre: 'Invierno',
      mensaje: 'Comodidad y calidez para tus ojos',
      icono: '❄️',
      particula: '❄️',
      animacion: 'caer',
      colorPrimario: '#13315C',
      colorSecundario: '#E8EAF6',
      coleccionDestacada: 'Lentes con filtro de luz azul',
      imagenBanner: 'assets/banners/invierno.jpg'
    }
  ];

  obtenerTemporadaActual(fecha: Date = new Date()): Temporada {
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    if ((mes === 2 && dia >= 20) || mes === 3 || mes === 4 || (mes === 5 && dia < 21)) {
      return this.temporadas[0];
    }
    if ((mes === 5 && dia >= 21) || mes === 6 || mes === 7 || (mes === 8 && dia < 23)) {
      return this.temporadas[1];
    }
    if ((mes === 8 && dia >= 23) || mes === 9 || mes === 10 || (mes === 11 && dia < 21)) {
      return this.temporadas[2];
    }
    return this.temporadas[3];
  }
}