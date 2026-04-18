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
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
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
import { UsageProgressComponent } from './components/usage-progress/usage-progress.component';
import { LimitReachedDialogComponent } from './components/dialogs/limit-reached-dialog/limit-reached-dialog.component';
import { TextAreaComponent } from './components/inputs/text-area/text-area.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpandableTableSearchComponent } from './components/base/expandable-table-search/expandable-table-search.componen';
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ɵɵCdkFixedSizeVirtualScroll } from "@angular/cdk/overlay";
import { DatePickerComponent } from './components/inputs/date-input/date-picker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OneTimeCodeDialogComponent } from './components/dialogs/one-time-code-dialog/one-time-code-dialog.component';
import { StatsOverviewCardsComponent } from './components/graph/stats-overview-cards/stats-overview-cards.component';
import { TrendChartCardComponent } from './components/graph/trend-chart-card/trend-chart-card.component';
import { AdvancedDateRangePickerComponent } from './components/advanced-date-range-picker/advanced-date-range-picker.component';
import { MatNativeDateModule } from '@angular/material/core';
import { BaseChartDirective } from 'ng2-charts';
import { SwitchComponent } from './components/inputs/switch/switch.component';
import { RouterModule } from '@angular/router';

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
    SegmentsComponent,
    UsageProgressComponent,
    LimitReachedDialogComponent,
    TextAreaComponent,
    ExpandableTableSearchComponent,
    DatePickerComponent,
    OneTimeCodeDialogComponent,
    StatsOverviewCardsComponent,
    TrendChartCardComponent,
    AdvancedDateRangePickerComponent,
    SwitchComponent,
    UserMenuComponent
  ],
  imports: [
    CommonModule,
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
    AuthLoadingOverlayComponent,
    MatCard,
    MatCardActions,
    MatExpansionModule,
    MatDialogActions,
    MatDialogContent,
    DragDropModule,
    MatRadioModule,
    AsyncPipe,
    QRCodeComponent,
    MatTooltipModule,
    CdkVirtualScrollViewport,
    ɵɵCdkFixedSizeVirtualScroll,
    MatDatepickerModule,
    MatNativeDateModule,
    BaseChartDirective,
    RouterModule
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
    SegmentsComponent,
    UsageProgressComponent,
    TextAreaComponent,
    ExpandableTableSearchComponent,
    DatePickerComponent,
    StatsOverviewCardsComponent,
    TrendChartCardComponent,
    AdvancedDateRangePickerComponent,
    SwitchComponent,
    UserMenuComponent
  ],
})
export class SharedModule {}
