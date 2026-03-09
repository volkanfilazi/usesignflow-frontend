import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-chips-input',
  templateUrl: './chips-input.component.html',
  standalone: false,
})
export class ChipsInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName?: string;

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly announcer = inject(LiveAnnouncer);

  private get optionsCtrl(): FormControl<string[]> | null {
    if (!this.formGroup || !this.controlName) return null;

    const ctrl = this.formGroup.get(this.controlName);
    return ctrl as FormControl<string[]>;
  }

  chipsHolder(): string[] {
    return this.optionsCtrl?.value ?? [];
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (!value) {
      event.chipInput?.clear();
      return;
    }

    const ctrl = this.optionsCtrl;
    if (!ctrl) {
      event.chipInput?.clear();
      return;
    }

    const current = (ctrl.value ?? []) as string[];

    // duplicate engelle (istersen kaldır)
    if (current.some(x => x.toLowerCase() === value.toLowerCase())) {
      event.chipInput?.clear();
      return;
    }

    ctrl.setValue([...current, value]);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity({ emitEvent: true });

    event.chipInput?.clear();
    this.announcer.announce(`Added ${value}`);
  }

  remove(option: string): void {
    const ctrl = this.optionsCtrl;
    if (!ctrl) return;

    const current = (ctrl.value ?? []) as string[];
    const next = current.filter(x => x !== option);

    ctrl.setValue(next);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity({ emitEvent: true });

    this.announcer.announce(`Removed ${option}`);
  }

  edit(oldValue: string, event: MatChipEditedEvent): void {
    const newValue = (event.value || '').trim();

    if (!newValue) {
      this.remove(oldValue);
      return;
    }

    const ctrl = this.optionsCtrl;
    if (!ctrl) return;

    const current = (ctrl.value ?? []) as string[];

    // duplicate engelle (oldValue hariç)
    if (
      current.some(
        x => x !== oldValue && x.toLowerCase() === newValue.toLowerCase()
      )
    ) {
      return;
    }

    const next = current.map(x => (x === oldValue ? newValue : x));

    ctrl.setValue(next);
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity({ emitEvent: true });

    this.announcer.announce(`Edited ${oldValue} to ${newValue}`);
  }
}