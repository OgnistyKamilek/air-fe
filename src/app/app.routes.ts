import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MeasurementHistoryComponent } from './measurement-history/measurement-history.component';
import {TermsOfServiceComponent} from './terms-of-service/terms-of-service.component';
import {PrivacyPolicyComponent} from './privacy-policy/privacy-policy.component';

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
    path: 'terms-of-service',
    component: TermsOfServiceComponent

  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent

  }
];
