import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PageActionService } from '../../../../shared/services/header/page-action.service';
import { SubmissionSettingsApiService } from '../../../../shared/services/submission-settings-api.service';
import { SubmissionSettingsUpdate } from '../../../../shared/models/submission-settings.model';
import { ToolsService } from '../../../../shared/services/tools.service';

@Component({
  templateUrl: './submission-settings.component.html',
  styleUrl: './submission-settings.component.scss',
  standalone: false,
})
export class SubmissionSettingsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly presetValues = ['2', '3', '7', '14', '30'];
  private readonly reminderPresets = [2, 3, 7];

  loading$ = new BehaviorSubject(false);
  callActionLoading$ = new BehaviorSubject(false);
  pageOwner = 'submission-settings';

  constructor(
    private readonly pageActionService: PageActionService,
    private readonly submissionSettingsApiService: SubmissionSettingsApiService,
    private readonly toolsService: ToolsService,
  ) {}

  form = new FormGroup({
    expirationPreset: new FormControl<string>('3'),
    expirationCustom: new FormControl<number | null>({ value: null, disabled: true }),
    reminderPreset: new FormControl<string>('3'),
    reminderCustom: new FormControl<number | null>({ value: null, disabled: true }),
    reminderEnabledByDefault: new FormControl<boolean>(false),
    maxReminderCount: new FormControl<number>(3),
  });

  ngOnInit() {
    this.loading$.next(true);
    this.pageActionService.clearActions();
    this.setActions();
    this.setupLogic();
    this.loadData();
  }

  private mapToRequest(): SubmissionSettingsUpdate {
    const expirationDays =
      this.form.value.expirationPreset === 'custom'
        ? (this.form.value.expirationCustom ?? 3)
        : Number(this.form.value.expirationPreset);

    const reminderDays =
      this.form.value.reminderPreset === 'custom'
        ? Math.min(this.form.value.reminderCustom ?? 1, Math.max(expirationDays - 1, 1))
        : Number(this.form.value.reminderPreset);

    return {
      defaultAccessTokenLifetimeDays: expirationDays,
      reminderEnabledByDefault: this.form.value.reminderEnabledByDefault ?? false,
      defaultReminderIntervalDays: reminderDays,
      maxReminderCount: this.form.value.maxReminderCount ?? 3,
    };
  }

  private applySettings(response: {
    defaultAccessTokenLifetimeDays: number;
    reminderEnabledByDefault: boolean;
    defaultReminderIntervalDays: number;
    maxReminderCount: number;
  }): void {
    const expirationDays = response.defaultAccessTokenLifetimeDays?.toString() ?? '3';
    const reminderDays = response.defaultReminderIntervalDays?.toString() ?? '3';

    const expirationIsPreset = this.presetValues.includes(expirationDays);
    const reminderIsPreset = this.presetValues.includes(reminderDays);

    this.form.patchValue(
      {
        expirationPreset: expirationIsPreset ? expirationDays : 'custom',
        expirationCustom: expirationIsPreset ? null : response.defaultAccessTokenLifetimeDays,
        reminderPreset: reminderIsPreset ? reminderDays : 'custom',
        reminderCustom: reminderIsPreset ? null : response.defaultReminderIntervalDays,
        reminderEnabledByDefault: response.reminderEnabledByDefault,
        maxReminderCount: response.maxReminderCount,
      },
      { emitEvent: false },
    );

    if (expirationIsPreset) {
      this.form.get('expirationCustom')?.disable({ emitEvent: false });
    } else {
      this.form.get('expirationCustom')?.enable({ emitEvent: false });
    }

    if (reminderIsPreset) {
      this.form.get('reminderCustom')?.disable({ emitEvent: false });
    } else {
      this.form.get('reminderCustom')?.enable({ emitEvent: false });
    }
  }

  getExpirationDays(): number {
    const preset = this.form.get('expirationPreset')?.value;

    if (preset === 'custom') {
      return this.form.get('expirationCustom')?.value ?? 1;
    }

    return Number(preset ?? 1);
  }

  isReminderPresetDisabled(days: number): boolean {
    const expirationDays = this.getExpirationDays();
    return days >= expirationDays;
  }

  getMaxAllowedReminderDays(): number {
    return Math.max(this.getExpirationDays() - 1, 1);
  }

  private setActions() {
    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Save',
      loading$: this.callActionLoading$,
      owner: this.pageOwner,
      handler: () => this.update(),
    });
  }

  private loadData() {
    this.loading$.next(true);

    this.submissionSettingsApiService
      .getSetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.applySettings(response);
          this.loading$.next(false);
        },
        error: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar(
            'Submission settings could not be loaded',
            'error-message',
          );
        },
      });
  }

  private update() {
    this.callActionLoading$.next(true);
    const payload = this.mapToRequest();
    this.submissionSettingsApiService
      .updateSubmissionSetting(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toolsService.showSnackbar(
            'Submission settings has been successfully updated',
            'success-message',
          );
          this.callActionLoading$.next(false);
        },
        error: () => {
          this.toolsService.showSnackbar(
            'Submission settings update has been failed',
            'success-message',
          );
          this.callActionLoading$.next(false);
        },
      });
  }

  private setupLogic(): void {
    this.form
      .get('expirationPreset')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val !== 'custom') {
          this.form.get('expirationCustom')?.disable({ emitEvent: false });
        } else {
          this.form.get('expirationCustom')?.enable({ emitEvent: false });
        }

        this.syncReminderConstraints();
      });

    this.form
      .get('expirationCustom')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.get('expirationPreset')?.value === 'custom') {
          this.syncReminderConstraints();
        }
      });

    this.form
      .get('reminderPreset')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val !== 'custom') {
          this.form.get('reminderCustom')?.disable({ emitEvent: false });
        } else {
          this.form.get('reminderCustom')?.enable({ emitEvent: false });
        }
      });

    this.form
      .get('reminderCustom')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.form.get('reminderPreset')?.value !== 'custom') return;

        const maxAllowed = this.getMaxAllowedReminderDays();
        if (value != null && value >= this.getExpirationDays()) {
          this.form.get('reminderCustom')?.setValue(maxAllowed, { emitEvent: false });
        }
      });
  }

  private syncReminderConstraints(): void {
    const reminderPreset = this.form.get('reminderPreset')?.value;
    const reminderCustomControl = this.form.get('reminderCustom');
    const maxAllowed = this.getMaxAllowedReminderDays();

    if (reminderPreset !== 'custom' && reminderPreset != null) {
      const presetNumber = Number(reminderPreset);
      if (presetNumber >= this.getExpirationDays()) {
        const fallback = this.reminderPresets.find((x) => x < this.getExpirationDays()) ?? 1;
        this.form.get('reminderPreset')?.setValue(String(fallback), { emitEvent: false });
      }
    }

    if (reminderPreset === 'custom') {
      const currentCustom = reminderCustomControl?.value;
      if (currentCustom != null && currentCustom >= this.getExpirationDays()) {
        reminderCustomControl?.setValue(maxAllowed, { emitEvent: false });
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
    this.pageActionService.clearActionsByOwner(this.pageOwner);
  }
}
