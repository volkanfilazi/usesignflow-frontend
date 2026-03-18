import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormDefinition } from '../../../models/form-generator.mode';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-form-preview-dialog',
  standalone: false,
  templateUrl: './form-preview-dialog.component.html',
})
export class FormPreviewDialogComponent implements OnInit {
  formGroup: FormGroup | undefined;
  loading$ = new BehaviorSubject(false);
  formDefinition: FormDefinition | undefined;

  constructor(
    private readonly dialogRef: MatDialogRef<FormPreviewDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: FormDefinition,
  ) {}

  ngOnInit() {
    this.formDefinition = this.data;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
