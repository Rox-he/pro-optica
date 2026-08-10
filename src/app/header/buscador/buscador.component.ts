import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ProductoSugerido {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  imagen: string;
}

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './buscador.component.html',
  styleUrl: './buscador.component.css'
})
export class BuscadorComponent {
  query = '';
  abierto = false;
  sugerencias: ProductoSugerido[] = [];
  buscando = false;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  toggle() {
    this.abierto = !this.abierto;
    if (!this.abierto) this.sugerencias = [];
  }

  onInput() {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);

    if (!this.query.trim()) {
      this.sugerencias = [];
      return;
    }

    // Espera 300ms después de que el usuario deja de teclear, para no saturar la API
    this.debounceTimeout = setTimeout(() => this.buscarEnVivo(), 300);
  }

  private buscarEnVivo() {
    this.buscando = true;
    this.http.get<{ total: number; resultados: ProductoSugerido[] }>(
      `${environment.apiUrl}/buscar?q=${encodeURIComponent(this.query)}`
    ).subscribe({
      next: (res) => {
        this.sugerencias = res.resultados.slice(0, 5); // solo 5 sugerencias en el dropdown
        this.buscando = false;
      },
      error: () => {
        this.sugerencias = [];
        this.buscando = false;
      }
    });
  }

  irAProducto(id: string) {
  this.router.navigate(['/productos'], { fragment: 'producto-' + id });
  this.cerrarTodo();
}

  buscar() {
    if (!this.query.trim()) return;
    this.router.navigate(['/buscar'], { queryParams: { q: this.query } });
    this.cerrarTodo();
  }

  private cerrarTodo() {
    this.abierto = false;
    this.sugerencias = [];
    this.query = '';
  }
}