import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TemporadaService } from '../../core/services/temporada.service';
import { Temporada } from '../../core/models/temporada.model';

interface Particula {
  izquierda: number;
  retraso: number;
  duracion: number;
  tamano: number;
}

@Component({
  selector: 'app-season-particles',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './season-particles.component.html',
  styleUrls: ['./season-particles.component.scss']
})
export class SeasonParticlesComponent implements OnInit {

  temporada?: Temporada;
  particulas: Particula[] = [];

  constructor(private temporadaService: TemporadaService) {}

  ngOnInit(): void {
  this.temporada = this.temporadaService.obtenerTemporadaActual();

  const cantidad = 20;
this.particulas = Array.from({ length: cantidad }, () => ({
  izquierda: Math.random() * 100,
  retraso: Math.random() * 10,
  duracion: 8 + Math.random() * 6,
  tamano: 1 + Math.random() * 0.8
}));

    const evento = new CustomEvent<Temporada>('temporada:actualizada', {
      detail: this.temporada,
      bubbles: true
    });
    window.dispatchEvent(evento);
  }
}