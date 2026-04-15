import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

export interface TableCellBadge {
  type: 'badge';
  text: string;
  className: string;
}

export interface TableEmptyStateMessage {
  kicker: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  navigationUrl?: string;
}

export interface TableAction<T = any> {
  id: string;
  label: string | ((row: T) => string);
  tooltip?: string | ((row: T) => string);
  icon?: string | ((row: T) => string);
  iconColor?: string | ((row: T) => string);
  handler: (row: T) => void;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  formatter?: (row: T) => string | number | TableCellBadge | null;
}

export interface TableActionColumn<T = any> {
  key: 'actions';
  label: string;
  actions: TableAction<T>[];
}

export type TableColumnDefinition<T = any> = TableColumn<T> | TableActionColumn<T>;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: false,
})
export class TableComponent<T> {
  @Input() columns: TableColumnDefinition<T>[] = [];
  @Input() tableEmptyStateMessage: TableEmptyStateMessage | undefined;
  @Input() dataSource: T[] = [];
  @Input() loading$!: any;
  @Input() pagination:
    | {
        pageIndex: number;
        pageSize: number;
        totalCount: number;
      }
    | undefined;
  @Input() sortField = '';
  @Input() searchValue = '';
  @Input() sortDir: 'asc' | 'desc' = 'asc';

  @Output() pageChanged = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<{ actionId: string; row: T }>();

  constructor(private readonly router: Router) {}

  get displayedColumns(): string[] {
    return this.columns.map((c) => c.key);
  }

  onNavigationClick() {
    if (this.tableEmptyStateMessage?.navigationUrl) {
      this.router.navigate([this.tableEmptyStateMessage.navigationUrl]);
    }
  }

  onHeaderClick(column: TableColumn<T> | TableActionColumn<T>): void {
    if (!this.isActionColumn(column) && column.sortable) {
      this.sortChange.emit(column.key);
    }
  }

  getCellValue(column: TableColumn<T>, element: T) {
    return column.formatter ? column.formatter(element) : (element as any)[column.key];
  }

  isBadge(value: any): value is TableCellBadge {
    return value?.type === 'badge';
  }

  isActionColumn(column: TableColumnDefinition<T>): column is TableActionColumn<T> {
    return column.key === 'actions';
  }

  isStatus(column: TableColumnDefinition<T>): column is TableActionColumn<T> {
    return column.key === 'actions';
  }

  get totalPages(): number {
    if (!this.pagination) return 1;
    return Math.max(1, Math.ceil(this.pagination.totalCount / this.pagination.pageSize));
  }

  get startItem(): number {
    if (!this.pagination || this.pagination.totalCount === 0) return 0;
    return (this.pagination.pageIndex - 1) * this.pagination.pageSize + 1;
  }

  get endItem(): number {
    if (!this.pagination) return 0;
    return Math.min(
      this.pagination.pageIndex * this.pagination.pageSize,
      this.pagination.totalCount,
    );
  }

  get visiblePages(): (number | string)[] {
    if (!this.pagination) return [];

    const current = this.pagination.pageIndex;
    const total = this.totalPages;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }

    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  goToPage(page: number): void {
    if (!this.pagination) return;
    if (page < 1 || page > this.totalPages || page === this.pagination.pageIndex) return;

    this.pageChanged.emit(page);
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }

  resolveActionValue<T>(
    value: string | ((row: T) => string) | undefined,
    row: T,
  ): string | undefined {
    return typeof value === 'function' ? value(row) : value;
  }

  onActionClick(event: MouseEvent, action: TableAction<T>, row: T): void {
    event.stopPropagation();

    if (action.disabled?.(row)) return;

    if (action.handler) {
      action.handler(row);
      return;
    }

    this.actionClick.emit({ actionId: action.id, row });
  }
}
