import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AppRole } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // 1) logueado
  if (!auth.isLogged()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: _state.url }
    });
    return false;
  }

  // 2) roles (si la ruta los define)
  const allowedRoles = route.data?.['roles'] as AppRole[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // no requiere rol específico
  }

  const role = auth.getRole();
  if (!role) {
    auth.logout(); // token raro
    return false;
  }

  if (!allowedRoles.includes(role)) {
    alert('No tiene permisos para acceder a esta sección');
    router.navigate(['/']); // o /animal o donde quieras
    return false;
  }

  return true;
};
