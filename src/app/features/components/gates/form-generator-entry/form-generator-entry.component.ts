import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LimitReachedDialogComponent } from '../../../../shared/components/dialogs/limit-reached-dialog/limit-reached-dialog.component';

@Component({
  templateUrl: './form-generator-entry.component.html',
  standalone: true,
})
export class FormGeneratorEntryComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const reason = params.get('reason');
      const returnUrl = params.get('returnUrl');

      if (reason === 'flow') {
        const dialogRef = this.dialog.open(LimitReachedDialogComponent, {
          data: { returnUrl, reason },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'billing') {
            this.router.navigate(['/dashboard/billing']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }
}
