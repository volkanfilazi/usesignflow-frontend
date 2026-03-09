import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { ActivatedRoute } from '@angular/router';
import { FormDefinitionDto } from '../../../shared/models/form-generator.mode';
import { options } from '../../../shared/models/formType';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-generic-form-detail',
  templateUrl: './generic-form-detail.component.html',
  styleUrl: './generic-form-detail.component.scss',
  standalone: false,
})
export class GenericFormDetailComponent {
  loading = false;
  myGroup: FormGroup | undefined;
  form: FormDefinitionDto | undefined;
  elementOptions = options;

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.myGroup = new FormGroup({});
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.loading = true;
        try {
          this.formApiService.getFormById(id).subscribe((form) => {
            this.form = form;
            this.form.fields.forEach((element) => {
              this.myGroup?.addControl(element.fieldId, new FormControl());
            });

            this.loading = false;
            this.cdr.detectChanges();
          });
        } catch (error) {
          this.loading = false;
        }
      }
    });
  }
}
