import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  standalone: false
})
export class SwitchComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  get control(): FormControl<boolean> {
    return this.formGroup.get(this.controlName) as FormControl<boolean>;
  }

  get checked(): boolean {
    return !!this.control?.value;
  }
}