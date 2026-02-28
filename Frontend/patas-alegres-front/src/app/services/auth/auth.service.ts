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

  getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try{
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  getShelterIdToken(): number | null {
    const decoded = this.getDecodedToken();
    const id = decoded?.shelterId;
    return id ;
  }

  getUserIdToken(): number | null {
    const decoded = this.getDecodedToken();
    const id = decoded?.personId;
    return id ;
  }


  getRole(): AppRole | null {
    const decoded = this.getDecodedToken();
    return decoded?.role ?? null;
  }

  // --- Helpers ---
  isLogged(): boolean {
    return !!this.token;
  }

  isUser(): boolean { return this.getRole() === 'USER'; }
  isShelter(): boolean { return this.getRole() === 'SHELTER'; }

  // --- Logout ---
  logout() {
    this.clearToken();
    this.router.navigate(['/login']);
  }
}