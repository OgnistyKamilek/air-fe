import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {WeatherService} from './weather.service';
import {AsyncPipe} from '@angular/common';
import {Observable} from 'rxjs';
import {HeaderComponent} from './header/header.component';
import {SearchbarComponent} from './searchbar/searchbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, HeaderComponent, SearchbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'air-fe';
  private weatherService = inject(WeatherService);
  stations$: Observable<any> = this.weatherService.getStations()


}
