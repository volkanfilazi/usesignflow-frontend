import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

type NormalizedOption = { label: string; value: string };

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.scss'],
  standalone: false,
})
export class ComboboxComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName: string | undefined;
  @Input() label: string | undefined;
  @Input() badgeName: string | undefined;
  @Input() assignee: 'you' | 'client' = 'you';
  @Input() isRequired: boolean = false;
  @Input() options: string[] | { label: string; value: string }[] = [];
  @Output() typeChanged = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.controlName || !this.formGroup) return;

    const control = this.formGroup.get(this.controlName);
    if (!control) return;

    const validators: ValidatorFn[] = [this.optionMatchValidator()];
    if (this.isRequired) {
      validators.unshift((c) => (!c.value ? { required: true } : null));
    }

    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }

  get normalizedOptions(): { label: string; value: string }[] {
    return (this.options ?? []).map((option) =>
      typeof option === 'string' ? { label: option, value: option } : option,
    );
  }

  displayOptionLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.normalizedOptions.find((option) => option.value === value);
    return match?.label ?? value;
  };

  private optionMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const isValid = this.normalizedOptions.some((option) => option.value === value);
      return isValid ? null : { invalidOption: true };
    };
  }
}
