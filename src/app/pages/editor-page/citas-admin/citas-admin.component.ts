import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasAdminService, Cita } from './citas-admin.service';

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
  filtro: 'todas' | 'pendientes' | 'atendidas' = 'pendientes';

  constructor(private service: CitasAdminService) {}

  ngOnInit(): void {
    this.cargar();
  }

  get citasFiltradas(): Cita[] {
    if (this.filtro === 'pendientes') return this.citas.filter(c => !c.atendida);
    if (this.filtro === 'atendidas') return this.citas.filter(c => c.atendida);
    return this.citas;
  }

  get pendientesCount(): number {
    return this.citas.filter(c => !c.atendida).length;
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (data) => { this.citas = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  toggleAtendida(cita: Cita): void {
    const nuevoEstado = !cita.atendida;
    this.service.marcarAtendida(cita.id, nuevoEstado).subscribe({
      next: () => { cita.atendida = nuevoEstado; },
      error: (err) => alert(err.error?.error || 'Error al actualizar la cita')
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}