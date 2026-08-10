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
    this.evento = this.eventoService.obtenerEventoActivo();
    if (this.evento) {
      this.iconoSafe = this.sanitizer.bypassSecurityTrustHtml(this.evento.icono);
    }
  }

  cerrar() { this.cerrado = true; }
}