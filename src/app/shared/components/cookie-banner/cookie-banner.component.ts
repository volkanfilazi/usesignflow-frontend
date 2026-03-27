import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-banner.component.html',
})
export class CookieBannerComponent {
  visible = signal(false);

  constructor(private cookieConsent: CookieConsentService) {
    this.visible.set(!this.cookieConsent.hasAnswered());
  }

  accept(): void {
    this.cookieConsent.accept();
    this.visible.set(false);
  }

  reject(): void {
    this.cookieConsent.reject();
    this.visible.set(false);
  }
}
