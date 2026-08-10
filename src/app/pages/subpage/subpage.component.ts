import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface SubpageData {
  eyebrow: string;
  titulo: string;
  resumen: string;
  icono: string;       // SVG crudo
  puntos: string[];    // lista de bullets
  ctaTexto: string;
  ctaLink: string;
  volverLink: string;
  volverTexto: string;
}

@Component({
  selector: 'app-subpage',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './subpage.component.html',
  styleUrl: './subpage.component.css'
})
export class SubpageComponent implements OnInit {
  data!: SubpageData;
  iconoSafe: SafeHtml = '';

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.data = this.route.snapshot.data['contenido'] as SubpageData;
    this.iconoSafe = this.sanitizer.bypassSecurityTrustHtml(this.data.icono);
  }
}
