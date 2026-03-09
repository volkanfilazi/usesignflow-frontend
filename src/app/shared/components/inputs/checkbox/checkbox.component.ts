import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "app-checkbox",
  standalone: false,
  templateUrl: "./checkbox.component.html"
})
export class CheckboxComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName: string | undefined;
  @Input() checkboxName: string | undefined;
}