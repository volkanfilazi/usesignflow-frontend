import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { FormDefinitionDto } from '../../../shared/models/form-generator.mode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generic-form-list',
  templateUrl: './generic-form-list.component.html',
  styleUrl: 'generic-form-list.component.scss',
  standalone: false,
})
export class GenericFormListComponent implements OnInit {
  @Input() formNameChanged: string | undefined;
  @Input() myGroup: FormGroup | undefined;

  forms: FormDefinitionDto[] = [];

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

  onFormClick(formDef: FormDefinitionDto) {
    this.router.navigate(['/genericformlistdetail', formDef.id]);
  }
}
