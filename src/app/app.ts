import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { CookieBannerComponent } from "./shared/components/cookie-banner/cookie-banner.component";
import { CookieConsentService } from './shared/services/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet, CookieBannerComponent],
})
export class App implements OnInit {
  constructor(private cookieConsent: CookieConsentService) {}

  ngOnInit(): void {
    this.cookieConsent.init();
  }
}
