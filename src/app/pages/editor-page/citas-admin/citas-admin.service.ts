import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export type EstatusCita = 'pendiente' | 'confirmada' | 'rechazada';

export interface Cita {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  servicio: string;
  sucursal: string;
  mensaje?: string;
  fecha_cita: string | null;   // "YYYY-MM-DD" (null en citas anteriores a la migración)
  hora_cita: string | null;    // "HH:MM:SS"
  estatus: EstatusCita;
  gestionado_por?: string | null;
  creado_en: string;
}

// Lo que ve el cliente en "Mis citas"
export interface MiCita {
  id: number;
  servicio: string;
  sucursal: string;
  fecha_cita: string | null;
  hora_cita: string | null;
  estatus: EstatusCita;
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

  cambiarEstatus(id: number, estatus: EstatusCita): Observable<{ mensaje: string; id: number; estatus: EstatusCita }> {
    return this.http.put<{ mensaje: string; id: number; estatus: EstatusCita }>(
      `${this.baseUrl}/${id}/estatus`, { estatus }, this.headers()
    );
  }

  misCitas(): Observable<MiCita[]> {
    return this.http.get<MiCita[]>(`${this.baseUrl}/mias`, this.headers());
  }
}
