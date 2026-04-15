import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
  standalone: false,
})
export class TextAreaComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName: string | undefined;
  @Input() isRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() badgeName: string = '';
  @Input() assignee: 'you' | 'client' = 'you';
  @Input() placeholder: string = '';
  @Input() min: number = 5;
  @Input() max: number = 120;

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
