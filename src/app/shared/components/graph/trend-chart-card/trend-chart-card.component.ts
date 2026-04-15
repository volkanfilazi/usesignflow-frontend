import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-trend-chart-card',
  standalone: false,
  templateUrl: './trend-chart-card.component.html',
  styleUrls: ['./trend-chart-card.component.scss']
})
export class TrendChartCardComponent implements OnChanges {
  @Input() data: any;

  public chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },

    elements: {
      line: {
        tension: 0.35,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    },

    scales: {
      x: {
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#6b7280',
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: '#6b7280',
        },
        border: {
          display: false,
        },
      },
    },
  };

  ngOnChanges(): void {
    if (!this.data) return;

    const labels =
      this.data.series?.[0]?.points?.map((p: any) => p.label) ?? [];

    this.chartData = {
      labels,
      datasets: this.data.series.map((series: any, index: number) => ({
        label: series.name,
        data: series.points.map((p: any) => p.value),

        borderColor: index === 0 ? '#6D4AFF' : '#F472B6',
        backgroundColor:
          index === 0
            ? 'rgba(109, 74, 255, 0.08)'
            : 'rgba(244, 114, 182, 0.08)',

        fill: true,
      })),
    };
  }
}