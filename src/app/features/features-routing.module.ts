import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginPageComponent } from './components/auth/login/login-page.component';
import { RegisterPageComponent } from './components/auth/register/register-page.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { VerificationProcessComponent } from './components/auth/verification-process/verification-process.component';
import { GenericFormListComponent } from './components/generic-form/generic-form-list.component';
import { GenericFormDetailComponent } from './components/generic-form-detail/generic-form-detail.component';
import { FormGeneratorComponent } from './components/form-generator/form-generator.component';
import { guestGuard } from '../core/auth/guest.guard';
import { authGuard } from '../core/auth/auth.guard';
import { DashboardLayoutComponent } from './components/dashboard/dashboard-layout.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { SubmissionAccessComponent } from './components/auth/submission-access/submission-access.componen';
import { SubmissionCompletedComponent } from './components/submission-completed/submission-completed.component';
import { PricingPageComponent } from './components/pricing-page/pricing-page.component';
import { GoogleCallbackComponent } from './components/googleCallback/google-callback.component';
import { BillingComponent } from './components/billing/billing.component';
import { billingFlowGuard } from './guard/billing-guard';
import { FormGeneratorEntryComponent } from './components/gates/form-generator-entry/form-generator-entry.component';
import { EmailComponent } from './components/emails/emails.component';
import { CookiePolicyComponent } from './components/cookie-policy/cookie-policy.component';
import { LegalComponent } from '../shared/components/legal/legal.component';
import { PrivacyComponent } from '../shared/components/privacy/privacy.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { pendingChangesGuard } from './guard/pending-changes-guard';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'auth/google/callback',
    component: GoogleCallbackComponent,
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'pricing',
    component: PricingPageComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent,
  },
  {
    path: 'terms',
    component: LegalComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyComponent,
  },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'verification-process', component: VerificationProcessComponent },

  { path: 'submission-access', component: SubmissionAccessComponent },
  { path: 'submission-access/:submissionId/completed', component: SubmissionCompletedComponent },
  { path: 'submission-access/:submissionId/:mode', component: GenericFormDetailComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' },
      { path: 'forms', component: GenericFormListComponent },
      { path: 'emails', component: EmailComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'submissions', component: SubmissionsComponent },
      {
        path: 'submissions/:submissionId',
        redirectTo: 'submissions/:submissionId/view',
        pathMatch: 'full',
      },
      {
        path: 'submissions/:submissionId/:mode',
        component: GenericFormDetailComponent,
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'forms/:formId/:mode',
        component: GenericFormDetailComponent,
        canDeactivate: [pendingChangesGuard],
      },
      { path: 'forms/form/preview', component: GenericFormDetailComponent },
      {
        path: 'form-generator-entry',
        component: FormGeneratorEntryComponent,
      },
      {
        path: 'form-generator/:formId/:mode',
        canDeactivate: [pendingChangesGuard],
        component: FormGeneratorComponent,
      },
      {
        path: 'form-generator/:mode',
        component: FormGeneratorComponent,
        canDeactivate: [pendingChangesGuard],
        canActivate: [billingFlowGuard],
      },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'settings', component: SettingsPageComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
