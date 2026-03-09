import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../../shared/services/validation.service';
import { AuthApiService } from '../../../../shared/services/auth-api.service';
import { ToolsService } from '../../../../shared/services/tools.service';
import { Router } from '@angular/router';
import { LoginDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: false,
})
export class LoginPageComponent {
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
    this.formGroup = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  login() {
    this.validationErrors = [];
    this.loading$.next(true);

    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.formGroup);
      this.loading$.next(false);
      return;
    }

    const login: LoginDto = {
      email: this.formGroup?.get('email')?.value,
      password: this.formGroup?.get('password')?.value,
    };

    this.authApiService.login(login).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.loading$.next(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.loading$.next(false);

        if (error.status === 403) {
          this.toolsService.showSnackbar('Account is not yet verified', 'error-snackbar');
        } else {
          this.toolsService.showSnackbar(error.error, 'error-snackbar');
        }
      },
    });
  }
}
