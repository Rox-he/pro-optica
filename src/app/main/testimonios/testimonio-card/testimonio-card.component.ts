import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-testimonio-card',
  standalone: true,
  templateUrl: './testimonio-card.component.html',
  styleUrl: './testimonio-card.component.css'
})
export class TestimonioCardComponent {
  @Input() texto = '';
  @Input() autor = '';
}
