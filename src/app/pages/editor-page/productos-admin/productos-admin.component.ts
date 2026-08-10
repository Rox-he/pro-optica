import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosAdminService, Producto } from './productos-admin.service';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-admin.component.html',
  styleUrl: './productos-admin.component.css'
})
export class ProductosAdminComponent implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  mostrarForm = false;
  editando: Producto | null = null;
  guardando = false;
  errorModal = '';

  confirmacion: Producto | null = null;
  procesandoConfirmacion = false;

  modelo: Producto = this.formularioVacio();

  constructor(private service: ProductosAdminService) {}

  ngOnInit(): void {
    this.cargar();
  }

  get categoriasUnicas(): string[] {
    return [...new Set(this.productos.map(p => p.categoria))];
  }

  get stockTotal(): number {
    return this.productos.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (data) => { this.productos = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  nuevoProducto(): void {
    this.editando = null;
    this.modelo = this.formularioVacio();
    this.errorModal = '';
    this.mostrarForm = true;
  }

  editar(producto: Producto): void {
    this.editando = producto;
    this.modelo = { ...producto };
    this.errorModal = '';
    this.mostrarForm = true;
  }

  guardar(): void {
    this.guardando = true;
    this.errorModal = '';

    const obs = this.editando?.id
      ? this.service.editar(this.editando.id, this.modelo)
      : this.service.crear(this.modelo);

    obs.subscribe({
      next: () => { this.cargar(); this.cerrarForm(); this.guardando = false; },
      error: (err) => {
        this.errorModal = err.error?.error || 'Error al guardar el producto';
        this.guardando = false;
      }
    });
  }

  pedirEliminar(producto: Producto): void {
    this.confirmacion = producto;
  }

  cancelarConfirmacion(): void {
    this.confirmacion = null;
  }

  confirmarEliminar(): void {
    if (!this.confirmacion?.id) return;
    this.procesandoConfirmacion = true;
    this.service.eliminar(this.confirmacion.id).subscribe({
      next: () => {
        this.cargar();
        this.confirmacion = null;
        this.procesandoConfirmacion = false;
      },
      error: (err) => {
        alert(err.error?.error || 'Error al eliminar producto');
        this.procesandoConfirmacion = false;
      }
    });
  }

  // Alias para el HTML (por si quedó referenciado como eliminar())
  eliminar(producto: Producto): void {
    this.pedirEliminar(producto);
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.editando = null;
    this.errorModal = '';
    this.modelo = this.formularioVacio();
  }

  private formularioVacio(): Producto {
    return {
      nombre: '', marca: '', categoria: 'Armazones', descripcion: '',
      precio: 0, color: '', material: '', genero: 'Unisex', imagen: '', stock: 0
    };
  }
}