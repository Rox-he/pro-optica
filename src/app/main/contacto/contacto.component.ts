import { Component } from '@angular/core';
import { ContactoFormComponent } from './contacto-form/contacto-form.component';
import { MapaSucursalComponent } from './mapa-sucursal/mapa-sucursal.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ContactoFormComponent, MapaSucursalComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {}
