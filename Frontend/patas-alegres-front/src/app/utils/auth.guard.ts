import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AppRole } from '../services/auth/auth.service';
import { ToastNotificationService } from '../services/toast-notification/toast-notification.service';

export const authGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastNotificationService);

  // 1) logueado
  if (!auth.isLogged()) {
    toast.show('Debe iniciar sesion para continuar', 'info')
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
    toast.show('No tiene permisos para acceder a esta sección', 'info')
    router.navigate(['/']); // o /animal o donde quieras
    return false;
  }

  return true;
};
