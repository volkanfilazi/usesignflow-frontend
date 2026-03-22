import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly baseUrl = environment.apiBaseUrl;
  private initialized = false;
  private initPromise?: Promise<void>;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.waitForGoogle().then(() => {
      if (this.initialized) return;

      google.accounts.id.initialize({
        client_id: environment.google_client_id,
        ux_mode: 'redirect',
        login_uri: `${this.baseUrl}/auth/google/redirect`,
      });

      this.initialized = true;
    });

    return this.initPromise;
  }

  renderButton(element: HTMLElement) {
    if (!this.initialized) return;

    element.innerHTML = '';

    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      width: 320,
    });
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      const started = Date.now();

      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          resolve();
          return;
        }

        if (Date.now() - started > 10000) {
          clearInterval(interval);
          reject(new Error('Google SDK yüklenmedi'));
        }
      }, 100);
    });
  }
}
