import { Component } from '@angular/core';
import { PrimaryButtonComponent } from "../buttons/primary/primary-button.component";

@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  imports: [PrimaryButtonComponent],
})
export class LandingFooterComponent {
  openCookieSettings() {
    localStorage.removeItem('cookie_consent');
    window.location.reload();
  }
}
