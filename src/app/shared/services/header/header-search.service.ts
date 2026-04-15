import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface HeaderSearchState {
  visible: boolean;
  placeholder: string;
  value: string;
  owner?: string;
}

@Injectable({ providedIn: 'root' })
export class HeaderSearchService {
  state = signal<HeaderSearchState>({
    visible: false,
    placeholder: 'Search...',
    value: '',
  });

  private searchChangedSubject = new Subject<string>();
  searchChanged$ = this.searchChangedSubject.asObservable();

  show(config?: Partial<HeaderSearchState>) {
    this.state.update((prev) => ({
      ...prev,
      visible: true,
      ...config,
    }));
  }

  hide() {
    this.state.set({
      visible: false,
      placeholder: 'Search...',
      value: '',
    });
  }

  clearByOwner(owner: string) {
    const current = this.state();
    if (current.owner === owner) {
      this.hide();
    }
  }

  updateValue(value: string) {
    this.state.update((prev) => ({
      ...prev,
      value,
    }));

    this.searchChangedSubject.next(value);
  }

  clearValue() {
    this.updateValue('');
  }
}
