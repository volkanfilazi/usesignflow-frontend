export interface EmailLog {
  id: string;
  userId: string;
  toEmail: string;
  emailType: string;
  relatedEntityId: string;
  subject: string;
  status: EmailStatus;
  errorMessage?: string | null;
  createdAtUtc: string;
  sentAtUtc?: string | null;
}

export type EmailStatus = 'Pending' | 'Sent' | 'Failed';

export enum EmailStatusAsEnum {
  Pending = 'Pending',
  Sent = 'Sent',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
}

export function getSubmissionStatusColors(row: EmailLog) {
  switch (row.status) {
    case EmailStatusAsEnum.Pending:
      return 'status-yellow';

    case EmailStatusAsEnum.Sent:
      return 'status-green';

    case EmailStatusAsEnum.Failed:
    default:
      return 'status-red';
  }
}
