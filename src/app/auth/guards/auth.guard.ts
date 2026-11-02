import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  await auth.listo; // espera a que se restaure la sesión (evita perderla al recargar con F5)
  if (auth.estaAutenticado) return true;
  router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
  return false;
};
