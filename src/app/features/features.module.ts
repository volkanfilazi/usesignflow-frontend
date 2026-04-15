import { NgModule } from '@angular/core';
import { FormGeneratorComponent } from './components/form-generator/form-generator.component';
import { CommonModule } from '@angular/common';
import { FeaturesRoutingModule } from './features-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TodoComponent } from './components/TODO/todo.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgOptimizedImage } from '@angular/common';
import { ResumeComponent } from './components/resume/resume.component';
import { TimelineComponent } from '../shared/components/timeline/timeline.component';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { GenericFormListComponent } from './components/generic-form/generic-form-list.component';
import { GenericFormDetailComponent } from './components/generic-form-detail/generic-form-detail.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RegisterPageComponent } from './components/auth/register/register-page.component';
import { LoginPageComponent } from './components/auth/login/login-page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthLoadingOverlayComponent } from '../shared/components/loading-overlay/loading-overlay.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe } from '@angular/common';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { BillingComponent } from './components/billing/billing.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmailComponent } from './components/emails/emails.component';
import { LandingFooterComponent } from "../shared/components/landing-footer/landing-footer.component";
import { RichTextEditorComponent } from '../shared/components/reach-text-editor/rich-text-editor.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { PricingPageComponent } from './components/pricing-page/pricing-page.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { BrandingPdfComponent } from './components/branding-pdf/branding-pdf.component';
import { SubmissionsComponent } from './components/submission/submissions/submissions.component';
import { SubmissionSettingsComponent } from './components/submission/submission-settings/submission-settings.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    FormGeneratorComponent,
    ResumeComponent,
    GenericFormListComponent,
    GenericFormDetailComponent,
    LandingPageComponent,
    RegisterPageComponent,
    LoginPageComponent,
    SubmissionsComponent,
    SettingsPageComponent,
    BillingComponent,
    EmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    PricingPageComponent,
    VerifyEmailComponent,
    BrandingPdfComponent,
    SubmissionSettingsComponent
  ],

  imports: [
    ReactiveFormsModule,
    FeaturesRoutingModule,
    SharedModule,
    TodoComponent,
    DragDropModule,
    MatIcon,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    NgOptimizedImage,
    TimelineComponent,
    MatButtonModule,
    MatCardModule,
    SharedModule,
    MatCardHeader,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatTabsModule,
    MatSnackBarModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    AuthLoadingOverlayComponent,
    MatDialogModule,
    AsyncPipe,
    MatTooltipModule,
    LandingFooterComponent,
    RichTextEditorComponent,
    MatSlideToggleModule
],
})
export class FeaturesModule {}
