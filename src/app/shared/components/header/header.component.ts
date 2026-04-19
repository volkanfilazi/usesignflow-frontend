import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PageActionService } from '../../services/header/page-action.service';
import { HeaderSearchService } from '../../services/header/header-search.service';
import { DateRangeValue } from '../../models/date-range-filter.model';
import { DateRangeService } from '../../services/header/date-range.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent {
  @Input() loading$ = new BehaviorSubject<boolean>(false);
  @Input() title?: string;
  @Input() buttonTitle?: string;

  constructor(
    protected pageActionService: PageActionService,
    protected headerSearchService: HeaderSearchService,
    protected dateRangeService: DateRangeService
  ) {}

  onActionClick(id: string) {
    this.pageActionService.runAction(id);
  }

  onSearchChanged(value: string) {
    this.headerSearchService.updateValue(value);
  }

  onDateRangeApply(value: DateRangeValue): void {
    this.dateRangeService.updateValue(value);
  }
}
