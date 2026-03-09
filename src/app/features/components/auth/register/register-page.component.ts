import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ValidationService } from '../../../../shared/services/validation.service';
import { RegisterDto } from '../../../../shared/models/auth.model';
import { AuthApiService } from '../../../../shared/services/auth-api.service';
import { BehaviorSubject } from 'rxjs';
import { ToolsService } from '../../../../shared/services/tools.service';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { Constants } from '../../../../shared/models/constants';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  standalone: false,
})
export class RegisterPageComponent implements OnInit {
  formGroup: FormGroup | undefined;
  validationErrors: ValidationIssue[] | undefined;
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
    private readonly toolsService: ToolsService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup(
      {
        fullName: new FormControl(),
        email: new FormControl(),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(Constants.passwordRegex),
        ]),
        passwordConfirm: new FormControl('', [Validators.required]),
      },
      { validators: this.validationService.passwordMatchValidator },
    );
  }

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  register() {
    this.validationErrors = [];
    this.loading$.next(true);

    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      this.loading$.next(false);
      return;
    }

    const password = this.formGroup?.get('password')?.value;

    const register: RegisterDto = {
      fullName: this.formGroup?.get('fullName')?.value,
      email: this.formGroup?.get('email')?.value,
      password: password,
    };

    this.authApiService.createRegister(register).subscribe({
      next: () => {
        this.loading$.next(false);
        this.toolsService.showSnackbar(
          'Account created successfully. Please verify your email.',
          'success-snackbar',
        );

        this.router.navigate(['/verify-email'], {
          queryParams: { email: register.email },
        });
      },
      error: (error: any) => {
        this.loading$.next(false);
        this.toolsService.showSnackbar(error.error, 'error-snackbar');
      },
    });
  }
}
