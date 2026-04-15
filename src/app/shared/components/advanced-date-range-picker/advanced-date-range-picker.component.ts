import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateRangeValue } from '../../models/date-range-filter.model';
import { toIsoDate } from '../../utility/helper/date-helper';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-date-range-dropdown',
  templateUrl: './advanced-date-range-picker.component.html',
  styleUrls: ['./advanced-date-range-picker.component.scss'],
  standalone: false,
})
export class AdvancedDateRangePickerComponent {
  @Input() label = 'Date range';
  @Input() initialValue: DateRangeValue | null = null;

  @Output() apply = new EventEmitter<DateRangeValue>();

  isOpen = false;

  presets = [
    { key: 'today', label: 'Today' },
    { key: 'last7', label: 'Last 7 days' },
    { key: 'last14', label: 'Last 14 days' },
    { key: 'last30', label: 'Last 30 days' },
    { key: 'monthToDate', label: 'Month to date' },
    { key: 'yearToDate', label: 'Year to date' },
    { key: 'custom', label: 'Custom range' },
  ];

  selectedPreset = 'last30';

  form = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private readonly toolsService: ToolsService) {
    this.applyPreset('last30');
  }

  onDateChange(): void {
    this.selectedPreset = 'custom';
  }

  applySelection(): void {
    if (
      this.form &&
      this.form.value.start &&
      this.form.value.end &&
      this.form.value.start > this.form.value.end
    ) {
      this.toolsService.showSnackbar('Start date cannot be greater than end date.', 'info-message');

      return;
    }

    this.apply.emit(this.buildValue());
  }

  private applyPreset(key: string): void {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date(now);

    switch (key) {
      case 'today':
        start = new Date(now);
        break;
      case 'last7':
        start = this.addDays(now, -6);
        break;
      case 'last14':
        start = this.addDays(now, -13);
        break;
      case 'last30':
        start = this.addDays(now, -29);
        break;
      case 'monthToDate':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearToDate':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        return;
      default:
        start = this.addDays(now, -29);
        break;
    }

    this.form.patchValue(
      {
        start,
        end,
      },
      { emitEvent: false },
    );
  }

  private buildValue(): DateRangeValue {
    return {
      preset: this.selectedPreset,
      start: this.form.value.start ? toIsoDate(this.form.value.start) : null,
      end: this.form.value.end ? toIsoDate(this.form.value.end) : null,
    };
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  get displayText(): string {
    const value = this.buildValue();

    if (!value.start && !value.end) {
      return this.label;
    }

    return `${value.start ?? 'Any'} — ${value.end ?? 'Any'}`;
  }
}
