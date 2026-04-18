import { Component, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ThemeService } from '../../services/theme.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export interface UserMenuItem {
  label: string;
  icon?: string;
  route?: string;
  action?: 'logout' | 'mode' | 'custom';
  danger?: boolean;
}

@Component({
  selector: 'app-user-menu',
  standalone: false,
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

  private readonly destroy$ = new Subject<void>();

  formGroup: FormGroup | undefined;
  isOpen = false;
  userName = 'User';

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private readonly authStateService: AuthStateService,
    private readonly themeService: ThemeService,
  ) {
    this.userName = this.authStateService.getFullName() ?? 'User';
    this.themeService.mode();
    this.formGroup = new FormGroup({
      mode: new FormControl(this.themeService.mode() === 'light' ? false : true),
    });

    this.formGroup
      .get('mode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((item) => {
        if (item) {
          this.themeService.setMode('dark');
        } else {
          this.themeService.setMode('light');
        }
      });
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
