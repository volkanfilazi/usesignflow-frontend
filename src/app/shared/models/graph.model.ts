export interface StatsOverviewCard {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'default' | 'success' | 'warning' | 'info';
}

export interface TrendSeriesPoint {
  label: string;
  value: number;
}

export interface TrendSeries {
  name: string;
  points: TrendSeriesPoint[];
}

export interface TrendChartData {
  title: string;
  subtitle?: string;
  series: TrendSeries[];
}