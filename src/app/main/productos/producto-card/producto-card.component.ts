import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.css'
})
export class ProductoCardComponent {
  @Input() imagen!: string;
  @Input() nombre!: string;
  @Input() precio!: number;
  @Input() destacado = false;
}