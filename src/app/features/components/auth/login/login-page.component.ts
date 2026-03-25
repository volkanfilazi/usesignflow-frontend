import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../../shared/services/validation.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ToolsService } from '../../../../shared/services/tools.service';
import { Router } from '@angular/router';
import { LoginDto } from '../../../../shared/models/auth.model';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { getApiErrorMessage } from '../../../../shared/utility/helper/response-error-helper';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TwoFAVerifyDialogComponent } from '../../../../shared/components/dialogs/twoFA-verify-dialog/twoFA-verify-dialog.component';
import { environment } from '../../../../../environments/environment';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { BillingApiService } from '../../../../shared/services/billing-api-service';

declare const google: any;

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: false,
})
export class LoginPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: false })
  googleButtonRef!: ElementRef<HTMLDivElement>;

  formGroup: FormGroup | undefined;
  validationErrors: ValidationIssue[] | undefined;
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly validationService: ValidationService,
    private readonly authApiService: AuthApiService,
    private readonly authStateService: AuthStateService,
    private readonly toolsService: ToolsService,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly googleAuthService: GoogleAuthService,
    private readonly billingApiService: BillingApiService,
  ) {}

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
  }

  async ngAfterViewInit() {
    await this.googleAuthService.init();

    const element = this.googleButtonRef?.nativeElement;
    if (!element) return;

    this.googleAuthService.renderButton(element);
  }

  isInvalid(controlName: string): boolean {
    const control = this.formGroup?.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  login(): void {
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
        if (res.requiresTwoFactor) {
          const dialogRef = this.matDialog.open(TwoFAVerifyDialogComponent, {
            width: '80vh',
            data: {
              twoFactorToken: res.twoFactorToken,
            },
          });

          dialogRef.afterClosed().subscribe((item) => {
            if (item) {
              this.authStateService.setSession(item.token, item.refreshToken);
              this.billingApiService.clearOverviewCache();
              this.loading$.next(false);
              this.router.navigate(['/dashboard']);
            } else {
              this.loading$.next(false);
            }
          });
        } else {
          this.authStateService.setSession(res.token, res.refreshToken);
          this.loading$.next(false);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.next(false);

        if (error.status === 403) {
          this.toolsService.showSnackbar('Account is not yet verified', 'error-snackbar');
          return;
        }

        this.toolsService.showSnackbar(getApiErrorMessage(error), 'error-snackbar');
      },
    });
  }

  ngOnDestroy(): void {}
}
