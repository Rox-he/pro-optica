import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { EventoCalendarioService, EventoPromo } from '../../shared/services/evento-calendario.service';
import { SeasonParticlesComponent } from '../../shared/components/season-particles.component';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, NgIf, SeasonParticlesComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  evento: EventoPromo | null = null;

  constructor(private eventoService: EventoCalendarioService) {}

  ngOnInit() {
    // Si hay un evento calendarizado activo, el fondo del hero cambia
    // a los colores de esa promoción (mismo servicio que usa el banner).
    this.evento = this.eventoService.obtenerEventoActivo();
  }
}
