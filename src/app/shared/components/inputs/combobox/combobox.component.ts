import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  @Input() isRequired: boolean = false;
  @Input() options: string[] = [];
  @Output() typeChanged = new EventEmitter<string>();

  private destroy$ = new Subscription();

  ngOnChanges() {
    if (this.controlName) {
      const control = this.formGroup.get(this.controlName);
      if (control) {
        this.destroy$.add(control.valueChanges.subscribe((value) => {
          this.typeChanged.emit(value);
        }));
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }
}
