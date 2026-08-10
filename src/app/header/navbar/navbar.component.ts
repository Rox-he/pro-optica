import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BuscadorComponent } from '../buscador/buscador.component';
interface DropdownItem { label: string; link: string; fragment?: string; }
interface DropdownItem { label: string; link: string; fragment?: string; }
interface NavItem {
  label: string;
  link?: string;
  dropdown?: DropdownItem[];
}
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, BuscadorComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;
  openDropdown: string | null = null;

  navItems: NavItem[] = [
    { label: 'Inicio', link: '/' },
    {
      label: 'Servicios',
      dropdown: [
        { label: 'Examen visual', link: '/servicios/examen-visual' },
        { label: 'Mantenimiento', link: '/servicios/mantenimiento' },
        { label: 'Venta de lentes', link: '/servicios/venta-de-lentes' },
        { label: 'Atención especializada', link: '/servicios/atencion-especializada' },
      ]
    },
   {
  label: 'Productos',
  dropdown: [
    { label: 'Armazones', link: '/productos', fragment: 'armazones' },
    { label: 'Lentes de contacto', link: '/productos', fragment: 'lentes-de-contacto' },
    { label: 'Accesorios', link: '/productos', fragment: 'accesorios' },
  ]
},
   {
  label: 'Nosotros',
  dropdown: [
    { label: 'Quiénes somos', link: '/nosotros', fragment: 'quienes-somos' },
    { label: 'Sucursales', link: '/nosotros/sucursales' },
    { label: 'Testimonios', link: '/nosotros', fragment: 'testimonios' },
  ]
},
    { label: 'Contacto', link: '/contacto' },
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // ---- Evento basado en puntero (mouseenter/mouseleave) ----
  private cerrarTimeout: ReturnType<typeof setTimeout> | null = null;

  abrirConHover(label: string) {
    if (this.cerrarTimeout) { clearTimeout(this.cerrarTimeout); this.cerrarTimeout = null; }
    this.openDropdown = label;
  }

  cerrarConHover() {
    this.cerrarTimeout = setTimeout(() => { this.openDropdown = null; }, 150);
  }

  toggleDropdown(label: string) {
    this.openDropdown = this.openDropdown === label ? null : label;
  }

  closeAll() {
    this.menuOpen = false;
    this.openDropdown = null;
  }
}