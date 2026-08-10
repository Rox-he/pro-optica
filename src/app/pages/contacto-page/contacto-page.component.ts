import { Component } from '@angular/core';
import { ContactoComponent } from '../../main/contacto/contacto.component';
@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [ContactoComponent],
  templateUrl: './contacto-page.component.html',
})
export class ContactoPageComponent {}
