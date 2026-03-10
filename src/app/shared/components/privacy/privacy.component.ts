import { Component, OnInit } from '@angular/core';
import { LegalApiService } from '../../services/legal-api.service';
import { ToolsService } from '../../services/tools.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  standalone: false,
})
export class PrivacyComponent implements OnInit {
  isLoading$ = new BehaviorSubject(false);
  privacyHtml = '';

  constructor(
    private readonly legalApiService: LegalApiService,
    private readonly toolsService: ToolsService,
  ) {}

  ngOnInit() {
    this.isLoading$.next(true);
    this.legalApiService.getCurrentPrivacy().subscribe({
      next: (html) => {
        setTimeout(() => {
          this.privacyHtml = html;
          this.isLoading$.next(false);
        });
      },
      error: () => {
        setTimeout(() => {
          this.toolsService.showSnackbar('Privacy could not be created.', 'error-snackbar');
          this.isLoading$.next(false);
        });
      },
    });
  }
}
