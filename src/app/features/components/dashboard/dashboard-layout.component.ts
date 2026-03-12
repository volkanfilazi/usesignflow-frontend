import { Component, HostListener, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-dashboard-laylout',
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    SharedModule,
  ],
})
export class DashboardLayoutComponent {
  isDesktop = window.innerWidth > 768;
  isMobile = false;

  protected readonly title = signal('my-app');

  constructor(
    private readonly router: Router,
    private readonly authStateService: AuthStateService,
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.updateLayout();
  }

  get hideLeftNav() {
    return (
      this.router.url === '/' ||
      this.router.url.startsWith('/login') ||
      this.router.url.startsWith('/verification-process') ||
      this.router.url === '/register' ||
      this.router.url.startsWith('/verify-email')
    );
  }

  updateLayout() {
    this.isDesktop = window.innerWidth > 768;

    if (this.isDesktop) {
      this.isMobile = false;
    }
  }

  logout() {
    this.authStateService.logout();
  }
}
