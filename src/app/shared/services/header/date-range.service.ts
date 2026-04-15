import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { DateRangeValue } from '../../models/date-range-filter.model';

export interface DateRangeState {
  value: DateRangeValue;
  visible: boolean;
  owner?: string;
}

@Injectable({ providedIn: 'root' })
export class DateRangeService {
  state = signal<DateRangeState>({
    visible: false,
    value: { end: null, start: null, preset: null },
  });

  private dateRangeChangedSubject = new Subject<DateRangeValue>();
  dateRangeChanged$ = this.dateRangeChangedSubject.asObservable();

  show(config?: Partial<DateRangeState>) {
    this.state.update((prev) => ({
      ...prev,
      visible: true,
      ...config,
    }));
  }

  hide() {
    this.state.set({
      visible: false,
      value: { end: null, start: null, preset: null },
    });
  }

  updateValue(value: DateRangeValue) {
    this.state.update((prev) => ({
      ...prev,
      value,
    }));

    this.dateRangeChangedSubject.next(value);
  }

  clearByOwner(owner: string) {
    const current = this.state();
    if (current.owner === owner) {
      this.hide();
    }
  }

  clearValue() {
    this.updateValue({ end: null, start: null, preset: null });
  }
}
