import { Injectable, computed, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  mode = signal<ThemeMode>(this.getSavedMode());
  private media = window.matchMedia('(prefers-color-scheme: dark)');

  theme = computed<'light' | 'dark'>(() => {
    const mode = this.mode();
    if (mode === 'system') {
      return this.media.matches ? 'dark' : 'light';
    }

    return mode;
  });

  constructor() {
    this.applyTheme();

    this.media.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.applyTheme();
      }
    });
  }

  setMode(mode: ThemeMode) {
    this.mode.set(mode);
    localStorage.setItem('theme-mode', mode);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.theme();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }

  private getSavedMode(): ThemeMode {
    const saved = localStorage.getItem('theme-mode');

    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  }
}
