import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../auth/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private router = inject(Router);

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const payload = this.getPayload();
    if (!payload?.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  }

  getFullName(): string | null {
    const payload = this.getPayload();
    return payload?.fullName ?? null;
  }

  getEmail(): string | null {
    const payload = this.getPayload();
    return payload?.email ?? null;
  }

  getUserId(): string | null {
    const payload = this.getPayload();
    return payload?.nameid ?? null;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
