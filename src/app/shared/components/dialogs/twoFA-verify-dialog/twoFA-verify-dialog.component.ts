import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthApiService } from '../../../../core/services/auth-api.service';

export interface TwoFAVerifyDialogComponentData {
  twoFactorToken?: string;
}

@Component({
  templateUrl: './twoFA-verify-dialog.component.html',
  standalone: false,
})
export class TwoFAVerifyDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<TwoFAVerifyDialogComponentData>,
    @Inject(MAT_DIALOG_DATA) public data: TwoFAVerifyDialogComponentData,
    private readonly authApiService: AuthApiService,
  ) {}

  close() {
    this.dialogRef.close();
  }

  codeCompleted(code: string) {
    this.authApiService
      .verifyTwoFactor({
        twoFactorToken: this.data.twoFactorToken ?? '',
        code: code,
      })
      .subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: () => {
          
        },
      });
  }
}
