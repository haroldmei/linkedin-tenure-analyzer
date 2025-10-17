import { EmployeeExtractor } from './employee-extractor';
import { PaginationHandler } from './pagination-handler';
import { UIManager } from './ui-manager';
import { RateLimiter } from '@/utils/rate-limiter';
import { StorageManager } from '@/utils/storage-manager';
class CompanyAnalyzer {
    constructor() {
        this.extractor = new EmployeeExtractor();
        this.pagination = new PaginationHandler();
        this.ui = new UIManager();
        this.rateLimiter = new RateLimiter();
    }
    async analyze() {
        try {
            const settings = await StorageManager.getSettings();
            this.ui.showProgress(0, settings.maxEmployees);
            const employees = [];
            const currentCards = await this.pagination.loadAllEmployees(settings.maxEmployees);
            for (const card of currentCards) {
                await this.rateLimiter.throttle();
                const emp = this.extractor.extract(card);
                if (emp) {
                    employees.push(emp);
                }
                this.ui.updateProgress(employees.length, settings.maxEmployees);
            }
            if (settings.enablePastEmployees) {
                const navigated = await this.navigateToPast();
                if (navigated) {
                    const pastCards = await this.pagination.loadAllEmployees(settings.maxEmployees);
                    for (const card of pastCards) {
                        await this.rateLimiter.throttle();
                        const emp = this.extractor.extract(card);
                        if (emp) {
                            emp.isPast = true;
                            employees.push(emp);
                        }
                    }
                }
            }
            if (employees.length === 0) {
                throw new Error('No employee data found. Please ensure you are on a company page.');
            }
            const request = {
                type: 'ANALYZE_COMPANY',
                data: employees,
                companyId: this.extractCompanyId(),
                companyName: this.extractCompanyName(),
            };
            const response = await chrome.runtime.sendMessage(request);
            if (response.success && response.stats) {
                this.ui.showResults(response.stats);
                this.setupExportHandlers();
            }
            else {
                this.ui.showError(response.error || 'Analysis failed');
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            this.ui.showError(message);
            console.error('[Analyzer]', error);
        }
    }
    async navigateToPast() {
        try {
            const pastButton = document.querySelector('[aria-label*="Past"]');
            if (!pastButton) {
                console.warn('[Analyzer] Past employees filter not found');
                return false;
            }
            pastButton.click();
            await this.pagination.waitForLoad();
            return true;
        }
        catch (error) {
            console.error('[Analyzer] Error navigating to past employees:', error);
            return false;
        }
    }
    extractCompanyId() {
        const match = window.location.pathname.match(/\/company\/([^\/]+)/);
        return match ? match[1] : 'unknown';
    }
    extractCompanyName() {
        const heading = document.querySelector('.org-top-card-summary__title');
        return heading?.textContent?.trim() || 'Unknown Company';
    }
    setupExportHandlers() {
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
    exportCSV(employees, companyName) {
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
    exportJSON(analysis) {
        const json = JSON.stringify(analysis, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this.downloadFile(blob, `${analysis.companyName}-tenure-analysis.json`);
    }
    downloadFile(blob, filename) {
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
function isCompanyPage() {
    return /^\/company\/[^\/]+/.test(window.location.pathname);
}
function init() {
    if (!isCompanyPage())
        return;
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
}
else {
    init();
}
