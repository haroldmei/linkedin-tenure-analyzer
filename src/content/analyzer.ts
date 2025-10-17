import type { RawEmployee, AnalysisRequest, AnalysisResponse } from '@/types';
import { EmployeeExtractor } from './employee-extractor';
import { PaginationHandler } from './pagination-handler';
import { UIManager } from './ui-manager';
import { RateLimiter } from '@/utils/rate-limiter';
import { StorageManager } from '@/utils/storage-manager';

class CompanyAnalyzer {
  private extractor: EmployeeExtractor;
  private pagination: PaginationHandler;
  private ui: UIManager;
  private rateLimiter: RateLimiter;

  constructor() {
    this.extractor = new EmployeeExtractor();
    this.pagination = new PaginationHandler();
    this.ui = new UIManager();
    this.rateLimiter = new RateLimiter();
  }

  async analyze(): Promise<void> {
    try {
      console.log('[Analyzer] Starting analysis on page:', window.location.pathname);
      const settings = await StorageManager.getSettings();
      this.ui.showProgress(0, settings.maxEmployees);

      const employees: RawEmployee[] = [];

      console.log('[Analyzer] Expanding People section to load sufficient cards...');
      const expandedCount = await this.pagination.expandPeopleSectionToMinimum(settings.maxEmployees);
      console.log('[Analyzer] People section expanded:', expandedCount, 'cards available');

      console.log('[Analyzer] Loading current employees...');
      const currentCards = await this.pagination.loadAllEmployees(settings.maxEmployees);
      console.log('[Analyzer] Current employee cards found:', currentCards.length);
      
      for (const card of currentCards) {
        await this.rateLimiter.throttle();
        const emp = await this.extractor.extract(card);
        if (emp) {
          employees.push(emp);
          console.log('[Analyzer] Extracted employee:', emp.name, emp.title);
        }
        this.ui.updateProgress(employees.length, settings.maxEmployees);
      }

      console.log('[Analyzer] Current employees extracted:', employees.length);

      if (settings.enablePastEmployees) {
        console.log('[Analyzer] Attempting to navigate to past employees...');
        const navigated = await this.navigateToPast();
        console.log('[Analyzer] Navigation to past employees:', navigated ? 'SUCCESS' : 'FAILED');
        
        if (navigated) {
          const pastCards = await this.pagination.loadAllEmployees(settings.maxEmployees);
          console.log('[Analyzer] Past employee cards found:', pastCards.length);
          
          for (const card of pastCards) {
            await this.rateLimiter.throttle();
            const emp = await this.extractor.extract(card);
            if (emp) {
              emp.isPast = true;
              employees.push(emp);
              console.log('[Analyzer] Extracted past employee:', emp.name, emp.title);
            }
          }
        }
      }

      console.log('[Analyzer] Total employees collected:', employees.length);

      if (employees.length === 0) {
        console.error('[Analyzer] ⚠️ No employees found. Page URL:', window.location.href);
        console.error('[Analyzer] ⚠️ This might be a non-employee page (posts, jobs, etc.)');
        throw new Error('No employee data found. Please ensure you are on a company page.');
      }

      const request: AnalysisRequest = {
        type: 'ANALYZE_COMPANY',
        data: employees,
        companyId: this.extractCompanyId(),
        companyName: this.extractCompanyName(),
      };

      console.log('[Analyzer] Sending analysis request for company:', request.companyName);
      const response = await chrome.runtime.sendMessage(request) as AnalysisResponse;

      if (response.success && response.stats) {
        console.log('[Analyzer] Analysis successful. Median tenure:', response.stats.median, 'months');
        this.ui.showResults(response.stats);
        this.setupExportHandlers();
      } else {
        console.error('[Analyzer] Analysis failed:', response.error);
        this.ui.showError(response.error || 'Analysis failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[Analyzer] Error:', message);
      this.ui.showError(message);
      console.error('[Analyzer]', error);
    }
  }

  private async navigateToPast(): Promise<boolean> {
    try {
      const pastButton = document.querySelector('[aria-label*="Past"]') as HTMLElement;
      if (!pastButton) {
        console.warn('[Analyzer] Past employees filter not found');
        return false;
      }

      pastButton.click();
      await this.pagination.waitForLoad();
      return true;
    } catch (error) {
      console.error('[Analyzer] Error navigating to past employees:', error);
      return false;
    }
  }

  private extractCompanyId(): string {
    const match = window.location.pathname.match(/\/company\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }

  private extractCompanyName(): string {
    const heading = document.querySelector('.org-top-card-summary__title');
    return heading?.textContent?.trim() || 'Unknown Company';
  }

  private setupExportHandlers(): void {
    const csvButton = document.getElementById('tenure-analyzer-export-csv');
    const jsonButton = document.getElementById('tenure-analyzer-export-json');

    csvButton?.addEventListener('click', async () => {
      const analysis = await StorageManager.getLastAnalysis();
      if (analysis) {
        this.exportCSV(analysis.processed, analysis.companyName);
      }
    });

    jsonButton?.addEventListener('click', async () => {
      const analysis = await StorageManager.getLastAnalysis();
      if (analysis) {
        this.exportJSON(analysis);
      }
    });
  }

  private exportCSV(employees: any[], companyName: string): void {
    const headers = ['Name', 'Title', 'Start Date', 'End Date', 'Tenure (months)', 'Tenure (years)', 'Status', 'Profile URL'];
    const rows = employees.map(emp => [
      emp.name || '',
      emp.title || '',
      emp.startDate || '',
      emp.endDate || '',
      emp.tenureMonths || '',
      emp.tenureYears || '',
      emp.isPast ? 'Past' : 'Current',
      emp.profileUrl || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    this.downloadFile(blob, `${companyName}-tenure-analysis.csv`);
  }

  private exportJSON(analysis: any): void {
    const json = JSON.stringify(analysis, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadFile(blob, `${analysis.companyName}-tenure-analysis.json`);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function isCompanyPage(): boolean {
  return /^\/company\/[^\/]+/.test(window.location.pathname);
}

function init(): void {
  if (!isCompanyPage()) return;

  const ui = new UIManager();
  ui.injectAnalyzeButton();

  const button = ui.getAnalyzeButton();
  if (button) {
    button.addEventListener('click', async () => {
      button.setAttribute('disabled', 'true');
      const analyzer = new CompanyAnalyzer();
      await analyzer.analyze();
      button.removeAttribute('disabled');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

