import { Component } from '@angular/core';
import { HeroComponent } from '../../main/hero/hero.component';
import { ServiciosResumenComponent } from '../../main/servicios/servicios-resumen/servicios-resumen.component';
import { ProductosResumenComponent } from '../../main/productos/productos-resumen/productos-resumen.component';
import { DatosCuriososComponent } from '../../main/datos-curiosos/datos-curiosos.component';
import { NosotrosResumenComponent } from '../../main/nosotros/nosotros-resumen/nosotros-resumen.component';
import { ContactoResumenComponent } from '../../main/contacto/contacto-resumen/contacto-resumen.component';
import { MarcasComponent } from '../marcas/marcas';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent, ServiciosResumenComponent, ProductosResumenComponent,
    DatosCuriososComponent, NosotrosResumenComponent, ContactoResumenComponent,
    MarcasComponent, ScrollRevealDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}