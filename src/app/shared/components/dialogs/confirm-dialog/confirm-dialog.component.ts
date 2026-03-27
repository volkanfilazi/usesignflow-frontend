import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  hasDiscard?: boolean;
  variant?: 'danger' | 'success' | 'default';
}

export enum DialogResults {
  discard = 'discard',
  save = 'save',
  cancel ='cancel'
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  standalone: false
})
export class ConfirmDialogComponent {
  dialogResult = DialogResults;
  
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent, DialogResults>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  close(result: DialogResults): void {
    this.dialogRef.close(result);
  }

  get icon(): string {
    switch (this.data.variant) {
      case 'danger':
        return 'warning';
      case 'success':
        return 'task_alt';
      default:
        return 'help';
    }
  }
}
