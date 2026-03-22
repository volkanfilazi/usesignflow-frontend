import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../services/validation.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ToolsService } from '../../../services/tools.service';
import { DisableTwoFactorRequest } from '../../../models/auth.model';

@Component({
  templateUrl: './twoFA-disable-control-dialog.component.html',
  standalone: false,
})
export class TwoFADisableControlDialogComponent implements OnInit {
  validationErrors: ValidationIssue[] | undefined;
  loading$ = new BehaviorSubject(false);
  formGroup: FormGroup | undefined;
  currentPasswordCompleted = false;

  constructor(
    private dialogRef: MatDialogRef<TwoFADisableControlDialogComponent, boolean>,
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
    private readonly toolsService: ToolsService,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      currentPassword: new FormControl(null, [
        Validators.required,
        ValidationService.passwordPatternValidator(),
      ]),
    });
  }

  close(value: boolean) {
    this.dialogRef.close(value);
  }

  confirm() {
    this.validationErrors = [];

    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      return;
    }

    if (this.formGroup?.value.currentPassword) {
      this.currentPasswordCompleted = true;
    }
  }

  codeCompleted(input: string) {
    if (input) {
      const disableTwoFactorPayload: DisableTwoFactorRequest = {
        Code: input,
        CurrentPassword: this.formGroup?.value.currentPassword,
      };

      this.authApiService.disableTwoFactor(disableTwoFactorPayload).subscribe({
        next: () => {
          this.toolsService.showSnackbar('2FA has been successfully disabled', 'success-message');
          this.close(true);
        },
        error: () => {},
      });
    }
  }
}