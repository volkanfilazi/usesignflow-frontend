import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'unset';

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  private readonly storageKey = 'cookie_consent';

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getConsent(): CookieConsentStatus {
    if (!this.isBrowser) {
      return 'unset';
    }

    const value = localStorage.getItem(this.storageKey);

    if (value === 'accepted' || value === 'rejected') {
      return value;
    }

    return 'unset';
  }

  setConsent(status: 'accepted' | 'rejected'): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, status);
  }

  clearConsent(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }

  hasAnswered(): boolean {
    return this.getConsent() !== 'unset';
  }

  accept(): void {
    if (!this.isBrowser) {
      return;
    }

    this.setConsent('accepted');
    this.loadAnalytics();
  }

  reject(): void {
    if (!this.isBrowser) {
      return;
    }

    this.setConsent('rejected');
  }

  init(): void {
    if (!this.isBrowser) {
      return;
    }

    const consent = this.getConsent();

    if (consent === 'accepted') {
      this.loadAnalytics();
    }
  }

  openSettings(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.storageKey);
    window.location.reload();
  }

  private loadAnalytics(): void {
    if (!this.isBrowser) {
      return;
    }

    if (document.getElementById('ga-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];

    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }

    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX');
  }
}