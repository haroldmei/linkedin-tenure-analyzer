export type DateString = string;
export type Confidence = 'high' | 'medium' | 'low';
export type Theme = 'light' | 'dark' | 'auto';

export interface RawEmployee {
  name?: string;
  title: string;
  startDate: DateString;
  endDate?: DateString;
  profileUrl: string;
  location?: string;
  isPast: boolean;
}

export interface ProcessedEmployee extends RawEmployee {
  tenureMonths: number;
  tenureYears: number;
  confidence: Confidence;
}

export interface TenureStatistics {
  count: number;
  currentCount: number;
  pastCount: number;
  mean: number;
  median: number;
  p25: number;
  p75: number;
  p90: number;
  min: number;
  max: number;
  histogram: {
    '0-6m': number;
    '6-12m': number;
    '1-2y': number;
    '2-3y': number;
    '3-5y': number;
    '5-10y': number;
    '10y+': number;
  };
  dataQuality: {
    missingStartDate: number;
    missingEndDate: number;
    ambiguousDates: number;
  };
}

export interface AnalysisResult {
  companyId: string;
  companyName: string;
  timestamp: number;
  processed: ProcessedEmployee[];
  stats: TenureStatistics;
}

export interface StorageSchema {
  lastAnalysis?: AnalysisResult;
  settings: {
    maxEmployees: number;
    enablePastEmployees: boolean;
    theme: Theme;
  };
  cache: {
    [companyId: string]: {
      timestamp: number;
      data: ProcessedEmployee[];
      expiresAt: number;
    };
  };
}

export interface AnalysisRequest {
  type: 'ANALYZE_COMPANY';
  data: RawEmployee[];
  companyId: string;
  companyName: string;
}

export interface AnalysisResponse {
  success: boolean;
  stats?: TenureStatistics;
  error?: string;
}

export interface SelectorSet {
  primary: string;
  fallback: string[];
}

export interface Selectors {
  employeeCard: SelectorSet;
  name: SelectorSet;
  title: SelectorSet;
  tenure: SelectorSet;
}

