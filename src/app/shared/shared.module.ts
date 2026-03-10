import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextInputComponent } from './components/inputs/text-input/text-input.component';
import { PrimaryButtonComponent } from './components/buttons/primary/primary-button.component';
import { ComboboxComponent } from './components/inputs/combobox/combobox.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CheckboxComponent } from './components/inputs/checkbox/checkbox.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ChipsInputComponent } from './components/chips-input/chips-input.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { TableComponent } from './components/table/table.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { HeaderComponent } from './components/header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { ValidationComponent } from './components/validation/validation.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { LegalComponent } from './components/legal/legal.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

@NgModule({
  declarations: [
    TextInputComponent,
    ComboboxComponent,
    CheckboxComponent,
    ChipsInputComponent,
    TableComponent,
    HeaderComponent,
    ValidationComponent,
    SignaturePadComponent,
    SpinnerComponent,
    LegalComponent,
    PrivacyComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    PrimaryButtonComponent,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    TimelineComponent,
    MatIcon,
    MatButtonModule,
    MatProgressSpinnerModule,
    UserMenuComponent,
  ],
  exports: [
    TextInputComponent,
    PrimaryButtonComponent,
    ComboboxComponent,
    CheckboxComponent,
    ChipsInputComponent,
    TableComponent,
    HeaderComponent,
    ValidationComponent,
    SignaturePadComponent,
    SpinnerComponent,
    LegalComponent,
    PrivacyComponent,
  ],
})
export class SharedModule {}
