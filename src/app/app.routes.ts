import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MeasurementHistoryComponent } from './measurement-history/measurement-history.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'history',
    component: MeasurementHistoryComponent
  }
];
