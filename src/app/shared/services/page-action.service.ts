import { Injectable, signal } from '@angular/core';

export interface PageAction {
  id: string;
  text: string;
  handler: () => void;
}

@Injectable({ providedIn: 'root' })
export class PageActionService {
  actions = signal<PageAction[]>([]);

  addAction(action: PageAction) {
    this.actions.update((prev) => [...prev, action]);
  }

  clearActions() {
    this.actions.set([]);
  }

  runAction(id: string) {
    const action = this.actions().find((x) => x.id === id);
    action?.handler();
  }
}
