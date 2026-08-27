import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayloadModel } from '../../shared/models/auth.model';
import { BillingApiService } from '../../shared/services/billing-api-service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private router = inject(Router);
  private billingApiService = inject(BillingApiService);
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setSession(token: string, refreshToken: string): void {
    if (!this.isBrowser) return;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;

    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;

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

  getIsVerified(): boolean {
    return this.getPayload()?.emailVerified === 'True';
  }

  getFullName(): string | null {
    return this.getPayload()?.name ?? null;
  }

  getEmail(): string | null {
    return this.getPayload()?.email ?? null;
  }

  getIsTwoFactorEnabled(): boolean {
    return this.getPayload()?.twoFactorEnabled?.toLowerCase() === 'true';
  }

  getUserId(): string | null {
    return this.getPayload()?.sub ?? null;
  }

  clearSession(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  logout(): void {
    this.clearSession();
    this.billingApiService.clearOverviewCache();
    this.router.navigate(['/login']);
  }
}