import { BaseEntity } from './common';

export interface AnalyticsReport extends BaseEntity {
  reportType: 'livestock' | 'medication' | 'feeding' | 'breeding' | 'tasks' | 'staff' | 'marketplace';
  title: string;
  dateRange: DateRange;
  data: AnalyticsData;
  generatedBy: string;
  format: 'pdf' | 'csv' | 'excel';
  fileUrl?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface AnalyticsData {
  metrics: Metric[];
  charts: Chart[];
  summaries: Summary[];
}

export interface Metric {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  unit?: string;
}

export interface Chart {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: ChartDataPoint[];
  labels: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface Summary {
  title: string;
  content: string;
  insights: string[];
}
