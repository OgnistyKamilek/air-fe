import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {WeatherService} from './weather.service';
import {AsyncPipe} from '@angular/common';
import {Observable} from 'rxjs';
import {HeaderComponent} from './header/header.component';
import {SearchbarComponent} from './searchbar/searchbar.component';
import {ApiMapComponent} from './api-map/api-map.component';
import {FooterComponent} from './footer/footer.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe, HeaderComponent, SearchbarComponent, ApiMapComponent, FooterComponent, TermsOfServiceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  // title = 'air-fe';
  // private weatherService = inject(WeatherService);
  // stations$: Observable<any> = this.weatherService.getStations()
}
