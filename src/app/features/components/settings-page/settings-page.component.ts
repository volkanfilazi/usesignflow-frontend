import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  finalize,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../../../shared/components/dialogs/change-password-dialog/change-password-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { TwoFASetupResponse } from '../../../shared/models/auth.model';
import { TwoFAEnableControlDialogComponent } from '../../../shared/components/dialogs/twoFA-enable-control-dialog/twoFAEnableControlDialog.component';
import { TwoFADisableControlDialogComponent } from '../../../shared/components/dialogs/twoFA-disable-control-dialog/twoFA-disable-control-dialog.component';
import { DeleteDialogComponent } from '../../../shared/components/dialogs/delete-dialog/delete-dialog.component';
import { PasswordDialogCOmponent } from '../../../shared/components/dialogs/password-dialog/password-dialog.component';
import { ToolsService } from '../../../shared/services/tools.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  standalone: false,
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  loading$ = new BehaviorSubject(false);
  destroy$ = new Subject<void>();
  formGroup!: FormGroup;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly authApiService: AuthApiService,
    private readonly toolsService: ToolsService,
    private readonly authStateService: AuthStateService,
  ) {}

  ngOnInit() {
    this.loading$.next(true);

    this.authApiService.me().subscribe({
      next: (response) => {
        this.formGroup = new FormGroup({
          twoFactorEnabled: new FormControl(response.twoFactorEnabled),
          notificationsEnabled: new FormControl(response.notificationsEnabled),
        });

        this.listenTwoFactorChanges();

        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
      },
    });
  }

  private listenTwoFactorChanges() {
    this.formGroup
      .get('twoFactorEnabled')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((enabled) => {
        if (enabled) {
          this.authApiService.twoFASetup().subscribe({
            next: (response: TwoFASetupResponse) => {
              const dialogRef = this.matDialog.open(TwoFAEnableControlDialogComponent, {
                data: {
                  otpauthUrl: response.otpauthUrl,
                  secret: response.secret,
                },
              });

              dialogRef.afterClosed().subscribe((result) => {
                if (!result) {
                  this.formGroup?.get('twoFactorEnabled')?.setValue(false, { emitEvent: false });
                }
              });
            },
            error: () => {
              this.formGroup?.get('twoFactorEnabled')?.setValue(false, { emitEvent: false });
            },
          });
        } else {
          const dialogRef = this.matDialog.open(TwoFADisableControlDialogComponent);

          dialogRef.afterClosed().subscribe((result) => {
            if (result !== true) {
              this.formGroup?.get('twoFactorEnabled')?.setValue(true, { emitEvent: false });
            }
          });
        }
      });

    const notificationsControl = this.formGroup.get('notificationsEnabled');

    notificationsControl?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => notificationsControl.disable({ emitEvent: false })),
        exhaustMap((enabled: boolean) =>
          this.authApiService.enableNotifications({ enabled }).pipe(
            catchError(() => {
              notificationsControl.setValue(!enabled, { emitEvent: false });
              return EMPTY;
            }),
            finalize(() => {
              notificationsControl.enable({ emitEvent: false });

              if (enabled) {
                this.toolsService.showSnackbar(
                  'Notifications successfully enabled',
                  'success-message',
                );
              } else {
                this.toolsService.showSnackbar(
                  'Notifications successfully disabled',
                  'success-message',
                );
              }
            }),
          ),
        ),
      )
      .subscribe();
  }

  changePassword() {
    this.matDialog.open(ChangePasswordDialogComponent, {
      width: '400px',
    });
  }

  deleteAccount() {
    const passDialogRef = this.matDialog.open(PasswordDialogCOmponent);
    passDialogRef.afterClosed().subscribe((passResult) => {
      if (passResult) {
        const dialogRef = this.matDialog.open(DeleteDialogComponent, {
          data: {
            title: 'Delete Account',
            description:
              'If you approve, your account will be permanently deleted and cancel future renewals.',
            icon: 'warning',
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loading$.next(true);
            this.authApiService
              .deleteMyAccount({ password: passResult, reason: result })
              .subscribe({
                next: () => {
                  this.toolsService.showSnackbar('Account successfully deleted', 'success-message');
                  this.loading$.next(false);
                  this.authStateService.logout();
                },
                error: () => {
                  this.loading$.next(false);
                },
              });
          } else {
            this.loading$.next(false);
          }
        });
      } else {
        this.loading$.next(false);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
