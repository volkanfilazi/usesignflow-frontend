import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  standalone: false,
})
export class IconButtonComponent {
  @Input() iconName: string = 'close';
  @Input() class: 'success-button' | 'delete-button' = 'success-button';
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
