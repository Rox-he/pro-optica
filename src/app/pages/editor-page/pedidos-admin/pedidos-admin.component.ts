import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosAdminService, Pedido, EstatusPedido, ProductoMini } from './pedidos-admin.service';

type Filtro = EstatusPedido | 'todos';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css'
})
export class PedidosAdminComponent implements OnInit {
  pedidos: Pedido[] = [];
  productos: ProductoMini[] = [];
  cargando = false;
  filtro: Filtro = 'en_proceso';
  procesando: number | null = null;   // id del pedido que se está actualizando

  // Formulario "Nuevo pedido"
  mostrarForm = false;
  guardando = false;
  error = '';
  aviso = '';
  cuentaEncontrada: boolean | null = null;   // null = aún no se consulta
  nombreCuenta = '';
  modelo = this.formularioVacio();

  constructor(private service: PedidosAdminService) {}

  ngOnInit(): void {
    this.cargar();
    this.service.productos().subscribe({
      next: (p) => (this.productos = p),
      error: (err) => console.error(err)
    });
  }

  private formularioVacio() {
    return {
      cliente_nombre: '',
      cliente_correo: '',
      cliente_telefono: '',
      producto_id: '' as number | '' | 'otro',
      armazon: '',
      notas: ''
    };
  }

  get pedidosFiltrados(): Pedido[] {
    if (this.filtro === 'todos') return this.pedidos;
    return this.pedidos.filter(p => p.estatus === this.filtro);
  }

  contar(estatus: EstatusPedido): number {
    return this.pedidos.filter(p => p.estatus === estatus).length;
  }

  etiqueta(estatus: EstatusPedido): string {
    return { en_proceso: 'En proceso', listo: 'Listo para recoger', entregado: 'Entregado' }[estatus];
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar().subscribe({
      next: (data) => { this.pedidos = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  // ── Formulario ──
  abrirForm(): void {
    this.modelo = this.formularioVacio();
    this.error = '';
    this.cuentaEncontrada = null;
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
  }

  // Al salir del campo de correo se revisa si el cliente tiene cuenta (para avisarle en su reloj)
  revisarCorreo(): void {
    const correo = this.modelo.cliente_correo.trim();
    this.cuentaEncontrada = null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return;
    this.service.buscarCliente(correo).subscribe({
      next: (r) => { this.cuentaEncontrada = r.existe; this.nombreCuenta = r.nombre || ''; },
      error: () => (this.cuentaEncontrada = null)
    });
  }

  guardar(): void {
    this.error = '';
    const m = this.modelo;
    if (!m.cliente_nombre.trim() || !m.cliente_correo.trim()) {
      this.error = 'Escribe el nombre y el correo del cliente.';
      return;
    }
    if (m.producto_id === '' || (m.producto_id === 'otro' && !m.armazon.trim())) {
      this.error = 'Elige un armazón del catálogo o escribe cuál es.';
      return;
    }

    this.guardando = true;
    this.service.crear({
      cliente_nombre: m.cliente_nombre.trim(),
      cliente_correo: m.cliente_correo.trim(),
      cliente_telefono: m.cliente_telefono.trim() || undefined,
      producto_id: m.producto_id === 'otro' ? null : Number(m.producto_id),
      armazon: m.producto_id === 'otro' ? m.armazon.trim() : undefined,
      notas: m.notas.trim() || undefined
    }).subscribe({
      next: (r) => {
        this.guardando = false;
        this.mostrarForm = false;
        this.filtro = 'en_proceso';
        this.mostrarAviso(r.cuenta_vinculada
          ? 'Pedido registrado. El cliente recibirá los avisos en su reloj.'
          : 'Pedido registrado. Ese correo no tiene cuenta, así que no habrá avisos en el reloj.');
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err.error?.error || 'No se pudo registrar el pedido';
      }
    });
  }

  // ── Cambio de estatus ──
  cambiarEstatus(pedido: Pedido, estatus: EstatusPedido): void {
    this.procesando = pedido.id;
    this.service.cambiarEstatus(pedido.id, estatus).subscribe({
      next: (r) => {
        pedido.estatus = estatus;
        this.procesando = null;
        if (estatus === 'listo') {
          this.mostrarAviso(r.aviso_enviado
            ? 'Listo. Se envió el aviso "Tu armazón ya está listo" al reloj del cliente.'
            : 'Marcado como listo. No se envió aviso al reloj (el cliente no tiene cuenta ligada o ya se había avisado).');
        }
      },
      error: (err) => {
        this.procesando = null;
        alert(err.error?.error || 'Error al actualizar el pedido');
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso = texto;
    setTimeout(() => { if (this.aviso === texto) this.aviso = ''; }, 6000);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
