import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { SendForSignatureRequest } from '../../../models/form-generator.mode';

export interface SendEmailDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'mail' | 'default';
  sendForSignatureRequest: SendForSignatureRequest;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, SharedModule],
  templateUrl: './send-email-dialog.component.html',
  styleUrl: './send-email-dialog.component.scss',
})
export class SendEmailDialogComponent implements OnInit {
  formGroup: FormGroup | undefined;
  validationErrors: ValidationIssue[] | undefined;

  constructor(
    private dialogRef: MatDialogRef<SendEmailDialogComponent, SendForSignatureRequest>,
    private readonly validationService: ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: SendEmailDialogData,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      subject: new FormControl(''),
      recipient: new FormControl('', Validators.required),
    });
  }

  onConfirm(): void {
    if (!this.formGroup) {
      return;
    }

    this.validationErrors = [];

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      return;
    }

    this.data.sendForSignatureRequest = {
      email: this.formGroup?.value.recipient,
      subject: this.formGroup.value.subject,
    };

    if (this.formGroup?.get('recipient')?.valid) {
      this.dialogRef.close(this.data.sendForSignatureRequest);
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
