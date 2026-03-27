import { Component, ViewChild } from '@angular/core';
import { PendingChangesAware } from '../../guard/pending-changes-guard';
import { DynamicFormRendererComponent } from '../../../shared/components/dynamicFormRenderer/dynamic-form-renderer.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-generic-form-detail',
  templateUrl: './generic-form-detail.component.html',
  standalone: false,
})
export class GenericFormDetailComponent implements PendingChangesAware {
  @ViewChild(DynamicFormRendererComponent)
  dynamicFormRenderer?: DynamicFormRendererComponent;

  public hasPendingChanges(): boolean {
    return this.dynamicFormRenderer?.hasPendingChanges() ?? false;
  }

  public saveBeforeLeave(): Observable<boolean> | Promise<boolean> | boolean {
    return this.dynamicFormRenderer?.saveBeforeLeave?.() ?? of(false);
  }
}
