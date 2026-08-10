import { Component } from '@angular/core';
import { ContadorComponent } from './contador/contador.component';
import { MascotaComponent } from './mascota/mascota.component';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [ContadorComponent, MascotaComponent],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {}
