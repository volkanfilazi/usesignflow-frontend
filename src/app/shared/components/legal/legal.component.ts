import { Component, OnInit } from '@angular/core';
import { LegalApiService } from '../../services/legal-api.service';
import { ToolsService } from '../../services/tools.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss',
  standalone: false,
})
export class LegalComponent implements OnInit {
  isLoading$ = new BehaviorSubject(false);
  termsHtml = '';

  constructor(
    private readonly legalApiService: LegalApiService,
    private readonly toolsService: ToolsService,
  ) {}

  ngOnInit() {
    this.isLoading$.next(true);
    this.legalApiService.getCurrentTerm().subscribe({
      next: (html) => {
        setTimeout(() => {
          this.termsHtml = html;
          this.isLoading$.next(false);
        });
      },
      error: () => {
        setTimeout(() => {
          this.toolsService.showSnackbar('Terms could not be created.', 'error-snackbar');
          this.isLoading$.next(false);
        });
      },
    });
  }
}
