import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient]
})
export class WeatherService {
  private httpClient = inject(HttpClient)

  constructor() { }

  getStations() {
    return this.httpClient.get('https://api.gios.gov.pl/pjp-api/v1/rest/metadata/stations').pipe(tap(value => console.log(value)));
  }
}
