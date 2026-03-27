import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './limit-reached-dialog.component.html',
  styleUrl: './limit-reached-dialog.component.scss',
  standalone: false,
})
export class LimitReachedDialogComponent {
  planCode = '';

  constructor(
    private dialogRef: MatDialogRef<LimitReachedDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { returnUrl?: string; reason?: string; planCode?: string },
  ) {}

  ngOnInit() {
    this.planCode = this.data.planCode ?? '';
  }

  goBilling() {
    this.dialogRef.close('billing');
  }

  close() {
    this.dialogRef.close('cancel');
  }
}
