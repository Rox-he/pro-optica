import { Component } from '@angular/core';
import { ServiciosComponent } from '../../main/servicios/servicios.component';
@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [ServiciosComponent],
  templateUrl: './servicios-page.component.html',
})
export class ServiciosPageComponent {}
