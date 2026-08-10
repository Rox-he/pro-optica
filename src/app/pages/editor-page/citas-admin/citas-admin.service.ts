import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface Cita {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  servicio: string;
  sucursal: string;
  mensaje?: string;
  atendida: boolean;
  creado_en: string;
}

@Injectable({ providedIn: 'root' })
export class CitasAdminService {
  private baseUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.token}` } };
  }

  listar(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.baseUrl, this.headers());
  }

  marcarAtendida(id: number, atendida: boolean): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}/atendida`, { atendida }, this.headers());
  }
}