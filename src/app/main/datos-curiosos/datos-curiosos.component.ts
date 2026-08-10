import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormaCardComponent } from './forma-card/forma-card.component';

interface FormaRostro {
  rostroSvg: SafeHtml;
  rostroNombre: string;
  armazonRecomendado: string;
  tip: string;
}

@Component({
  selector: 'app-datos-curiosos',
  standalone: true,
  imports: [FormaCardComponent, NgFor],
  templateUrl: './datos-curiosos.component.html',
  styleUrl: './datos-curiosos.component.css'
})
export class DatosCuriososComponent {
  formas: FormaRostro[] = [];

  constructor(private sanitizer: DomSanitizer) {
    const raw = [
      {
        // rostro ovalado
        svg: `<svg viewBox="0 0 60 70" width="56"><ellipse cx="30" cy="35" rx="22" ry="30" fill="none" stroke="#13315C" stroke-width="3"/></svg>`,
        rostroNombre: 'Ovalado',
        armazonRecomendado: 'Cuadrados o rectangulares',
        tip: 'Aportan ángulos que equilibran la suavidad natural del rostro.'
      },
      {
        // rostro redondo
        svg: `<svg viewBox="0 0 60 70" width="56"><circle cx="30" cy="35" r="26" fill="none" stroke="#6B8FCE" stroke-width="3"/></svg>`,
        rostroNombre: 'Redondo',
        armazonRecomendado: 'Rectangulares angulosos',
        tip: 'Alargan visualmente el rostro y marcan más los rasgos.'
      },
      {
        // rostro cuadrado
        svg: `<svg viewBox="0 0 60 70" width="56"><rect x="8" y="9" width="44" height="52" rx="8" fill="none" stroke="#0D213A" stroke-width="3"/></svg>`,
        rostroNombre: 'Cuadrado',
        armazonRecomendado: 'Redondos u ovalados',
        tip: 'Suavizan las líneas marcadas de la mandíbula.'
      },
      {
        // rostro corazón
        svg: `<svg viewBox="0 0 60 70" width="56"><path d="M30 8 C10 8 6 28 14 40 C20 50 26 55 30 62 C34 55 40 50 46 40 C54 28 50 8 30 8 Z" fill="none" stroke="#13315C" stroke-width="3"/></svg>`,
        rostroNombre: 'Corazón',
        armazonRecomendado: 'Tipo aviador o sin marco',
        tip: 'Equilibran una frente ancha con una barbilla más afilada.'
      },
    ];
    this.formas = raw.map(f => ({
      rostroSvg: this.sanitizer.bypassSecurityTrustHtml(f.svg),
      rostroNombre: f.rostroNombre,
      armazonRecomendado: f.armazonRecomendado,
      tip: f.tip,
    }));
  }
}
