import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsApiService } from '../../../../shared/services/form-api.service';
import { ToolsService } from '../../../../shared/services/tools.service';
import { Subject, takeUntil } from 'rxjs';
import { getSubmissionMode } from '../../../../shared/models/form-generator.mode';
import { EditMode } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-submission-access',
  templateUrl: './submission-access.component.html',
  standalone: true,
})
export class SubmissionAccessComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly toolsService: ToolsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.resolveSubmissionAccess();
  }

  private resolveSubmissionAccess(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.toolsService.showSnackbar('Access token not found.', 'error-snackbar');
      this.router.navigate(['/login']);
      return;
    }

    this.formApiService
      .resolveSubmissionAccess({ token })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.isAuthenticated && response.isEmailMatch) {
            this.router.navigate(['/dashboard/submissions', response.submissionId, EditMode.EDIT]);
            return;
          }

          this.router.navigate(['/submission-access', response.submissionId, EditMode.EDIT], {
            queryParams: { token },
          });
        },
        error: () => {
          this.toolsService.showSnackbar(
            'Submission access could not be resolved.',
            'error-snackbar',
          );
        },
      });
  }
}
