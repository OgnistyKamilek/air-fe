import { Component } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { ApiMapComponent } from '../api-map/api-map.component';
import {AuthComponent} from '../auth/auth.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, ApiMapComponent, AuthComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
