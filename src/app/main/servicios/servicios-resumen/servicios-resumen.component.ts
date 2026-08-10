import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ServicioMini { icon: SafeHtml; titulo: string; }

@Component({
  selector: 'app-servicios-resumen',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './servicios-resumen.component.html',
  styleUrl: './servicios-resumen.component.css'
})
export class ServiciosResumenComponent {
  servicios: ServicioMini[] = [];
  constructor(private sanitizer: DomSanitizer) {
    const raw = [
      { titulo: 'Examen visual', svg: `<svg viewBox="0 0 40 40" width="28"><ellipse cx="20" cy="20" rx="18" ry="11" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>` },
      { titulo: 'Mantenimiento', svg: `<svg viewBox="0 0 40 40" width="28"><path d="M8 32 L14 18 L20 26 L26 14 L34 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
      { titulo: 'Venta de lentes', svg: `<svg viewBox="0 0 40 40" width="28"><rect x="3" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="23" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="17" y1="20" x2="23" y2="20" stroke="currentColor" stroke-width="2.5"/></svg>` },
      { titulo: 'Atención especializada', svg: `<svg viewBox="0 0 40 40" width="28"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 20a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="17" r="1.6" fill="currentColor"/></svg>` },
    ];
    this.servicios = raw.map(s => ({ titulo: s.titulo, icon: this.sanitizer.bypassSecurityTrustHtml(s.svg) }));
  }
}
