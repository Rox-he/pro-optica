// src/app/core/models/temporada.model.ts

export interface Temporada {
  id: 'primavera' | 'verano' | 'otono' | 'invierno';
  nombre: string;
  mensaje: string;
  icono: string;
  particula: string;
  animacion: 'caer' | 'flotar';
  colorPrimario: string;
  colorSecundario: string;
  coleccionDestacada: string;
  imagenBanner: string;
}