import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common'
import * as L from 'leaflet';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

const date = new Date().toISOString()
const today = date.split('T')[0];

@Component({
  selector: 'app-api-map',
  templateUrl: './api-map.component.html',
  styleUrl: './api-map.component.css',
  standalone: true,
  imports: [CommonModule]
})

export class ApiMapComponent implements OnInit {
  aqi: number | null = null;
  private chartInstance: Chart | null = null;
  private map: any;

  ngOnInit(): void {
    this.initializeMap();
    this.addTileLayers();
    this.registerMapClickHandler();
  }

  private initializeMap(): void {
    this.map = L.map('map', {
      center: [52.2, 17.0],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: false
    });
    L.control.zoom({position: 'topright'}).addTo(this.map);
  }


  private addTileLayers(): void {
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
  }

  private registerMapClickHandler(): void {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const {lat, lng} = e.latlng;
      this.fetchAQIData(lat, lng, e.latlng);
    });
  }

  private fetchAQIData(lat: number, lng: number, latlng: L.LatLng): void {
    fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=ca09e110edc3446687444ae2b99bd6f278c12815`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          this.handleAQIResponse(data, latlng);
        }
      })
      .catch(err => console.error('Error downloading AQI:', err));
  }

  private handleAQIResponse(data: any, latlng: L.LatLng): void {
    this.aqi = data.data.aqi;
    const city = data.data.city?.name ?? 'Unknown city';
    const iaqi = data.data.iaqi;
    const weather = {
      temp: iaqi?.t?.v ?? null,
      humidity: iaqi?.h?.v ?? null,
      pressure: iaqi?.p?.v ?? null,
      wind: iaqi?.w?.v ?? null
    };
    const forecast = data.data.forecast.daily.pm25;

    this.updateLegend(city, iaqi, forecast, weather);
    this.updateChart(forecast);
  }

  private updateLegend(city: string, iaqi: any, forecast: any, weather: any): void {
    const pm25 = iaqi?.pm25?.v ?? 'No data';
    const pm10 = iaqi?.pm10?.v ?? 'No data';
    const o3 = iaqi?.o3?.v ?? 'No data';


    const legend = document.querySelector('.legend') as HTMLElement;
    const legendExit = document.querySelector('.legend-quit') as HTMLElement;
    const legendElement = document.querySelector('.legend-header') as HTMLElement;
    const aqiStatus = document.querySelector('.description') as HTMLElement | null;

    legend.style.left = '1%';
    legendExit.onclick = () => legend.style.left = '-30%';

    const qualityStatus = [
      'Air quality is satisfactory. Enjoy the day.',
      'Air quality is acceptable. Enjoy the day.',
      'Unhealthy for sensitive groups. Be careful.',
      'Unhealthy for most people. Limit going outside.',
      'Very unhealthy. Go outside only if necessary.',
      'Extremely dangerous. Do not go outside.'
    ];

    if (legendElement && typeof this.aqi === 'number') {
      let backgroundColor = '';
      let status = 0;

      if (this.aqi <= 30) {
        backgroundColor = '#09c353';
        status = 0;
      } else if (this.aqi <= 50) {
        backgroundColor = '#95c309';
        status = 1;
      } else if (this.aqi <= 80) {
        backgroundColor = '#c3aa09';
        status = 2;
      } else if (this.aqi <= 110) {
        backgroundColor = '#ffa707';
        status = 3;
      } else if (this.aqi <= 150) {
        backgroundColor = '#bd4500';
        status = 4;
      } else {
        backgroundColor = '#c30909';
        status = 5;
      }

      legendElement.style.backgroundColor = backgroundColor;
      if (aqiStatus) aqiStatus.innerText = qualityStatus[status];
    }

    if (city.length <= 25) {
      document.getElementById('city-name')!.innerText = `${city}`;
    } else if (city.length > 25) {
      const cutCity = city.slice(0, 25) + "...";
      document.getElementById('city-name')!.innerText = `${cutCity}`;
    }

    const labelPM25 = document.getElementById('pm25-value');
    const labelPM10 = document.getElementById('pm10-value');
    const labelO3 = document.getElementById('ozone-value');
    if (labelPM25) labelPM25.innerText = `${pm25} µg/m³`;
    if (labelPM10) labelPM10.innerText = `${pm10} µg/m³`;
    if (labelO3) labelO3.innerText = `${o3} µg/m³`;

    this.updateRing('pm25', pm25, 75);
    this.updateRing('pm10', pm10, 100);
    this.updateRing('ozone', o3, 200);

    if (weather.temp !== null) {
      this.updateWeatherRing('temp', weather.temp, 40, '°C');
    }
    if (weather.humidity !== null) {
      this.updateWeatherRing('humidity', weather.humidity, 100, '%');
    }
    if (weather.pressure !== null) {
      this.updateWeatherRing('pressure', weather.pressure, 1100, 'hPa');
    }
    if (weather.wind !== null) {
      this.updateWeatherRing('wind', weather.wind, 30, 'm/s');
    }
  }

  private updateWeatherRing(id: string, value: number, max: number, unit: string): void {
    const ring = document.getElementById(`${id}-ring`);
    const label = document.getElementById(`${id}-value`);
    if (!ring || !label) return;

    // NIE używamy conic-gradient – tylko szare tło
    (ring as HTMLElement).style.background = `#3ea7ec`; // lub inny neutralny kolor

    label.innerText = `${value} ${unit}`;
  }

  private updateRing(id: string, value: number, max: number): void {
    const ring = document.getElementById(`${id}-ring`);
    const label = document.getElementById(`${id}-value`);
    if (!ring || !label) return;

    const percent = Math.min(Math.max(value / max, 0), 1);
    const degrees = percent * 360;

    const color = this.getColorFromPercent(percent);

    (ring as HTMLElement).style.background = `conic-gradient(${color} ${degrees}deg, lightgray 0deg)`;

    label.innerText = `${value} µg/m³`;
  }

  private getColorFromPercent(percent: number): string {
    if (percent <= 0.2) return '#2ecc71';
    if (percent <= 0.4) return '#f1c40f';
    if (percent <= 0.6) return '#e67e22';
    if (percent <= 0.8) return '#e74c3c';
    return '#c0392b';
  }

  private updateChart(forecast: any[]): void {
    const today = new Date().toISOString().split('T')[0];
    const futureForecast = forecast.filter(item => item.day >= today);
    const days = futureForecast.map(item => item.day);
    const values = futureForecast.map(item => item.avg);

    const chartData = {
      labels: days,
      datasets: [{
        label: 'PM2.5 Forecast',
        data: values,
        backgroundColor: 'rgb(32,152,92)',
        borderColor: '#393939',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.8
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
        plugins: {
          legend: {display: false},
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }


  //OPCJONALNY POP-UP
  // private showPopup(latlng: L.LatLng, aqi: number, city: string): void {
  // L.popup()
  //   .setLatLng(latlng)
  //   .setContent(`AQI: ${aqi}<br>${city}`)
  //   .openOn(this.map);
  // }
}



