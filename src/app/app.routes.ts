import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule) },
  { path: '', redirectTo: 'features', pathMatch: 'full' }
];

export default routes;
