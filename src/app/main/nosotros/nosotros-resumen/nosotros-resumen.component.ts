import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContadorComponent } from '../contador/contador.component';

@Component({
  selector: 'app-nosotros-resumen',
  standalone: true,
  imports: [RouterLink, ContadorComponent],
  templateUrl: './nosotros-resumen.component.html',
  styleUrl: './nosotros-resumen.component.css'
})
export class NosotrosResumenComponent {}
