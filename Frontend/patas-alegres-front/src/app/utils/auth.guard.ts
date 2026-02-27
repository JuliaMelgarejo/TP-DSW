import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service'; // ajustá el path

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isLogged()) {
    alert('Debe iniciar sesión para continuar');
    router.navigate(['/login']);
    return false; // 🔥 esto es lo que te faltaba
  }

  return true;
};


