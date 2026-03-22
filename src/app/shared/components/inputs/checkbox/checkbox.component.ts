import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "app-checkbox",
  standalone: false,
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.scss"
})
export class CheckboxComponent {
  @Input() formGroup!: FormGroup;
  @Input() isRequired: boolean = false;
  @Input() label: string | undefined;
  @Input() badgeName: string | undefined;
  @Input() controlName: string | undefined;
  @Input() checkboxName: string | undefined;
}