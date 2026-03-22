import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: './password-dialog.component.html',
  standalone: false,
})
export class PasswordDialogCOmponent implements OnInit {
  formGroup: FormGroup | undefined;

  constructor(private dialogRef: MatDialogRef<PasswordDialogCOmponent>) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      password: new FormControl(null, Validators.required),
    });
  }

  close(value: boolean) {
    this.dialogRef.close(value);
  }

  confirm() {
    this.dialogRef.close(this.formGroup?.value.password ?? '');
  }
}
