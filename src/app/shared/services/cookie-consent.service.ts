import { Injectable } from '@angular/core';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'unset';

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  private readonly storageKey = 'cookie_consent';

  getConsent(): CookieConsentStatus {
    const value = localStorage.getItem(this.storageKey);

    if (value === 'accepted' || value === 'rejected') {
      return value;
    }

    return 'unset';
  }

  setConsent(status: 'accepted' | 'rejected'): void {
    localStorage.setItem(this.storageKey, status);
  }

  clearConsent(): void {
    localStorage.removeItem(this.storageKey);
  }

  hasAnswered(): boolean {
    return this.getConsent() !== 'unset';
  }

  accept(): void {
    this.setConsent('accepted');
    this.loadAnalytics();
  }

  reject(): void {
    this.setConsent('rejected');
  }

  init(): void {
    const consent = this.getConsent();

    if (consent === 'accepted') {
      this.loadAnalytics();
    }
  }

  openSettings(): void {
    localStorage.removeItem(this.storageKey);
    window.location.reload();
  }

  private loadAnalytics(): void {
    // Aynı script iki kere yüklenmesin
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
