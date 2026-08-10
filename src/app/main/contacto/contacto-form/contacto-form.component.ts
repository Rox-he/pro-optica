import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './contacto-form.component.html',
  styleUrl: './contacto-form.component.css'
})
export class ContactoFormComponent {
  modelo = { nombre:'', telefono:'', correo:'', servicio:'', sucursal:'', mensaje:'' };
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

    try {
      const resp = await fetch(`${environment.apiUrl}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.modelo),
      });
      if (!resp.ok) throw new Error('Error al enviar');
      await resp.json();

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