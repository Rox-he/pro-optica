import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface Producto {
  id?: number;
  nombre: string;
  marca: string;
  categoria: string;
  descripcion?: string;
  precio: number;
  color?: string;
  material?: string;
  genero?: string;
  imagen?: string;
  stock?: number;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductosAdminService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.token}` } };
  }

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto, this.headers());
  }

  editar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto, this.headers());
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`, this.headers());
  }
}