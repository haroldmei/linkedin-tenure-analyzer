import type { TenureStatistics } from '@/types';

export class UIManager {
  private progressElement: HTMLElement | null = null;
  private resultsElement: HTMLElement | null = null;

  injectAnalyzeButton(): void {
    if (document.getElementById('linkedin-tenure-analyzer-btn')) {
      return;
    }

    const header = document.querySelector('.org-top-card');
    if (!header) return;

    const button = document.createElement('button');
    button.id = 'linkedin-tenure-analyzer-btn';
    button.className = 'artdeco-button artdeco-button--secondary artdeco-button--2';
    button.innerHTML = `<span class="artdeco-button__text">📊 Analyze Tenure</span>`;
    button.setAttribute('aria-label', 'Analyze employee tenure distribution');
    button.style.cssText = 'margin-left: 8px;';

    const actionsContainer = header.querySelector('.org-top-card-actions');
    if (actionsContainer) {
      actionsContainer.appendChild(button);
    } else {
      header.appendChild(button);
    }
  }

  getAnalyzeButton(): HTMLElement | null {
    return document.getElementById('linkedin-tenure-analyzer-btn');
  }

  showProgress(current = 0, total = 0): void {
    this.hideResults();

    if (!this.progressElement) {
      this.progressElement = this.createProgressElement();
      document.body.appendChild(this.progressElement);
    }

    this.updateProgress(current, total);
    this.progressElement.style.display = 'block';
    this.announceStatus('Analysis started', 'polite');
  }

  updateProgress(current: number, total: number): void {
    if (!this.progressElement) return;

    const progressBar = this.progressElement.querySelector(
      '.tenure-analyzer-progress-fill'
    ) as HTMLElement;
    const progressText = this.progressElement.querySelector(
      '.tenure-analyzer-progress-text'
    ) as HTMLElement;

    if (progressBar && total > 0) {
      const percent = Math.min((current / total) * 100, 100);
      progressBar.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent = `Analyzing employees... ${current}/${total}`;
    }
  }

  hideProgress(): void {
    if (this.progressElement) {
      this.progressElement.style.display = 'none';
    }
  }

  showResults(stats: TenureStatistics): void {
    this.hideProgress();

    if (!this.resultsElement) {
      this.resultsElement = this.createResultsElement();
      document.body.appendChild(this.resultsElement);
    }

    this.populateResults(stats);
    this.resultsElement.style.display = 'block';
    this.announceStatus(
      `Analysis complete. Median tenure is ${stats.median} months.`,
      'assertive'
    );
  }

  hideResults(): void {
    if (this.resultsElement) {
      this.resultsElement.style.display = 'none';
    }
  }

  showError(message: string): void {
    this.hideProgress();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tenure-analyzer-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      max-width: 400px;
    `;
    errorDiv.innerHTML = `
      <strong>Analysis Error</strong><br>
      ${this.escapeHtml(message)}
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
    this.announceStatus(`Error: ${message}`, 'assertive');
  }

  private createProgressElement(): HTMLElement {
    const div = document.createElement('div');
    div.id = 'tenure-analyzer-progress';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 300px;
    `;

    div.innerHTML = `
      <div class="tenure-analyzer-progress-bar" style="
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 12px;
      ">
        <div class="tenure-analyzer-progress-fill" style="
          height: 100%;
          background: #0a66c2;
          width: 0%;
          transition: width 0.3s ease;
        "></div>
      </div>
      <p class="tenure-analyzer-progress-text" style="margin: 0; text-align: center; color: #333;">
        Analyzing employees...
      </p>
    `;

    return div;
  }

  private createResultsElement(): HTMLElement {
    const div = document.createElement('div');
    div.id = 'tenure-analyzer-results';
    div.setAttribute('role', 'region');
    div.setAttribute('aria-label', 'Analysis results');
    div.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 0;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    div.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 20px; color: #000;">Tenure Analysis</h2>
        <button id="tenure-analyzer-close" aria-label="Close results" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 32px;
          height: 32px;
          line-height: 1;
        ">×</button>
      </div>
      <div id="tenure-analyzer-stats" style="padding: 20px;"></div>
      <div style="padding: 20px; border-top: 1px solid #e0e0e0; display: flex; gap: 12px;">
        <button id="tenure-analyzer-export-csv" class="artdeco-button artdeco-button--secondary" style="flex: 1;">
          Export CSV
        </button>
        <button id="tenure-analyzer-export-json" class="artdeco-button artdeco-button--secondary" style="flex: 1;">
          Export JSON
        </button>
      </div>
    `;

    div.querySelector('#tenure-analyzer-close')?.addEventListener('click', () => {
      this.hideResults();
    });

    return div;
  }

  private populateResults(stats: TenureStatistics): void {
    const statsContainer = this.resultsElement?.querySelector('#tenure-analyzer-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
        ${this.createStatCard('Median', `${stats.median} mo`)}
        ${this.createStatCard('Mean', `${stats.mean} mo`)}
        ${this.createStatCard('Total', stats.count.toString())}
        ${this.createStatCard('Current', stats.currentCount.toString())}
        ${this.createStatCard('Past', stats.pastCount.toString())}
        ${this.createStatCard('P25', `${stats.p25} mo`)}
        ${this.createStatCard('P75', `${stats.p75} mo`)}
        ${this.createStatCard('P90', `${stats.p90} mo`)}
      </div>
      <div style="margin-top: 24px;">
        <h3 style="font-size: 16px; margin-bottom: 12px; color: #000;">Distribution</h3>
        ${this.createHistogram(stats.histogram)}
      </div>
    `;
  }

  private createStatCard(label: string, value: string): string {
    return `
      <div style="background: #f3f6f8; padding: 16px; border-radius: 4px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #0a66c2; margin-bottom: 4px;">
          ${this.escapeHtml(value)}
        </div>
        <div style="font-size: 12px; color: #666; text-transform: uppercase;">
          ${this.escapeHtml(label)}
        </div>
      </div>
    `;
  }

  private createHistogram(histogram: TenureStatistics['histogram']): string {
    const max = Math.max(...Object.values(histogram));
    const bins = Object.entries(histogram);

    return `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${bins
          .map(([label, count]) => {
            const width = max > 0 ? (count / max) * 100 : 0;
            return `
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="min-width: 60px; font-size: 12px; color: #666;">${this.escapeHtml(
                  label
                )}</div>
                <div style="flex: 1; background: #e0e0e0; height: 24px; border-radius: 4px; overflow: hidden;">
                  <div style="background: #0a66c2; height: 100%; width: ${width}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="min-width: 40px; font-size: 12px; color: #666; text-align: right;">${count}</div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  private announceStatus(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    let liveRegion = document.getElementById('tenure-analyzer-announcements');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'tenure-analyzer-announcements';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

