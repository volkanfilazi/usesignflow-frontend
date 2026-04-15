import { Component, OnInit } from '@angular/core';
import { FormsApiService } from '../../../../shared/services/form-api.service';
import { ToolsService } from '../../../../shared/services/tools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EditMode } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-verification-pdf-access',
  standalone: true,
  template: `
    <div class="verification-pdf-access-container">
      <h1>Verification PDF Access</h1>
      <p>Welcome to the Verification PDF Access page.</p>
    </div>
  `,
})
export class VerificationPdfAccessComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly toolsService: ToolsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.resolveVerificationPdfAccess();
  }

  private resolveVerificationPdfAccess(): void {
    const verifyToken = this.route.snapshot.queryParamMap.get('verifyToken');

    if (!verifyToken) {
      this.toolsService.showSnackbar('Verification token not found.', 'error-snackbar');
      this.router.navigate(['/login']);
      return;
    }

    this.formApiService
      .resolveverificationPdfAccess(verifyToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/verification-pdf-access', response.submissionId, EditMode.VIEW], {
            queryParams: { verifyToken },
          });
        },
        error: (error: any) => {},
      });
  }
}
