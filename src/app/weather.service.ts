import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',

})
export class WeatherService {
  private apiUrl = 'https://api.waqi.info/feed/beijing/?token=ca09e110edc3446687444ae2b99bd6f278c12815';

  constructor(private http: HttpClient) {}

  getAQI(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
