import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  standalone: false,
})
export class TextInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName: string | undefined;
  @Input() isRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() badgeName: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'Email' | 'Number' | 'Text' | 'Password' = 'Text';

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
