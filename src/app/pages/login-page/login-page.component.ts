import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  email = '';  password = '';  error = '';  cargando = false;
  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  async enviar() {
    this.error = '';  this.cargando = true;
    const result = await this.auth.login(this.email, this.password);
    this.cargando = false;
    if (!result.ok) { this.error = result.error ?? 'Error al iniciar sesión'; return; }
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/perfil';
    this.router.navigateByUrl(returnUrl);
  }
}
