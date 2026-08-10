import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ProductoMini {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-productos-resumen',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './productos-resumen.component.html',
  styleUrl: './productos-resumen.component.css'
})
export class ProductosResumenComponent implements OnInit {
  productos: ProductoMini[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ProductoMini[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (data) => {
        // Solo mostramos 3 destacados en el resumen del home
        this.productos = data.slice(0, 3);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }
}