import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { ToolsService } from '../../../shared/services/tools.service';

@Component({
  selector: 'app-submission-completed',
  templateUrl: './submission-completed.component.html',
  styleUrl: './submission-completed.component.scss',
  standalone: true,
  imports: [MatIcon],
})
export class SubmissionCompletedComponent {
  private readonly destroy$ = new Subject<void>();
  private token = '';
  private formId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formApiService: FormsApiService,
    private readonly toolsService: ToolsService,
  ) {
    const state = history.state;
    this.token = state.token;

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('submissionId');
      this.formId = id ?? '';
    });
  }

  downloadPdf() {
    if (this.token && this.formId) {
      this.formApiService.downloadPdf(this.formId, this.token, this.toolsService);
    } else {
      this.toolsService.showSnackbar('PDF could not downloaded.', 'error-snackbar');
    }
  }
}
