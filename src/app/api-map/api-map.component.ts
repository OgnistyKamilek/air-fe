import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common'
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

let date = new Date().toISOString()
let today = date.split('T')[0];

@Component({
  selector: 'app-api-map',
  templateUrl: './api-map.component.html',
  styleUrl: './api-map.component.css',
  standalone: true,
  imports: [AsyncPipe, CommonModule]
})

export class ApiMapComponent implements OnInit {
  aqi: number | null = null;
  private chartInstance: Chart | null = null;
  private map: any;

  ngOnInit(): void {

    this.map = L.map('map', {
      center: [52.2, 17.0],
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
          const forecast = data.data.forecast.daily.pm25

          const legend = document.querySelector('.legend') as HTMLElement;
          const legendExit = document.querySelector('.legend-quit') as HTMLElement;
          const legendElement = document.querySelector('.legend-header') as HTMLElement;
          const aqiStatus = document.querySelector('.description') as HTMLElement | null;
          const qualityStatus = [
            'Air quality is satisfactory. Enjoy the day.',
            'Air quality is acceptable. Enjoy the day.',
            'Unhealthy for sensitive groups. Be careful.',
            'Unhealthy for most people. Limit going outside.',
            'Very unhealthy. Go outside only if necessary.',
            'Extremely dangerous. Do not go outside.'
          ];

          legend.style.left = '7%';
          legendExit.addEventListener('click', () => {
            legend.style.left = '-27%';
          });

          if (aqiStatus && typeof this.aqi === 'number') {
            let rotate = 0;
            let grayscale = 0;
            let brightness = 1.1;
            let saturate = 1.6;
            let status = 0;
            if (this.aqi <= 50) {
              rotate = 290;
              status = 0;
            }
            else if (this.aqi > 50 && this.aqi <= 100) {
              rotate = 240;
              status = 1;
            }
            else if (this.aqi > 100 && this.aqi <= 150) {
              rotate = 170;
              saturate = 2;
              status = 2;
            }

            else if (this.aqi > 150 && this.aqi <= 200) {
              rotate = 140;
              saturate = 1.5;
              status = 3;
            }
            else if (this.aqi > 200 && this.aqi <= 300) {
              rotate = 70;
              saturate = 1;
              status = 4;
            }
            else if (this.aqi > 300) {
              rotate = 120;
              grayscale = 0.95;
              saturate = 3;
              brightness = 0.95;
              status = 5;
            }


            legendElement.style.filter = `hue-rotate(${rotate}deg) grayscale(${grayscale}) saturate(${saturate}) brightness(${brightness})`;
            aqiStatus.innerText = qualityStatus[status];
          }

          if (city.length <= 25) {
            document.getElementById('city-name')!.innerText = `${city}`;
          }
          else if (city.length > 25) {
            const cutCity = city.slice(0, 25) + "...";
            document.getElementById('city-name')!.innerText = `${cutCity}`;
          }


          // (document.getElementById('pm25') as HTMLElement).innerText = `PM2.5: ${pm25}`;
          (document.getElementById('pm10') as HTMLElement).innerText = `PM10: ${pm10}`;
          (document.getElementById('ozone') as HTMLElement).innerText = `Ozon (O₃): ${o3}`;
          (document.getElementById('forecast') as HTMLElement).innerText = `Forecast: ${o3}`;

          if (typeof pm25 === 'number') {
            // (document.getElementById('pm25') as HTMLElement).innerText =`PM2,5: ${forecast}`;
          }
          else if (typeof pm25 === 'string') {
            (document.getElementById('pm25') as HTMLElement).innerText =`PM2,5: Station does not provide this data`;
          }

          if (Array.isArray(forecast)) {
            const futureForecast = forecast.filter(item => item.day >= today);
            const days = futureForecast.map(item => item.day); // np. ["2025-05-29", "2025-05-30", ...]
            const values = futureForecast.map(item => item.avg); // np. [36, 42, 28, ...]
            // const forecastText = forecast.map(item => `📅 ${item.day}: ${item.avg} µg/m³`).join('\n');
            // (document.getElementById('pm25') as HTMLElement).innerText = `PM2.5 Forecast:\n${forecastText}`;
            const chartData = {
              labels: days,
              datasets: [{
                label: 'PM2.5 Forecast',
                data: values,
                backgroundColor: 'rgba(70, 180, 100, 0.4)',
                borderColor: 'white',
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0,
              }]
            };

            if (this.chartInstance) {
              this.chartInstance.destroy();
            }

            const ctx = (document.getElementById('chart') as HTMLCanvasElement).getContext('2d');

            this.chartInstance = new Chart(ctx!, {
                type: 'bar',
                data: chartData,
                options: {
                  scales: {
                    y: {
                      beginAtZero: true
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        autoSkip: false
                      }
                    }
                  },
                }
              });
          }

          console.log('Clicked AQI:', this.aqi);
          L.popup()
          .setLatLng(e.latlng)
          .setContent(`AQI: ${this.aqi}<br>${data.data.city.name}`)
          .openOn(this.map);
        }
      })
        .catch(err => console.error('Błąd pobierania danych AQI:', err));;
    });

  }
}

export class AppModule { }

