import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-servicio-card',
  standalone: true,
  imports: [],
  templateUrl: './servicio-card.component.html',
  styleUrl: './servicio-card.component.css'
})
export class ServicioCardComponent {
  @Input() icon: SafeHtml = '';
  @Input() titulo: string = '';
  @Input() descripcion: string = '';
  @Input() idAncla: string = '';
}
