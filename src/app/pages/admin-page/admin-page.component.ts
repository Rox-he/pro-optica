import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

interface UsuarioAdmin {
  id: number; nombre: string; email: string;
  rol: string; roles: string[]; activo: boolean; creado_en: string;
}

type TipoConfirmacion = 'desactivar' | 'activar' | 'eliminar';

interface ConfirmacionPendiente {
  tipo: TipoConfirmacion;
  usuario: UsuarioAdmin;
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit {
  private readonly API = environment.apiUrl;

  usuarios: UsuarioAdmin[] = [];
  cargando = false;
  error = '';
  roles = ['Administrador', 'Editor'];
  toast = ''; // mensaje temporal de confirmación

  // ── Modal crear/editar ──────────────────────────────────────────
  modalAbierto = false;
  modoEdicion = false;
  guardando = false;
  errorModal = '';
  usuarioEditando: UsuarioAdmin | null = null;
  form = { nombre: '', email: '', password: '', rol_nombre: 'Editor' };

  // ── Modal de confirmación (activar/desactivar/eliminar) ──────────
  confirmacion: ConfirmacionPendiente | null = null;
  procesandoConfirmacion = false;

  constructor(public auth: AuthService) {}

  ngOnInit() { this.cargarUsuarios(); }

  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.activo).length;
  }

  private mostrarToast(msg: string) {
    this.toast = msg;
    setTimeout(() => { if (this.toast === msg) this.toast = ''; }, 3000);
  }

  private headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.auth.token}` };
  }

  async cargarUsuarios() {
    this.cargando = true;
    this.error = '';
    try {
      const resp = await fetch(`${this.API}/admin/users`, { headers: this.headers() });
      if (!resp.ok) throw new Error();
      this.usuarios = await resp.json();
    } catch {
      this.error = 'No se pudieron cargar los usuarios. Verifica que el servidor esté activo.';
    } finally {
      this.cargando = false;
    }
  }

  // ── Crear ──────────────────────────────────────────────────────
  abrirCrear() {
    this.modoEdicion = false;
    this.usuarioEditando = null;
    this.errorModal = '';
    this.form = { nombre: '', email: '', password: '', rol_nombre: 'Editor' };
    this.modalAbierto = true;
  }

  // ── Editar ─────────────────────────────────────────────────────
  abrirEditar(u: UsuarioAdmin) {
    this.modoEdicion = true;
    this.usuarioEditando = u;
    this.errorModal = '';
    this.form = { nombre: u.nombre, email: u.email, password: '', rol_nombre: u.rol };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async guardar() {
    this.errorModal = '';
    if (!this.form.nombre.trim() || !this.form.email.trim()) {
      this.errorModal = 'Nombre y correo son obligatorios';
      return;
    }
    if (!this.modoEdicion && this.form.password.length < 8) {
      this.errorModal = 'La contraseña debe tener mínimo 8 caracteres';
      return;
    }

    this.guardando = true;
    try {
      if (this.modoEdicion && this.usuarioEditando) {
        // 1) actualizar nombre/email
        const resp = await fetch(`${this.API}/admin/users/${this.usuarioEditando.id}`, {
          method: 'PUT', headers: this.headers(),
          body: JSON.stringify({ nombre: this.form.nombre, email: this.form.email }),
        });
        const data = await resp.json();
        if (!resp.ok) { this.errorModal = data.error ?? 'Error al actualizar'; this.guardando = false; return; }

        // 2) actualizar rol si cambió
        if (this.form.rol_nombre !== this.usuarioEditando.rol) {
          await this.cambiarRol(this.usuarioEditando, this.form.rol_nombre, false);
        }
      } else {
        // crear
        const resp = await fetch(`${this.API}/admin/users`, {
          method: 'POST', headers: this.headers(),
          body: JSON.stringify(this.form),
        });
        const data = await resp.json();
        if (!resp.ok) { this.errorModal = data.error ?? 'Error al crear usuario'; this.guardando = false; return; }
      }

      this.modalAbierto = false;
      await this.cargarUsuarios();
      this.mostrarToast(this.modoEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
    } catch {
      this.errorModal = 'No se pudo conectar con el servidor';
    } finally {
      this.guardando = false;
    }
  }

  // ── Cambiar rol directo desde la tabla ────────────────────────────
  async cambiarRol(usuario: UsuarioAdmin, nuevoRol: string, recargar = true) {
    await fetch(`${this.API}/admin/users/${usuario.id}/rol`, {
      method: 'PUT', headers: this.headers(),
      body: JSON.stringify({ rol_nombre: nuevoRol }),
    });
    if (recargar) {
      await this.cargarUsuarios();
      this.mostrarToast(`Rol actualizado a ${nuevoRol}`);
    }
  }

  // ── Activar / desactivar ──────────────────────────────────────────
  pedirToggleEstado(usuario: UsuarioAdmin) {
    const activar = !usuario.activo;
    this.confirmacion = {
      tipo: activar ? 'activar' : 'desactivar',
      usuario,
      titulo: activar ? 'Activar usuario' : 'Desactivar usuario',
      mensaje: activar
        ? `${usuario.nombre} podrá volver a iniciar sesión en el sitio.`
        : `${usuario.nombre} no podrá iniciar sesión hasta que lo actives de nuevo.`,
    };
  }

  // ── Eliminar definitivamente ──────────────────────────────────────
  pedirEliminar(usuario: UsuarioAdmin) {
    this.confirmacion = {
      tipo: 'eliminar',
      usuario,
      titulo: 'Eliminar usuario',
      mensaje: `Esta acción es irreversible. Se eliminará a ${usuario.nombre} y todos sus datos de forma permanente.`,
    };
  }

  cancelarConfirmacion() {
    this.confirmacion = null;
  }

  async confirmarAccion() {
    if (!this.confirmacion) return;
    const { tipo, usuario } = this.confirmacion;
    this.procesandoConfirmacion = true;

    try {
      if (tipo === 'eliminar') {
        await fetch(`${this.API}/admin/users/${usuario.id}`, {
          method: 'DELETE', headers: this.headers(),
        });
        await this.cargarUsuarios();
        this.mostrarToast('Usuario eliminado permanentemente');
      } else {
        const activo = tipo === 'activar';
        await fetch(`${this.API}/admin/users/${usuario.id}/estado`, {
          method: 'PUT', headers: this.headers(),
          body: JSON.stringify({ activo }),
        });
        await this.cargarUsuarios();
        this.mostrarToast(activo ? 'Usuario activado' : 'Usuario desactivado');
      }
    } finally {
      this.procesandoConfirmacion = false;
      this.confirmacion = null;
    }
  }
}
