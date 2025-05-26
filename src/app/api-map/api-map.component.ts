import { Component, OnInit } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { WeatherService } from '../weather.service';
import { Observable } from 'rxjs';
import {inject, Injectable} from '@angular/core';
import { AsyncPipe } from '@angular/common'
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-api-map',
  templateUrl: './api-map.component.html',
  styleUrl: './api-map.component.css',
  standalone: true,
  imports: [AsyncPipe, CommonModule]
})

export class ApiMapComponent implements OnInit {
  aqi: number | null = null;
  private map: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getAQI().subscribe(data => {
      this.aqi = data.data.aqi;
    });

    this.map = L.map('map', {
      center: [52.237, 17.0],
      zoom: 7,
      zoomControl: false
    });

    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(this.map);

    L.tileLayer('https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=ca09e110edc3446687444ae2b99bd6f278c12815', {
      attribution: '&copy; <a href="https://aquicn.org"> AQICN.org</a>',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=ca09e110edc3446687444ae2b99bd6f278c12815`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          this.aqi = data.data.aqi;
          const city = data.data.city?.name ?? 'Unknown city';
          const iaqi = data.data.iaqi;
          const pm25 = iaqi?.pm25?.v ?? 'No data';
          const pm10 = iaqi?.pm10?.v ?? 'No data';
          const o3 = iaqi?.o3?.v ?? 'No data';
          if (typeof pm25 === 'number') {
            (document.getElementById('pm25') as HTMLElement).innerText =`PM2,5: ${pm25}` ;
          }
          document.getElementById('city-name')!.innerText = `Station: ${city}`;
          // (document.getElementById('pm25') as HTMLElement).innerText = `PM2.5: ${pm25}`;
          (document.getElementById('pm10') as HTMLElement).innerText = `PM10: ${pm10}`;
          (document.getElementById('ozone') as HTMLElement).innerText = `Ozon (O₃): ${o3}`;
          console.log('Clicked AQI:', this.aqi);
          L.popup()
          .setLatLng(e.latlng)
          .setContent(`AQI: ${pm25}<br>${data.data.city.name}`)
          .openOn(this.map);
        }
      })
        .catch(err => console.error('Błąd pobierania danych AQI:', err));;
    });

  }
}

export class AppModule { }

