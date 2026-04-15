export interface SubmissionSettingsUpdate {
  defaultAccessTokenLifetimeDays?: number | null;
  defaultReminderIntervalDays?: number | null;
  reminderEnabledByDefault?: boolean | null;
  maxReminderCount?: number | null;
}

export interface SubmissionSettingsResponse {
  defaultAccessTokenLifetimeDays: number;
  defaultReminderIntervalDays: number;
  reminderEnabledByDefault: boolean;
  maxReminderCount: number;
  isDefault: boolean;
}

export interface SubmissionSummaryResponse<T> {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  completionRate: number;
}

export interface SubmissionSummaryRequest {
  start?: number;
  end?: number;
}

export interface SubmissionTrendPointResponse {
  label: string;
  created: number;
  completed: number;
}

export interface SubmissionTrendResponse {
  granularity: string;
  points: SubmissionTrendPointResponse[];
}
