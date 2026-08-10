import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsuarioSesion {
  id: number; nombre: string; email: string;
  rol: string; roles: string[]; permisos: string[];
}

const API = environment.apiUrl;
const TOKEN_KEY = 'oc_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuario = new BehaviorSubject<UsuarioSesion | null>(null);
  usuario$ = this._usuario.asObservable();

  constructor(private router: Router) {
    this.restaurarSesion();
  }

  get usuario(): UsuarioSesion | null { return this._usuario.value; }
  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  get estaAutenticado(): boolean { return !!this._usuario.value; }

  tieneRol(...roles: string[]): boolean {
    return roles.includes(this._usuario.value?.rol ?? '');
  }

  tienePermiso(permiso: string): boolean {
    return this._usuario.value?.permisos.includes(permiso) ?? false;
  }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const resp = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) return { ok: false, error: data.error };
      localStorage.setItem(TOKEN_KEY, data.token);
      this._usuario.next(data.usuario);
      return { ok: true };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor' };
    }
  }

  async registro(nombre: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const resp = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) return { ok: false, error: data.error };
      // No se guarda token ni se inicia sesión: el usuario debe loguearse manualmente.
      return { ok: true };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor' };
    }
  }

  async logout(): Promise<void> {
    if (this.token) {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    this._usuario.next(null);
    this.router.navigate(['/login']);
  }

  private async restaurarSesion(): Promise<void> {
    const token = this.token;
    if (!token) return;
    try {
      const resp = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) { localStorage.removeItem(TOKEN_KEY); return; }
      const usuario = await resp.json();
      this._usuario.next(usuario);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}
