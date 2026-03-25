import { Component } from '@angular/core';
import { EmailApiService } from '../../../shared/services/email-api.service';
import { BehaviorSubject } from 'rxjs';
import { TableColumnDefinition, TableEmptyStateMessage } from '../../../shared/components/table/table.component';
import { EmailLog, getSubmissionStatusColors } from '../../../shared/models/email.model';

@Component({
  templateUrl: './email.component.html',
  standalone: false,
})
export class EmailComponent {
  loading$ = new BehaviorSubject(false);
  tableEmptyStateMessage: TableEmptyStateMessage | undefined;
  columns: TableColumnDefinition<EmailLog>[] = [];
  emails: EmailLog[] = [];

  constructor(private readonly emailApiService: EmailApiService) {}

  ngOnInit() {
    this.loading$.next(true);
    this.setEmptyStateMessage();
    this.setupColums();
    this.loadEmails();
  }

  setupColums() {
    this.columns = [
      {
        key: 'status',
        label: 'Status',
        formatter: (row: any) => {
          const result = getSubmissionStatusColors(row);
          return {
            type: 'badge',
            text: row.status,
            className: result,
          };
        },
      },
      { key: 'toEmail', label: 'To Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'createdAtUtc', label: 'Sendet at' },
    ];
  }

  loadEmails() {
    this.emailApiService.getEmails().subscribe({
      next: (response) => {
        this.emails = response;
        this.loading$.next(false);
      },
      error: () => {
        this.loading$.next(false);
      },
    });
  }

  private setEmptyStateMessage() {
    this.tableEmptyStateMessage = {
      kicker: 'Sended Emails list',
      description: 'You have not sended any email yet. Send an email from your existing submissions.',
      title: 'No email sended yet',
      buttonText: 'Send your first email from submissions list',
      imageSrc: 'Documents-pana.svg',
      navigationUrl: '/dashboard/submissions',
    };
  }
}
