import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasAdminService, Cita, EstatusCita } from './citas-admin.service';

type Filtro = 'pendiente' | 'confirmada' | 'rechazada' | 'todas';

@Component({
  selector: 'app-citas-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas-admin.component.html',
  styleUrl: './citas-admin.component.css'
})
export class CitasAdminComponent implements OnInit {
  citas: Cita[] = [];
  cargando = false;
  filtro: Filtro = 'pendiente';
  procesando: number | null = null;   // id de la cita que se está actualizando

  constructor(private service: CitasAdminService) {}

  ngOnInit(): void {
    this.cargar();
  }

  get citasFiltradas(): Cita[] {
    if (this.filtro === 'todas') return this.citas;
    return this.citas.filter(c => c.estatus === this.filtro);
  }

  contar(estatus: EstatusCita): number {
    return this.citas.filter(c => c.estatus === estatus).length;
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (data) => { this.citas = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  cambiarEstatus(cita: Cita, estatus: EstatusCita): void {
    this.procesando = cita.id;
    this.service.cambiarEstatus(cita.id, estatus).subscribe({
      next: () => { cita.estatus = estatus; this.procesando = null; },
      error: (err) => {
        this.procesando = null;
        alert(err.error?.error || 'Error al actualizar la cita');
      }
    });
  }

  sucursalCorta(sucursal: string): string {
    return sucursal.split(' — ')[0];
  }

  etiqueta(estatus: EstatusCita): string {
    return { pendiente: 'Pendiente', confirmada: 'Confirmada', rechazada: 'Rechazada' }[estatus];
  }

  // "2026-10-15" + "16:30:00" → "15 oct 2026 · 16:30"
  formatearCita(c: Cita): string {
    if (!c.fecha_cita) return 'Sin fecha';
    const [y, m, d] = c.fecha_cita.slice(0, 10).split('-').map(Number);
    const fecha = new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    return c.hora_cita ? `${fecha} · ${c.hora_cita.slice(0, 5)}` : fecha;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
