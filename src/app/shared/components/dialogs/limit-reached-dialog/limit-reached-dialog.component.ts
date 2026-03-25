import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './limit-reached-dialog.component.html',
  standalone: false,
})
export class LimitReachedDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<LimitReachedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { returnUrl?: string, reason?: string },
  ) {}

  goBilling() {
    this.dialogRef.close('billing');
  }

  close() {
    this.dialogRef.close('cancel');
  }
}
