import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PageActionService } from '../../services/page-action.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
})
export class HeaderComponent {
  @Output() buttonActionEmitter = new EventEmitter();
  @Input() loading$ = new BehaviorSubject<boolean>(false);
  @Input() title?: string;
  @Input() buttonTitle?: string;

  constructor(protected pageActionService: PageActionService) {}

  onActionClick(id: string) {
    this.pageActionService.runAction(id);
  }
}
