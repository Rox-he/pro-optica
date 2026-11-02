import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EventoCalendarioService, EventoPromo } from '../../shared/services/evento-calendario.service';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.css'
})
export class PromoBannerComponent implements OnInit {
  evento: EventoPromo | null = null;
  iconoSafe: SafeHtml = '';
  cerrado = false;

  constructor(private eventoService: EventoCalendarioService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // La promoción viene de la base de datos (si la API falla, se usa la lista fija de respaldo).
    this.eventoService.eventoVigente().subscribe(e => {
      this.evento = e;
      if (e) this.iconoSafe = this.sanitizer.bypassSecurityTrustHtml(e.icono);
    });
  }

  cerrar() { this.cerrado = true; }
}