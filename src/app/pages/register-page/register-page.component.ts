import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  nombre = '';  email = '';  password = '';  confirmar = '';
  error = '';   cargando = false;
  registrado = false; // true = mostrar pantalla de confirmación en vez del formulario

  constructor(private auth: AuthService, private router: Router) {}

  async enviar() {
    this.error = '';
    if (this.password !== this.confirmar) { this.error = 'Las contraseñas no coinciden'; return; }

    this.cargando = true;
    const result = await this.auth.registro(this.nombre, this.email, this.password);
    this.cargando = false;

    if (!result.ok) { this.error = result.error ?? 'Error al registrarse'; return; }

    this.registrado = true;
    // Redirige automáticamente a login después de mostrar la confirmación.
    setTimeout(() => this.router.navigate(['/login']), 10000);
  }
}
