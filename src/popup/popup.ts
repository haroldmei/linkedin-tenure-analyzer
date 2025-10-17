import { StorageManager } from '@/utils/storage-manager';
import type { AnalysisResult, TenureStatistics } from '@/types';

class PopupController {
  async init(): Promise<void> {
    const analysis = await StorageManager.getLastAnalysis();

    if (!analysis) {
      this.showEmptyState();
    } else {
      this.showResults(analysis);
    }

    this.setupEventListeners();
  }

  private showEmptyState(): void {
    const emptyState = document.getElementById('empty-state');
    const resultsContainer = document.getElementById('results-container');

    if (emptyState) emptyState.style.display = 'block';
    if (resultsContainer) resultsContainer.style.display = 'none';
  }

  private showResults(analysis: AnalysisResult): void {
    const emptyState = document.getElementById('empty-state');
    const resultsContainer = document.getElementById('results-container');

    if (emptyState) emptyState.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';

    this.renderCompanyInfo(analysis);
    this.renderStats(analysis.stats);
    this.renderHistogram(analysis.stats.histogram);
    this.renderQuality(analysis.stats.dataQuality);
  }

  private renderCompanyInfo(analysis: AnalysisResult): void {
    const companyName = document.getElementById('company-name');
    const analysisDate = document.getElementById('analysis-date')?.querySelector('span');

    if (companyName) {
      companyName.textContent = analysis.companyName;
    }

    if (analysisDate) {
      const date = new Date(analysis.timestamp);
      analysisDate.textContent = date.toLocaleString();
    }
  }

  private renderStats(stats: TenureStatistics): void {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;

    const statCards = [
      { label: 'Total Employees', value: stats.count.toString() },
      { label: 'Current', value: stats.currentCount.toString() },
      { label: 'Past', value: stats.pastCount.toString() },
      { label: 'Median Tenure', value: `${stats.median} mo` },
      { label: 'Mean Tenure', value: `${stats.mean} mo` },
      { label: '25th Percentile', value: `${stats.p25} mo` },
      { label: '75th Percentile', value: `${stats.p75} mo` },
      { label: '90th Percentile', value: `${stats.p90} mo` },
      { label: 'Min Tenure', value: `${stats.min} mo` },
      { label: 'Max Tenure', value: `${stats.max} mo` },
    ];

    statsGrid.innerHTML = statCards
      .map(
        (stat) => `
        <div class="stat-card">
          <div class="stat-value">${this.escapeHtml(stat.value)}</div>
          <div class="stat-label">${this.escapeHtml(stat.label)}</div>
        </div>
      `
      )
      .join('');
  }

  private renderHistogram(histogram: TenureStatistics['histogram']): void {
    const container = document.getElementById('histogram-container');
    if (!container) return;

    const bins = Object.entries(histogram);
    const max = Math.max(...Object.values(histogram));

    container.innerHTML = bins
      .map(([label, count]) => {
        const width = max > 0 ? (count / max) * 100 : 0;
        return `
          <div class="histogram-bar">
            <div class="histogram-label">${this.escapeHtml(label)}</div>
            <div class="histogram-track">
              <div class="histogram-fill" style="width: ${width}%"></div>
            </div>
            <div class="histogram-count">${count}</div>
          </div>
        `;
      })
      .join('');
  }

  private renderQuality(quality: TenureStatistics['dataQuality']): void {
    const container = document.getElementById('quality-info');
    if (!container) return;

    container.innerHTML = `
      <div class="quality-grid">
        <div class="quality-item">
          <span class="quality-label">Missing Start Dates:</span>
          <span class="quality-value">${quality.missingStartDate}</span>
        </div>
        <div class="quality-item">
          <span class="quality-label">Missing End Dates:</span>
          <span class="quality-value">${quality.missingEndDate}</span>
        </div>
        <div class="quality-item">
          <span class="quality-label">Ambiguous Dates:</span>
          <span class="quality-value">${quality.ambiguousDates}</span>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const exportCsvBtn = document.getElementById('export-csv');
    const exportJsonBtn = document.getElementById('export-json');
    const clearDataBtn = document.getElementById('clear-data');

    exportCsvBtn?.addEventListener('click', () => this.exportCSV());
    exportJsonBtn?.addEventListener('click', () => this.exportJSON());
    clearDataBtn?.addEventListener('click', () => this.clearData());
  }

  private async exportCSV(): Promise<void> {
    const analysis = await StorageManager.getLastAnalysis();
    if (!analysis) return;

    const headers = [
      'Name',
      'Title',
      'Start Date',
      'End Date',
      'Tenure (months)',
      'Tenure (years)',
      'Status',
      'Confidence',
      'Location',
      'Profile URL',
    ];

    const rows = analysis.processed.map((emp) => [
      emp.name || '',
      emp.title || '',
      emp.startDate || '',
      emp.endDate || '',
      emp.tenureMonths.toString(),
      emp.tenureYears.toString(),
      emp.isPast ? 'Past' : 'Current',
      emp.confidence,
      emp.location || '',
      emp.profileUrl || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    this.downloadFile(csv, `${analysis.companyName}-tenure-analysis.csv`, 'text/csv');
  }

  private async exportJSON(): Promise<void> {
    const analysis = await StorageManager.getLastAnalysis();
    if (!analysis) return;

    const json = JSON.stringify(analysis, null, 2);
    this.downloadFile(
      json,
      `${analysis.companyName}-tenure-analysis.json`,
      'application/json'
    );
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async clearData(): Promise<void> {
    if (confirm('Are you sure you want to clear all stored data?')) {
      await StorageManager.clearAllData();
      location.reload();
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const controller = new PopupController();
  controller.init();
});

