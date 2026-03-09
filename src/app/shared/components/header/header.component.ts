import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
})
export class HeaderComponent {
  @Output() buttonActionEmitter = new EventEmitter();
  @Input() loading$ = new BehaviorSubject<boolean>(false);
  @Input() title?: string;

  buttonClicked() {
    this.buttonActionEmitter.emit();
  }
}
