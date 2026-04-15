import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthApiService } from '../../../../core/services/auth-api.service';

export interface OneTimeCodeDialogComponentData {
  success?: string;
  expiresAtUtc?: number;
  verifyToken: string;
}

@Component({
  templateUrl: './one-time-code-dialog.component.html',
  standalone: false,
})
export class OneTimeCodeDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<OneTimeCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OneTimeCodeDialogComponentData,
    private readonly authApiService: AuthApiService,
  ) {}

  close() {
    this.dialogRef.close();
  }

  codeCompleted(code: string) {
    if (this.data.success && this.data.verifyToken) {
      this.authApiService
        .verifyOneTimeCode({
          verifyToken: this.data.verifyToken,
          code: code,
        })
        .subscribe({
          next: (response) => {
            return this.dialogRef.close(response);
          },
        });
    }
  }
}
