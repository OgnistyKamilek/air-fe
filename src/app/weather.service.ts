import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap, map} from 'rxjs';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient]
})


export class WeatherService {
  private httpClient = inject(HttpClient)

  constructor() { }

  getStations() {
    return this.httpClient.get('/pjp-api/v1/rest/station/findAll').pipe(tap(value => console.log(value)));
  }

  getArchives() {
    return this.httpClient.get("/pjp-api/v1/rest/archivalData/getDataForAllStations").pipe(
      tap(res => console.log("surowa odpowiedź: ", res)),
      map((res: any) => res["lista stacji pomiarowych"] || []));
  }
}

