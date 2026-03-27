import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../../shared/services/validation.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolsService } from '../../../../shared/services/tools.service';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: false,
})
export class ResetPasswordComponent implements OnInit {
  private emailFromParams: string | undefined;
  private tokenFromParams: string | undefined;

  validationErrors: ValidationIssue[] | undefined;
  loading$ = new BehaviorSubject<boolean>(false);
  formGroup: FormGroup | undefined;

  constructor(
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
    private readonly route: ActivatedRoute,
    private readonly toolsService: ToolsService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.emailFromParams = params.get('email') ?? '';
      this.tokenFromParams = params.get('token') ?? '';
    });

    this.formGroup = new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          ValidationService.passwordPatternValidator(),
        ]),
        passwordConfirm: new FormControl('', [Validators.required]),
      },
      { validators: this.validationService.passwordMatchValidator },
    );
  }

  resetPassword(): void {
    if (this.emailFromParams && this.tokenFromParams) {
      this.validationErrors = [];
      this.loading$.next(true);

      if (this.formGroup?.invalid) {
        this.formGroup.markAllAsTouched();
        this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
        this.loading$.next(false);

        return;
      }

      const password = this.formGroup?.get('password')?.value;
      this.authApiService
        .resetPassword({
          email: this.emailFromParams,
          token: this.tokenFromParams,
          NewPassword: password,
        })
        .subscribe({
          next: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'Password has been reset successfully',
              'success-message',
            );
            this.router.navigate(['/login']);
          },
          error: (e) => {
            this.loading$.next(false);
          },
        });
    }
  }
}
