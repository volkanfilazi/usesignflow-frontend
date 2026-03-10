import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageActionService {
  buttonName = '';
  actionLabel = signal<string | null>(null);
  actionHandler: (() => void) | null = null;

  setAction(label: string, name: string, handler: () => void) {
    this.buttonName = name;
    this.actionLabel.set(label);
    this.actionHandler = handler;
  }

  clearAction() {
    this.actionLabel.set(null);
    this.actionHandler = null;
  }

  runAction() {
    this.actionHandler?.();
  }
}
