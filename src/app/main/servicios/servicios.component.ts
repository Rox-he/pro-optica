import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ServicioCardComponent } from './servicio-card/servicio-card.component';
import { NgFor } from '@angular/common';

interface Servicio { icon: SafeHtml; titulo: string; descripcion: string; idAncla: string; }

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [ServicioCardComponent, NgFor],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent {
  servicios: Servicio[] = [];

  constructor(private sanitizer: DomSanitizer) {
    const raw = [
      {
        icon: `<svg viewBox="0 0 40 40" width="32"><ellipse cx="20" cy="20" rx="18" ry="11" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`,
        titulo: 'Examen visual',
        descripcion: 'Diagnóstico computarizado de agudeza visual, graduación y salud ocular completa.',
        idAncla: 'examen-visual'
      },
      {
        icon: `<svg viewBox="0 0 40 40" width="32"><path d="M8 32 L14 18 L20 26 L26 14 L34 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        titulo: 'Mantenimiento',
        descripcion: 'Limpieza profesional, ajuste de armazón y cambio de micas sin costo adicional.',
        idAncla: 'mantenimiento'
      },
      {
        icon: `<svg viewBox="0 0 40 40" width="32"><rect x="3" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="23" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="17" y1="20" x2="23" y2="20" stroke="currentColor" stroke-width="2.5"/></svg>`,
        titulo: 'Venta de lentes',
        descripcion: 'Armazones de diseñador y lentes de contacto de la más alta calidad óptica.',
        idAncla: 'venta-de-lentes'
      },
      {
        icon: `<svg viewBox="0 0 40 40" width="32"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 20a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="17" r="1.6" fill="currentColor"/></svg>`,
        titulo: 'Atención especializada',
        descripcion: 'Optometristas certificados y asesoría personalizada para elegir lo que necesitas.',
        idAncla: 'atencion-especializada'
      },
    ];
    this.servicios = raw.map(s => ({ ...s, icon: this.sanitizer.bypassSecurityTrustHtml(s.icon) }));
  }
}
