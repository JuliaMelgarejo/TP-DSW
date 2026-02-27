import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type AppRole = 'USER' | 'ADMIN' | 'SHELTER';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  // --- Token ---
  get token(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  // --- Role ---
  get role(): AppRole {
    return (localStorage.getItem('role') as AppRole) || 'USER';
  }

  setRole(role: AppRole) {
    localStorage.setItem('role', role);
  }

  clearRole() {
    localStorage.removeItem('role');
  }

  // --- Helpers ---
  isLogged(): boolean {
    return !!this.token;
  }

  isUser(): boolean { return this.role === 'USER'; }
  isAdmin(): boolean { return this.role === 'ADMIN'; }
  isShelter(): boolean { return this.role === 'SHELTER'; }

  // --- Logout ---
  logout() {
    this.clearToken();
    this.clearRole();
    this.router.navigate(['/login']);
  }
}