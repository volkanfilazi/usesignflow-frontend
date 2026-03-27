import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

export interface DeleteDialogData {
  title: '';
  description: '';
  icon: 'warn';
  needReason: boolean;
}

@Component({
  templateUrl: './delete-dialog.component.html',
  standalone: false,
})
export class DeleteDialogComponent implements OnInit {
  formGroup: FormGroup | undefined;
  needReason = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData,
  ) {}

  ngOnInit() {
    this.needReason = this.data.needReason ?? true;
    this.formGroup = new FormGroup({
      reason: new FormControl(),
    });
  }

  close(value: boolean) {
    this.dialogRef.close(value);
  }

  confirm() {
    this.dialogRef.close(this.formGroup?.value.reason ?? '');
  }
}
