import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface SendEmailDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'mail' | 'default';
}

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, SharedModule],
  templateUrl: './agreement-detail-dialog.component.html',
})
export class AgreementDetailDialogComponent implements OnInit {
  formGroup: FormGroup | undefined;

  constructor(
    private dialogRef: MatDialogRef<AgreementDetailDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: SendEmailDialogData,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      recipient: new FormControl('', Validators.required),
    });
  }

  onConfirm(): void {
    if (this.formGroup?.get('recipient')?.valid) {
      this.dialogRef.close(this.formGroup?.get('recipient')?.value ?? '');
    }
  }

  close() {
    this.dialogRef.close(undefined);
  }

  get icon(): string {
    switch (this.data.variant) {
      case 'danger':
        return 'warning';
      case 'success':
        return 'task_alt';
      case 'mail':
        return 'mail';
      default:
        return 'help';
    }
  }
}
