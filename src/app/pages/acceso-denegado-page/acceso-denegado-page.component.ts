import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="denegado-page section-oc">
      <div class="container text-center">
        <div class="denegado-icon">🔒</div>
        <h1>Acceso denegado</h1>
        <p>No tienes los permisos necesarios para ver esta página.</p>
        <a routerLink="/perfil" class="btn-oc-cta">Ir a mi perfil</a>
      </div>
    </section>`,
  styles:[`.denegado-page{padding:100px 0;text-align:center}.denegado-icon{font-size:4rem;margin-bottom:1rem}h1{color:var(--oxford);margin-bottom:.5rem}p{color:var(--muted);margin-bottom:2rem}`]
})
export class AccesoDenegadoPageComponent {}
