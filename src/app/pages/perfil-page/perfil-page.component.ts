import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, UsuarioSesion } from '../../auth/services/auth.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class PerfilPageComponent {
  constructor(public auth: AuthService) {}
  get usuario(): UsuarioSesion | null { return this.auth.usuario; }
  cerrarSesion() { this.auth.logout(); }
}