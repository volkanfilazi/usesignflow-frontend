import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsApiService } from '../../../../shared/services/form-api.service';
import { ToolsService } from '../../../../shared/services/tools.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { EditMode, VerifyOneTimeCodeResponse } from '../../../../shared/models/auth.model';
import { AuthLoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { AsyncPipe } from '@angular/common';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { MatDialog } from '@angular/material/dialog';
import { OneTimeCodeDialogComponent } from '../../../../shared/components/dialogs/one-time-code-dialog/one-time-code-dialog.component';

@Component({
  selector: 'app-submission-access',
  templateUrl: './submission-access.component.html',
  standalone: true,
  imports: [AuthLoadingOverlayComponent, AsyncPipe],
})
export class SubmissionAccessComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly toolsService: ToolsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authApiService: AuthApiService,
    private readonly matDialog: MatDialog,
  ) {}

  ngOnInit() {
    this.resolveSubmissionAccess();
  }

  private resolveSubmissionAccess(): void {
    this.loading$.next(true);
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.toolsService.showSnackbar('Access token not found.', 'error-snackbar');
      this.router.navigate(['/login']);
      this.loading$.next(false);

      return;
    }

    this.formApiService
      .resolveSubmissionAccess({ token })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.isAuthenticated && response.isEmailMatch) {
            this.router.navigate(['/dashboard/submissions', response.submissionId, EditMode.EDIT]);
            this.loading$.next(false);
            return;
          }

          if (response.submissionId && response.requiresVerification) {
            this.authApiService.sendOneTimeCode({ verifyToken: token }).subscribe({
              next: (oneTimeResponse) => {
                this.loading$.next(false);
                const dialogRef = this.matDialog.open(OneTimeCodeDialogComponent, {
                  data: {
                    success: oneTimeResponse.success,
                    expiresAtUtc: oneTimeResponse.expiresAtUtc,
                    verifyToken: token
                  },
                });

                dialogRef.afterClosed().subscribe((item) => {
                  if (item) {
                    this.toolsService.showSnackbar('Verified successfully', 'success-message');
                    this.router.navigate(
                      ['/submission-access', response.submissionId, EditMode.EDIT],
                      {
                        queryParams: { token },
                      },
                    );
                  } else {
                    this.router.navigate(['/login']);
                    this.toolsService.showSnackbar('Verify failed', 'success-message');
                  }
                });
              },
              error: () => {
                this.loading$.next(false);
                this.router.navigate(['/login']);
                this.toolsService.showSnackbar('Verify failed', 'success-message');
              },
            });

            return;
          }

          this.router.navigate(['/submission-access', response.submissionId, EditMode.EDIT], {
            queryParams: { token },
          });

          this.loading$.next(false);
        },
        error: (error: any) => {
          this.loading$.next(false);
        },
      });
  }
}
