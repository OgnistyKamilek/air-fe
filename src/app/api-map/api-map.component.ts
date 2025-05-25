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

    // delete (L.Icon.Default.prototype as any)._getIconUrl;
    // L.Icon.Default.mergeOptions({
    //   iconRetinaUrl: 'assets/marker-icon-2x.png',
    //   iconUrl: 'assets/marker-icon.png',
    //   shadowUrl: 'assets/marker-shadow.png'
    // });


    this.map = L.map('map', {
      center: [52.237, 17.0],
      zoom: 7,
      zoomControl: false
    });

    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 5,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(this.map);
  }
}

export class AppModule { }

