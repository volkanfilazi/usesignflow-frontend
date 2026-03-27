import { AbstractControl } from '@angular/forms';
import { PendingChangesAware } from '../models/pending-changes-aware.model';

export abstract class SnapshotTrackedComponent<T> implements PendingChangesAware {
  protected initialSnapshot: T | null = null;

  protected abstract buildSnapshot(): T;
  protected abstract getForm(): AbstractControl | null;

  hasPendingChanges(): boolean {
    if (this.initialSnapshot == null) return false;
    return JSON.stringify(this.buildSnapshot()) !== JSON.stringify(this.initialSnapshot);
  }

  protected captureInitialState(): void {
    this.initialSnapshot = structuredClone(this.buildSnapshot());
    this.getForm()?.markAsPristine();
  }
}