import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "app-icon-button",
    templateUrl: "./icon-button.component.html",
    standalone: false
})
export class IconButtonComponent {
    @Input() iconName: string = "close";
    @Output() buttonClick  = new EventEmitter<void>();

    onClick() {
        this.buttonClick .emit();
    }
}