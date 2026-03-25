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
  label: string;
  icon?: string;
  iconColor?: string;
  handler?: (row: T) => void;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
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

  @Output() rowClick = new EventEmitter<T>();
  @Output() actionClick = new EventEmitter<{ actionId: string; row: T }>();

  constructor(private readonly router: Router) {}

  get displayedColumns(): string[] {
    return this.columns.map((c) => c.key);
  }

  onNavigationClick() {
    console.log(this.tableEmptyStateMessage);
    if (this.tableEmptyStateMessage?.navigationUrl) {
      this.router.navigate([this.tableEmptyStateMessage.navigationUrl]);
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

  onRowClick(row: T) {
    this.rowClick.emit(row);
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
