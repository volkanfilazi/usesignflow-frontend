import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormGeneratorComponent } from './components/form-generator/form-generator.component';
import { TodoComponent } from './components/TODO/todo.component';
import { ResumeComponent } from './components/resume/resume.component';
import { GenericFormListComponent } from './components/generic-form/generic-form-list.component';
import { GenericFormDetailComponent } from './components/generic-form-detail/generic-form-detail.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RegisterPageComponent } from './components/auth/register/register-page.component';
import { LoginPageComponent } from './components/auth/login/login-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'dashboard', component: ResumeComponent },
  { path: 'formgenerator', component: FormGeneratorComponent },
  { path: 'genericformlist', component: GenericFormListComponent },
  { path: 'genericformlistdetail/:id', component: GenericFormDetailComponent },
  { path: 'todo', component: TodoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}