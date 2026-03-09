import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
    selector: "app-text-input",
    templateUrl: "./text-input.component.html",
    styleUrls: ["./text-input.component.scss"],
    standalone: false
})
export class TextInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() controlName: string | undefined;
  @Input() isRequired: boolean = false;
  @Input() label: string = "";
  @Input() type: 'email' | 'number' | 'text' = "text";
}