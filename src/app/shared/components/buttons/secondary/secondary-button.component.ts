import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrl: './secondary-button.component.scss',
  imports: [SharedModule],
})
export class PrimaryButtonComponent {
  @Input() buttonName: string = 'Button';
  @Input() textUntilEventOver: string = 'Loading...';
  @Input() disabled = false;
  @Input() color: 'warn' | 'primary' | 'secondary' | undefined = undefined;
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
