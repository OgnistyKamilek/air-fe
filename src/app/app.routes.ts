import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MeasurementHistoryComponent } from './measurement-history/measurement-history.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'history',
    component: MeasurementHistoryComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  }

];
