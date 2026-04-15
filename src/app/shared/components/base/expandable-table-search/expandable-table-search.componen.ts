import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-expandable-table-search',
  templateUrl: './expandable-table-search.component.html',
  styleUrl: './expandable-table-search.component.scss',
  standalone: false,
})
export class ExpandableTableSearchComponent implements AfterViewInit {
  @Input() placeholder = 'Search...';
  @Input() initialValue = '';
  @Input() debounceMs = 400;

  @Output() searchChanged = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('', { nonNullable: true });

  ngAfterViewInit(): void {
    this.searchControl.setValue(this.initialValue, { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchChanged.emit(value.trim());
      });
  }

  clearOnly(): void {
    this.searchControl.setValue('');
    this.searchInput?.nativeElement.focus();
  }
}