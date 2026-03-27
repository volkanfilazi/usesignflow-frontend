import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayloadModel } from '../../shared/models/auth.model';
import { BillingApiService } from '../../shared/services/billing-api-service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private router = inject(Router);
  private billingApiService = inject(BillingApiService);

  setSession(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private getPayload(): JwtPayloadModel | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayloadModel>(token);
    } catch {
      return null;
    }
  }

  hasValidAccessToken(): boolean {
    const payload = this.getPayload();
    if (!payload?.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  }

  hasSession(): boolean {
    return !!this.getRefreshToken();
  }

  getIsVerified() {
    return this.getPayload()?.emailVerified === 'True' ? true : false;
  }

  getFullName(): string | null {
    const payload = this.getPayload();

    return payload?.name ?? null;
  }

  getEmail(): string | null {
    const payload = this.getPayload();
    return payload?.email ?? null;
  }

  getIsTwoFactorEnabled(): boolean {
    const payload = this.getPayload();

    return payload?.twoFactorEnabled?.toLowerCase() === 'true';
  }

  getUserId(): string | null {
    const payload = this.getPayload();
    return payload?.sub ?? null;
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  logout(): void {
    this.clearSession();
    this.billingApiService.clearOverviewCache();
    this.router.navigate(['/login']);
  }
}
