import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  standalone: false,
})
export class DatePickerComponent {
  @Input() formGroup: FormGroup | undefined;
  @Input() controlName = '';
  @Input() label = 'Select date';
  @Input() placeholder = 'Choose a date';
  @Input() isRequired = false;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
}
