import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export type EstatusPedido = 'en_proceso' | 'listo' | 'entregado';

export interface Pedido {
  id: number;
  usuario_id: number | null;        // null = el correo no tiene cuenta (no recibirá avisos en el reloj)
  cliente_nombre: string;
  cliente_correo: string;
  cliente_telefono?: string | null;
  producto_id?: number | null;
  armazon: string;
  notas?: string | null;
  estatus: EstatusPedido;
  gestionado_por?: string | null;
  listo_en?: string | null;
  creado_en: string;
}

export interface NuevoPedido {
  cliente_nombre: string;
  cliente_correo: string;
  cliente_telefono?: string;
  producto_id?: number | null;
  armazon?: string;
  notas?: string;
}

// Solo lo que se necesita del catálogo para elegir el armazón
export interface ProductoMini {
  id: number;
  nombre: string;
  marca: string;
}

@Injectable({ providedIn: 'root' })
export class PedidosAdminService {
  private baseUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return { headers: { Authorization: `Bearer ${this.auth.token}` } };
  }

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl, this.headers());
  }

  crear(pedido: NuevoPedido): Observable<{ mensaje: string; id: number; estatus: EstatusPedido; cuenta_vinculada: boolean }> {
    return this.http.post<{ mensaje: string; id: number; estatus: EstatusPedido; cuenta_vinculada: boolean }>(
      this.baseUrl, pedido, this.headers()
    );
  }

  cambiarEstatus(id: number, estatus: EstatusPedido): Observable<{ mensaje: string; id: number; estatus: EstatusPedido; aviso_enviado: boolean }> {
    return this.http.put<{ mensaje: string; id: number; estatus: EstatusPedido; aviso_enviado: boolean }>(
      `${this.baseUrl}/${id}/estatus`, { estatus }, this.headers()
    );
  }

  buscarCliente(correo: string): Observable<{ existe: boolean; nombre?: string }> {
    return this.http.get<{ existe: boolean; nombre?: string }>(
      `${this.baseUrl}/buscar-cliente`, { ...this.headers(), params: { correo } }
    );
  }

  productos(): Observable<ProductoMini[]> {
    return this.http.get<ProductoMini[]>(`${environment.apiUrl}/productos`);
  }
}
