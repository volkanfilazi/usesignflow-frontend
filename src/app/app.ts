import { Component, HostListener, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  isDesktop = window.innerWidth > 768;
  isMobile = false;

  protected readonly title = signal('my-app');

  constructor(private readonly router: Router) {}

  @HostListener('window:resize')
  onResize() {
    this.updateLayout();
  }

  get hideLeftNav() {
    return (
      this.router.url === '/' || this.router.url === '/login' || this.router.url === '/register'
    );
  }

  updateLayout() {
    this.isDesktop = window.innerWidth > 768;

    if (this.isDesktop) {
      this.isMobile = false;
    }
  }
}
