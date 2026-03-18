import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  standalone: false
})
export class EmptyStateComponent {
  @Input() kicker = 'Nothing here yet';
  @Input() title = 'No items found';
  @Input() description = 'There is currently no data to display.';
  @Input() buttonText = '';
  @Input() imageSrc = '/landing/Documents-pana.svg';

  @Output() action = new EventEmitter<void>();
}
