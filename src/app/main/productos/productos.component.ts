import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ProductoCardComponent } from './producto-card/producto-card.component';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
}

interface CategoriaGrupo {
  idAncla: string;
  titulo: string;
  productos: Producto[];
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ProductoCardComponent, NgFor],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  categorias: CategoriaGrupo[] = [];
  productoDestacadoId: number | null = null;
  private datosCargados = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.http.get<Producto[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (data) => {
        this.categorias = this.agruparPorCategoria(data);
        this.datosCargados = true;
        this.procesarFragment(this.route.snapshot.fragment);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });

    this.route.fragment.subscribe(fragment => {
      if (this.datosCargados) {
        this.procesarFragment(fragment);
      }
    });
  }

  private procesarFragment(fragment: string | null): void {
    if (!fragment) return;

    if (fragment.startsWith('producto-')) {
      this.productoDestacadoId = Number(fragment.replace('producto-', ''));
      // quita el resaltado después de un rato
      setTimeout(() => { this.productoDestacadoId = null; }, 4000);
    } else {
      this.productoDestacadoId = null;
    }

    // Espera más tiempo para dar chance a que las imágenes carguen y el layout se estabilice
    setTimeout(() => {
      const el = document.getElementById(fragment);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }

  private agruparPorCategoria(productos: Producto[]): CategoriaGrupo[] {
    const mapa = new Map<string, Producto[]>();
    for (const p of productos) {
      if (!mapa.has(p.categoria)) mapa.set(p.categoria, []);
      mapa.get(p.categoria)!.push(p);
    }
    return Array.from(mapa.entries()).map(([titulo, productos]) => ({
      idAncla: this.slug(titulo),
      titulo,
      productos
    }));
  }

  private slug(texto: string): string {
    return texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}