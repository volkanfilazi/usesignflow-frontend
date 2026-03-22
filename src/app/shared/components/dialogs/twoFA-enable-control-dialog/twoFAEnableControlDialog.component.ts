import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../services/validation.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { AuthResponse } from '../../../models/auth.model';
import { ToolsService } from '../../../services/tools.service';

export interface TwoFAEnableControlDialogData {
  otpauthUrl?: string;
  secret?: string;
}

@Component({
  templateUrl: './twoFAEnableControlDialog.component.html',
  standalone: false,
})
export class TwoFAEnableControlDialogComponent implements OnInit {
  loading$ = new BehaviorSubject(false);
  otpauthUrl = '';
  manualCode = '';
  formGroup!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<TwoFAEnableControlDialogComponent, AuthResponse>,
    @Inject(MAT_DIALOG_DATA) public data: TwoFAEnableControlDialogData,
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
    private readonly toolsService: ToolsService,
  ) {}

  ngOnInit() {
    this.otpauthUrl = this.data.otpauthUrl ?? '';
    this.manualCode = this.data.secret ?? '';
  }

  close() {
    this.dialogRef.close();
  }

  formatSecret(secret: string): string {
    return secret.match(/.{1,4}/g)?.join(' ') ?? secret;
  }

  copySecret() {
    if (!this.manualCode) return;

    navigator.clipboard.writeText(this.manualCode).then(() => {
      this.toolsService.showSnackbar('Code copied', 'success-message');
    });
  }

  confirm(code: string) {
    this.loading$.next(true);
    const payload = {
      code: code,
    };

    this.authApiService.twoFAEnable(payload).subscribe({
      next: (response) => {
        this.dialogRef.close(response);
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
      },
    });
  }
}
