import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-forma-card',
  standalone: true,
  templateUrl: './forma-card.component.html',
  styleUrl: './forma-card.component.css'
})
export class FormaCardComponent {
  @Input() rostroSvg: SafeHtml = '';
  @Input() rostroNombre = '';
  @Input() armazonRecomendado = '';
  @Input() tip = '';
}
