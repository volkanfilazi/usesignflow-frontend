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
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [guestGuard],
  },

  // public
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'verification-process', component: VerificationProcessComponent },

  // protected shell
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' },
      { path: 'forms', component: GenericFormListComponent },
      { path: 'forms/:id', component: GenericFormDetailComponent },
      { path: 'form-generator', component: FormGeneratorComponent },
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
