import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

interface NavItem {
  label: string;
  icon: 'perfil' | 'usuarios' | 'editor' | 'productos' | 'citas' | 'generico';
  ruta: string;
  rolesPermitidos: string[]; // vacío = visible para cualquier usuario autenticado
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  sidebarAbierto = true;

  // ── Navegación del panel ──────────────────────────────────────────
  // Agregar aquí nuevas secciones del panel según crezca el proyecto.
  navItems: NavItem[] = [
    { label: 'Mi perfil',            icon: 'perfil',    ruta: '/perfil',           rolesPermitidos: [] },
    { label: 'Gestión de usuarios',  icon: 'usuarios',  ruta: '/admin',            rolesPermitidos: ['Administrador'] },
    { label: 'Editar contenido',     icon: 'editor',    ruta: '/editor',           rolesPermitidos: ['Administrador', 'Editor'] },
    { label: 'Productos',            icon: 'productos', ruta: '/editor/productos', rolesPermitidos: ['Administrador', 'Editor'] },
    { label: 'Citas', icon: 'citas', ruta: '/editor/citas', rolesPermitidos: ['Administrador', 'Editor'] },
  ];

  constructor(public auth: AuthService) {}

  get usuario() {
    return this.auth.usuario;
  }

  itemVisible(item: NavItem): boolean {
    return item.rolesPermitidos.length === 0 || this.auth.tieneRol(...item.rolesPermitidos);
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSesion() {
    this.auth.logout();
  }
}