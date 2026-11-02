import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromocionesAdminService, Promocion, PromocionForm } from './promociones-admin.service';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

@Component({
  selector: 'app-promociones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promociones-admin.component.html',
  styleUrl: './promociones-admin.component.css'
})
export class PromocionesAdminComponent implements OnInit {
  promociones: Promocion[] = [];
  cargando = false;
  procesando: number | null = null;

  meses = MESES;
  iconos = ['etiqueta', 'sol', 'mochila', 'regalo', 'bolsa', 'flor'];

  mostrarForm = false;
  editandoId: number | null = null;
  guardando = false;
  error = '';
  aviso = '';
  modelo: PromocionForm = this.formularioVacio();

  constructor(private service: PromocionesAdminService) {}

  ngOnInit(): void { this.cargar(); }

  private formularioVacio(): PromocionForm {
    return {
      nombre: '', titulo: '', descuento: '', detalle: '', descripcion: '', icono: 'etiqueta',
      color_fondo: '#0D213A', color_acento: '#FFC93C',
      mes_inicio: 1, dia_inicio: 1, mes_fin: 1, dia_fin: 1
    };
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (data) => { this.promociones = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  get activas(): number { return this.promociones.filter(p => p.activa).length; }

  rango(p: Promocion): string {
    const ini = `${p.dia_inicio} ${MESES[p.mes_inicio - 1]}`;
    const fin = `${p.dia_fin} ${MESES[p.mes_fin - 1]}`;
    return ini === fin ? ini : `${ini} – ${fin}`;
  }

  /** ¿Está vigente hoy? (misma regla que usa la API) */
  vigenteHoy(p: Promocion): boolean {
    const hoy = new Date();
    const v = (hoy.getMonth() + 1) * 100 + hoy.getDate();
    return p.activa && v >= p.mes_inicio * 100 + p.dia_inicio && v <= p.mes_fin * 100 + p.dia_fin;
  }

  diasDe(mes: number): number[] {
    return Array.from({ length: DIAS_POR_MES[mes - 1] || 31 }, (_, i) => i + 1);
  }

  // ── Formulario ──
  abrirNueva(): void {
    this.modelo = this.formularioVacio();
    this.editandoId = null;
    this.error = '';
    this.mostrarForm = true;
  }

  abrirEditar(p: Promocion): void {
    const { id, activa, ...resto } = p;
    this.modelo = { ...resto };
    this.editandoId = id;
    this.error = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void { this.mostrarForm = false; }

  guardar(): void {
    this.error = '';
    const m = this.modelo;
    if (!m.nombre.trim() || !m.descuento.trim()) {
      this.error = 'Escribe el nombre y el descuento de la promoción.';
      return;
    }
    if (m.mes_fin * 100 + m.dia_fin < m.mes_inicio * 100 + m.dia_inicio) {
      this.error = 'La fecha final no puede ser anterior a la inicial.';
      return;
    }
    this.guardando = true;
    const peticion = this.editandoId === null
      ? this.service.crear(m)
      : this.service.editar(this.editandoId, m);
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm = false;
        this.mostrarAviso(this.editandoId === null ? 'Promoción creada. Ya aparece en el sitio cuando llegue su fecha.' : 'Promoción actualizada.');
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.error || 'No se pudo guardar la promoción';
      }
    });
  }

  alternar(p: Promocion): void {
    this.procesando = p.id;
    this.service.activar(p.id, !p.activa).subscribe({
      next: (r) => { p.activa = r.activa; this.procesando = null; this.mostrarAviso(r.mensaje + '.'); },
      error: (err) => { this.procesando = null; this.error = err.error?.error || 'Error al actualizar la promoción'; }
    });
  }

  eliminar(p: Promocion): void {
    if (!confirm(`¿Eliminar la promoción "${p.nombre}"?`)) return;
    this.procesando = p.id;
    this.service.eliminar(p.id).subscribe({
      next: () => { this.procesando = null; this.mostrarAviso('Promoción eliminada.'); this.cargar(); },
      error: (err) => { this.procesando = null; this.error = err.error?.error || 'Error al eliminar la promoción'; }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso = texto;
    setTimeout(() => { if (this.aviso === texto) this.aviso = ''; }, 6000);
  }
}
