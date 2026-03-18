import { Injectable, signal } from '@angular/core';

export interface PageAction {
  id: string;
  text: string;
  handler: () => void;
  owner?: string;
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

  clearActionsByOwner(owner: string) {
    this.actions.update((prev) => prev.filter((x) => x.owner !== owner));
  }

  runAction(id: string) {
    const action = this.actions().find((x) => x.id === id);
    action?.handler();
  }
}
