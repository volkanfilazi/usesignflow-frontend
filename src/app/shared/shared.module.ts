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
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { AuthLoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { AgreementListComponent } from './components/agreement/agreement-list/agreement-list.component';
import { MatCard, MatCardActions } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogActions, MatDialogContent } from "@angular/material/dialog";
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { DynamicFormRendererComponent } from './components/dynamicFormRenderer/dynamic-form-renderer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatRadioModule } from '@angular/material/radio';
import { AsyncPipe } from '@angular/common';
import { FormPreviewDialogComponent } from './components/dialogs/form-preview-dialog/form-preview-dialog.component';
import { ChangePasswordDialogComponent } from './components/dialogs/change-password-dialog/change-password-dialog.component';
import { VerificationCodeInputComponent } from './components/inputs/verification-code-input/verification-code-input.component';
import { TwoFAVerifyDialogComponent } from './components/dialogs/twoFA-verify-dialog/twoFA-verify-dialog.component';
import { TwoFADisableControlDialogComponent } from './components/dialogs/twoFA-disable-control-dialog/twoFA-disable-control-dialog.component';
import { TwoFAEnableControlDialogComponent } from './components/dialogs/twoFA-enable-control-dialog/twoFAEnableControlDialog.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { DeleteDialogComponent } from './components/dialogs/delete-dialog/delete-dialog.component';
import { PasswordDialogCOmponent } from './components/dialogs/password-dialog/password-dialog.component';
import { SegmentsComponent } from './components/segments/segments.component';

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
    EmptyStateComponent,
    AgreementListComponent,
    IconButtonComponent,
    ConfirmDialogComponent,
    DynamicFormRendererComponent,
    FormPreviewDialogComponent,
    ChangePasswordDialogComponent,
    VerificationCodeInputComponent,
    TwoFAVerifyDialogComponent,
    TwoFADisableControlDialogComponent,
    TwoFAEnableControlDialogComponent,
    DeleteDialogComponent,
    PasswordDialogCOmponent,
    SegmentsComponent
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
    AuthLoadingOverlayComponent,
    MatCard,
    MatCardActions,
    MatExpansionModule,
    MatDialogActions,
    MatDialogContent,
    DragDropModule,
    MatRadioModule,
    AsyncPipe,
    QRCodeComponent
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
    EmptyStateComponent,
    IconButtonComponent,
    DynamicFormRendererComponent,
    SegmentsComponent
  ],
})
export class SharedModule {}
