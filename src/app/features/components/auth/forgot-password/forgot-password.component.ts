import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../../shared/services/validation.service';
import { BehaviorSubject } from 'rxjs';
import { AuthApiService } from '../../../../core/services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  standalone: false,
})
export class ForgotPasswordComponent {
  validationErrors: ValidationIssue[] | undefined;
  loading$ = new BehaviorSubject<boolean>(false);

  formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
  ) {}

  sendResetLink(): void {
    this.validationErrors = [];
    this.loading$.next(true);

    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      this.loading$.next(false);

      return;
    }

    const email = this.formGroup.get('email')?.value;

    if (email) {
      this.authApiService.forgotPassword(email).subscribe({
        next: (response) => {
          console.log(response);
          this.loading$.next(false);
        },
        error: () => {
          this.loading$.next(false);
        },
      });
    }
  }
}
