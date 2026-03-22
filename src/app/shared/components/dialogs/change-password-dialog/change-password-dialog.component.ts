import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChangePasswordRequest } from '../../../models/auth.model';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { BehaviorSubject } from 'rxjs';
import { ToolsService } from '../../../services/tools.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';

@Component({
  templateUrl: './change-password-dialog.component.html',
  standalone: false,
})
export class ChangePasswordDialogComponent implements OnInit {
  loading$ = new BehaviorSubject(false);
  formGroup: FormGroup | undefined;
  validationErrors: ValidationIssue[] | undefined;

  constructor(
    private readonly authApiService: AuthApiService,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup(
      {
        currentPassword: new FormControl(),
        password: new FormControl('', [
          Validators.required,
          ValidationService.passwordPatternValidator(),
        ]),
        passwordConfirm: new FormControl('', [Validators.required]),
      },
      { validators: this.validationService.passwordMatchValidator },
    );
  }

  close() {
    this.dialogRef.close();
  }

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  cormfirm() {
    this.validationErrors = [];
    this.loading$.next(true);

    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      this.loading$.next(false);

      return;
    }

    const changePasswordPayload: ChangePasswordRequest = {
      currentPassword: this.formGroup?.value.currentPassword,
      newPassword: this.formGroup?.value.password,
    };

    this.authApiService.changePassword(changePasswordPayload).subscribe({
      next: () => {
        this.loading$.next(false);
        this.close();
        this.toolsService.showSnackbar(
          'Password has been successfully changed',
          'success-snackbar',
        );
      },
      error: (err) => {
        this.loading$.next(false);
      },
    });
  }
}
