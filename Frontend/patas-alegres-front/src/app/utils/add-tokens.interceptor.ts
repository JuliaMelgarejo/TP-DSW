import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const addTokensInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  if(token){
    req = req.clone({setHeaders: {Authorization: `Bearer ${token}`}})
  }
  return next(req);
};
