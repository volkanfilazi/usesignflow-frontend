import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatAnchor } from "@angular/material/button";

@Component({
    selector: "app-primary-button",
    templateUrl: "./primary-button.component.html",
    styleUrl: "./primary-button.component.scss",
    imports: [MatAnchor]
})
export class PrimaryButtonComponent {
    @Input() buttonName: string = "Button";
    @Input() disabled = false;
    @Input() color: 'warn' | 'primary' | 'secondary' | undefined = undefined;
    @Output() buttonClick  = new EventEmitter<void>();

    onClick() {
        this.buttonClick .emit();
    }
}