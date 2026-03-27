import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { from, isObservable, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  ConfirmDialogComponent,
  DialogResults,
} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

export interface PendingChangesAware {
  hasPendingChanges(): boolean;
  saveBeforeLeave?(): Observable<boolean> | Promise<boolean> | boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesAware> = (component) => {
  if (!component.hasPendingChanges()) {
    return true;
  }

  const dialog = inject(MatDialog);
  const dialogRef = dialog.open(ConfirmDialogComponent, {
    width: '420px',
    panelClass: 'confirm-dialog-panel',
    data: {
      title: 'Unsaved changes',
      message: 'You have unsaved changes. What would you like to do?',
      confirmText: 'Save',
      cancelText: 'Stay',
      hasDiscard: true,
      variant: 'danger',
    },
  });

  return dialogRef.afterClosed().pipe(
    switchMap((result: DialogResults) => {
      if (result === DialogResults.cancel || result == null) {
        return of(false);
      }

      if (result === DialogResults.discard) {
        return of(true);
      }

      if (result === DialogResults.save) {
        if (!component.saveBeforeLeave) {
          return of(false);
        }

        const saveResult = component.saveBeforeLeave();

        if (isObservable(saveResult)) {
          return saveResult;
        }

        if (saveResult instanceof Promise) {
          return from(saveResult);
        }

        return of(saveResult);
      }

      return of(false);
    }),
  );
};
