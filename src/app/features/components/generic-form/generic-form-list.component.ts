import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { Router } from '@angular/router';
import { FormDefinition } from '../../../shared/models/form-generator.mode';

@Component({
  selector: 'app-generic-form-list',
  templateUrl: './generic-form-list.component.html',
  styleUrl: 'generic-form-list.component.scss',
  standalone: false,
})
export class GenericFormListComponent implements OnInit {
  @Input() formNameChanged: string | undefined;
  @Input() myGroup: FormGroup | undefined;

  forms: FormDefinition[] = [];

  constructor(
    private readonly formApiService: FormsApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    try {
      this.formApiService.getForms().subscribe((forms) => {
        this.forms = forms;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  }

  onFormClick(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/forms', formDef.id]);
  }
}
