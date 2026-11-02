import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface Promocion {
  id: number;
  nombre: string;
  titulo: string;
  descuento: string;
  detalle: string;
  descripcion: string;
  icono: string;
  color_fondo: string;
  color_acento: string;
  mes_inicio: number;
  dia_inicio: number;
  mes_fin: number;
  dia_fin: number;
  activa: boolean;
}

export type PromocionForm = Omit<Promocion, 'id' | 'activa'>;

@Injectable({ providedIn: 'root' })
export class PromocionesAdminService {
  private baseUrl = `${environment.apiUrl}/promociones`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.token}` } };
  }

  listar(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.baseUrl, this.headers());
  }
  crear(p: PromocionForm): Observable<Promocion> {
    return this.http.post<Promocion>(this.baseUrl, p, this.headers());
  }
  editar(id: number, p: PromocionForm): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.baseUrl}/${id}`, p, this.headers());
  }
  activar(id: number, activa: boolean): Observable<{ mensaje: string; activa: boolean }> {
    return this.http.put<{ mensaje: string; activa: boolean }>(`${this.baseUrl}/${id}/activa`, { activa }, this.headers());
  }
  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`, this.headers());
  }
}
