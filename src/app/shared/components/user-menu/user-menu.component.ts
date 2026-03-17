import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { AuthStateService } from '../../../core/services/auth-state.service';

export interface UserMenuItem {
  label: string;
  icon?: string;
  route?: string;
  action?: 'logout' | 'custom';
  danger?: boolean;
}

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatIcon],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent {
  @Input() items: UserMenuItem[] = [
    { label: 'Profile', route: '/dashboard/profile', icon: 'person' },
    { label: 'Settings', route: '/dashboard/settings', icon: 'settings' },
    { label: 'Logout', action: 'logout', icon: 'logout', danger: true },
  ];

  @Output() itemSelected = new EventEmitter<UserMenuItem>();

  isOpen = false;
  userName = 'User';

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private readonly authStateService: AuthStateService,
  ) {
    this.userName = this.authStateService.getFullName() ?? 'User';
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  onItemClick(item: UserMenuItem): void {
    this.itemSelected.emit(item);

    if (item.action === 'logout') {
      this.authStateService.logout();
    }

    this.closeMenu();
  }

  getInitials(name: string): string {
    if (!name?.trim()) return 'U';

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}
