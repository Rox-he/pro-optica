import { Component } from '@angular/core';
import { ProductosComponent } from '../../main/productos/productos.component';
@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [ProductosComponent],
  templateUrl: './productos-page.component.html',
})
export class ProductosPageComponent {}
