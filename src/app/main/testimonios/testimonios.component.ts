import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { TestimonioCardComponent } from './testimonio-card/testimonio-card.component';

@Component({
  selector: 'app-testimonios',
  standalone: true,
  imports: [TestimonioCardComponent, NgFor],
  templateUrl: './testimonios.component.html',
  styleUrl: './testimonios.component.css'
})
export class TestimoniosComponent {
  testimonios = [
    { texto: 'El examen fue rapidísimo y por fin entiendo mi graduación real. Mis lentes nuevos cambiaron mi día a día.', autor: 'Mariana Pérez' },
    { texto: 'Llevé a mis dos hijos y el trato fue excelente. Los armazones para niños son resistentes y bonitos.', autor: 'Jorge Hernández' },
    { texto: 'Tenía años sin renovar mis lentes de contacto. Me explicaron todo con paciencia y ahora veo perfecto.', autor: 'Ana Lucía Ramos' },
  ];
  actual = 0;
  siguiente(){ this.actual = (this.actual + 1) % this.testimonios.length; }
  anterior(){ this.actual = (this.actual - 1 + this.testimonios.length) % this.testimonios.length; }
}
