import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  await auth.listo; // espera a que se restaure la sesión (evita perderla al recargar con F5)
  const roles: string[] = route.data['roles'] ?? [];
  if (!auth.estaAutenticado) { router.navigate(['/login']); return false; }
  if (roles.length === 0 || auth.tieneRol(...roles)) return true;
  router.navigate(['/acceso-denegado']); return false;
};
