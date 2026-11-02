import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './contacto-form.component.html',
  styleUrl: './contacto-form.component.css'
})
export class ContactoFormComponent {
  modelo = { nombre:'', telefono:'', correo:'', servicio:'', sucursal:'', fecha_cita:'', hora_cita:'', mensaje:'' };
  // La fecha mínima es hoy (en hora local, no UTC)
  hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  errorServidor = '';

  constructor(private auth: AuthService) {}
  enviado = false;
  enviando = false;
  formInvalido = false;
  error = false;

  async enviar(form: any) {
    if (form.invalid) {
      this.formInvalido = true;
      return;
    }
    this.formInvalido = false;
    this.enviando = true;
    this.error = false;
    this.errorServidor = '';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      // Si el cliente tiene sesión iniciada, la cita queda ligada a su cuenta
      if (this.auth.token) headers['Authorization'] = `Bearer ${this.auth.token}`;

      const resp = await fetch(`${environment.apiUrl}/citas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(this.modelo),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        this.errorServidor = data.error || '';
        throw new Error('Error al enviar');
      }

      this.enviado = true;
      form.resetForm();
    } catch (err) {
      console.error(err);
      this.error = true;
    } finally {
      this.enviando = false;
    }
  }
}