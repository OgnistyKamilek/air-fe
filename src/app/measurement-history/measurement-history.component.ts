import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChartConfiguration, ChartOptions } from 'chart.js';

interface HourlyRecord {
  date: string;
  hour: string;
  pm10: number;
  pm2_5: number;
  co: number;
  no2: number;
}

interface DailyAggregate {
  date: string;
  pm10: number;
  pm2_5: number;
  co: number;
  no2: number;
}

@Component({
  selector: 'app-measurement-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BaseChartDirective
  ],
  templateUrl: './measurement-history.component.html',
  styleUrls: ['./measurement-history.component.css']
})

export class MeasurementHistoryComponent {
  maxDate: string;
  minDate: string;
  isLoading = false;
  private dailyAirQuality: DailyAggregate[] = [];

  pollutantDefinitions = [
    { key: 'pm10',  label: 'PM10 (µg/m³)' },
    { key: 'pm2_5', label: 'PM2.5 (µg/m³)' },
    { key: 'co',    label: 'Carbon Monoxide (µg/m³)' },
    { key: 'no2',   label: 'Nitrogen Dioxide (µg/m³)' }
  ];

  pollutantChartDataList: Array<{
    key: string;
    label: string;
    chartData: ChartConfiguration<'line'>['data'];
    chartOptions: ChartOptions<'line'>;
  }> = [];

  constructor(private http: HttpClient) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.minDate = '2013-01-01';
  }

  async onSubmit(formValues: {
    city: string;
    'start-date': string;
    'end-date': string;
  }) {
    if (!formValues.city) {
      alert('Please select a city.');
      return;
    }

    const [lat, lon] = formValues.city.split(',').map(s => s.trim());
    const startDate = formValues['start-date'];
    const endDate   = formValues['end-date'];

    if (startDate > endDate) {
      alert('Start date cannot be later than end date.');
      return;
    }

    this.isLoading = true;
    this.pollutantChartDataList = [];
    this.dailyAirQuality = [];

    try {
      const rawHourly = await this.getAirQualityData(lat, lon, startDate, endDate);
      const daily = this.groupDailyAirQuality(rawHourly);
      this.dailyAirQuality = daily;

      if (daily.length === 0) {
        alert('No air quality data available for the selected range.');
        return;
      }

      this.pollutantChartDataList = this.pollutantDefinitions.map(pd => {
        const labels = daily.map(d => d.date);
        const values = daily.map(d => (d as any)[pd.key] as number);

        const chartData: ChartConfiguration<'line'>['data'] = {
          labels,
          datasets: [
            {
              label: pd.label,
              data: values,
              tension: 0.3,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }
          ]
        };

        const chartOptions: ChartOptions<'line'> = {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: pd.label
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              type: 'linear',
              display: true
            },
            x: {
              display: true,
              title: { display: true, text: 'Date' }
            }
          }
        };

        return {
          key: pd.key,
          label: pd.label,
          chartData,
          chartOptions
        };
      });
    } catch (err) {
      console.error('Error fetching air quality:', err);
      alert('An error occurred while fetching data. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  private async getAirQualityData(
    latitude: string,
    longitude: string,
    startDate: string,
    endDate: string
  ): Promise<HourlyRecord[]> {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
      `&start_date=${startDate}&end_date=${endDate}` +
      `&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide` +
      `&timezone=Europe%2FWarsaw`;

    const res: any = await this.http.get(url).toPromise();
    if (!res || !res.hourly) {
      return [];
    }

    const times: string[]      = res.hourly.time;
    const pm10Arr: number[]    = res.hourly.pm10;
    const pm2_5Arr: number[]   = res.hourly.pm2_5;
    const coArr: number[]      = res.hourly.carbon_monoxide;
    const no2Arr: number[]     = res.hourly.nitrogen_dioxide;

    const output: HourlyRecord[] = [];
    for (let i = 0; i < times.length; i++) {
      const [datePart, hourPart] = times[i].split('T');
      output.push({
        date: datePart,
        hour: hourPart,
        pm10:    pm10Arr[i]    ?? 0,
        pm2_5:   pm2_5Arr[i]   ?? 0,
        co:      coArr[i]      ?? 0,
        no2:     no2Arr[i]     ?? 0
      });
    }
    return output;
  }

  private groupDailyAirQuality(
    data: HourlyRecord[]
  ): DailyAggregate[] {
    const grouped: Record<string, {
      pm10: number[];
      pm2_5: number[];
      co: number[];
      no2: number[];
    }> = {};

    data.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = { pm10: [], pm2_5: [], co: [], no2: [] };
      }
      if (item.pm10 != null) grouped[item.date].pm10.push(item.pm10);
      if (item.pm2_5 != null) grouped[item.date].pm2_5.push(item.pm2_5);
      if (item.co != null) grouped[item.date].co.push(item.co);
      if (item.no2 != null) grouped[item.date].no2.push(item.no2);
    });

    const result: DailyAggregate[] = [];
    const dates = Object.keys(grouped).sort();
    const average = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    dates.forEach(dateKey => {
      const day = grouped[dateKey];
      result.push({
        date:   dateKey,
        pm10:   average(day.pm10),
        pm2_5:  average(day.pm2_5),
        co:     average(day.co),
        no2:    average(day.no2)
      });
    });

    return result;
  }
}
