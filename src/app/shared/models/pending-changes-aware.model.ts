import { Observable } from 'rxjs';

export interface PendingChangesAware {
  hasPendingChanges(): boolean;
  saveBeforeLeave?(): Observable<boolean> | Promise<boolean> | boolean;
}
