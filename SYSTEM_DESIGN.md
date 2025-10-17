# LinkedIn Company Analysis Extension - System Design

## 1. Overview

### Problem Statement
LinkedIn users and recruiters need insights into company employee tenure patterns to assess organizational health, retention, and culture. Currently, this requires manual aggregation of individual profile data, which is time-consuming and error-prone.

### Goals
- Provide a one-click analysis tool for LinkedIn company pages
- Calculate employee tenure distributions with statistical summaries
- Export data in CSV/JSON formats for further analysis
- Ensure 100% ToS compliance through user-consented, on-page data parsing only
- Deliver a performant, accessible, privacy-respecting user experience

### Non-Goals
- Unauthorized web scraping or automated data collection
- Backend API or persistent cloud storage
- Real-time monitoring or background tracking
- Analysis of non-company pages (e.g., personal profiles, job listings)
- Integration with LinkedIn's official API (requires partnership)

### Assumptions
- Users are authenticated to LinkedIn in their browser
- LinkedIn's DOM structure may change; extension must handle gracefully
- Users have valid access to employee information (subject to LinkedIn visibility rules)
- Rate limiting: max 50 employee profiles analyzed per session
- Typical company page shows 10-20 employees initially, requiring pagination
- Tenure calculated from visible start dates; end dates inferred from "Past" designation

---

## 2. Functional Requirements

### FR-1: Company Page Detection
- Extension activates ONLY on URLs matching `https://www.linkedin.com/company/*/`
- Display "Analyze Company" button overlay on detected pages
- Button positioned near company header, non-intrusive

### FR-2: Data Collection
- **Current Employees**: Parse "People" section visible employee cards
- **Past Employees**: Navigate to "Past" filter via DOM interactions (user-consented)
- Extract per employee:
  - Name (optional, for display context)
  - Title/role
  - Start date (month/year)
  - End date (if past employee)
  - Profile URL (for deduplication)
  - Current/past status
  - Location (if visible)
  
### FR-3: Tenure Calculation
- **Tenure** = end_date - start_date (for past employees)
- **Tenure** = current_date - start_date (for current employees)
- Unit: months (rounded to nearest month)
- Handle missing data: skip records with insufficient date information

### FR-4: Analytics Output
- Summary statistics: mean, median, P25, P75, P90, min, max
- Histogram data: binned by [0-6m, 6-12m, 1-2y, 2-3y, 3-5y, 5-10y, 10y+]
- Separate analysis for current vs. past employees
- Sample size and data quality metrics

### FR-5: Export Capabilities
- CSV: employee-level data with all extracted fields
- JSON: structured export with metadata (timestamp, company, stats)
- Download triggered via browser's native download mechanism

---

## 3. Non-Functional Requirements

### NFR-1: Manifest V3 Compliance
- Service worker-based background processing
- Declarative permissions model
- Content Security Policy enforcement

### NFR-2: Performance
- Initial analysis completion < 15 seconds for 50 employees
- UI remains responsive during data collection
- Memory footprint < 50MB
- No DOM blocking operations > 100ms

### NFR-3: Testing
- ≥80% code coverage (unit + integration)
- E2E tests for critical user journeys
- Automated regression testing in CI

### NFR-4: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all controls
- Screen reader announcements for status updates
- High contrast mode support

### NFR-5: Maintainability
- TypeScript with strict mode
- Modular architecture with clear separation of concerns
- Comprehensive inline documentation
- Semantic versioning

---

## 4. Architecture (Manifest V3)

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────▼───────────────┐
    │   LinkedIn Company Page    │
    │   (DOM)                    │
    └────────────┬───────────────┘
                 │
    ┌────────────▼───────────────┐
    │   Content Script           │ ◄────────┐
    │   - Inject UI              │          │
    │   - Parse DOM              │          │
    │   - Handle pagination      │          │
    └────────────┬───────────────┘          │
                 │ (runtime.sendMessage)    │
                 │                          │
    ┌────────────▼───────────────┐          │
    │   Service Worker           │          │
    │   - Process raw data       │          │
    │   - Calculate tenure       │          │
    │   - Generate stats         │          │
    │   - Coordinate storage     │          │
    └────────────┬───────────────┘          │
                 │                          │
    ┌────────────▼───────────────┐          │
    │   Chrome Storage API       │          │
    │   (local)                  │          │
    └────────────────────────────┘          │
                                            │
    ┌───────────────────────────────────────┘
    │   Popup UI
    │   - Show results
    │   - Export controls
    │   - Settings
    └───────────────────────────────────────┘
```

### Data Flow Sequence

```
User                Content Script      Service Worker       Storage
  │                       │                   │                 │
  │  Click "Analyze"      │                   │                 │
  ├──────────────────────►│                   │                 │
  │                       │                   │                 │
  │                       │  Parse DOM        │                 │
  │                       │  (current emps)   │                 │
  │                       │                   │                 │
  │                       │  Navigate "Past"  │                 │
  │                       │  Parse DOM        │                 │
  │                       │  (past emps)      │                 │
  │                       │                   │                 │
  │                       │  sendMessage      │                 │
  │                       │  (raw data)       │                 │
  │                       ├──────────────────►│                 │
  │                       │                   │                 │
  │                       │                   │ Calculate tenure│
  │                       │                   │ Generate stats  │
  │                       │                   │                 │
  │                       │                   │  Store results  │
  │                       │                   ├────────────────►│
  │                       │                   │                 │
  │                       │  response         │                 │
  │                       │  (stats)          │                 │
  │                       │◄──────────────────┤                 │
  │                       │                   │                 │
  │  Show results UI      │                   │                 │
  │◄──────────────────────┤                   │                 │
  │                       │                   │                 │
  │  Click "Export CSV"   │                   │                 │
  ├──────────────────────►│                   │                 │
  │                       │                   │                 │
  │                       │  Request full data│                 │
  │                       ├──────────────────►│                 │
  │                       │                   │                 │
  │                       │                   │  Retrieve data  │
  │                       │                   ├────────────────►│
  │                       │                   │◄────────────────┤
  │                       │                   │                 │
  │                       │  CSV blob         │                 │
  │                       │◄──────────────────┤                 │
  │                       │                   │                 │
  │  Download CSV         │                   │                 │
  │◄──────────────────────┤                   │                 │
```

### Component Specifications

#### Service Worker (`background/service-worker.ts`)
```typescript
// Entry point for background processing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_COMPANY') {
    handleAnalysis(message.data, sendResponse);
    return true; // Async response
  }
});

async function handleAnalysis(rawData: RawEmployee[], sendResponse: Function) {
  const processed = processEmployees(rawData);
  const stats = calculateStatistics(processed);
  await chrome.storage.local.set({ lastAnalysis: { processed, stats, timestamp: Date.now() } });
  sendResponse({ success: true, stats });
}
```

**Responsibilities:**
- Message routing and coordination
- Data transformation and validation
- Tenure calculations
- Statistical analysis
- Storage management
- Error handling and logging

#### Content Script (`content/analyzer.ts`)
```typescript
// Injected into LinkedIn company pages
class CompanyAnalyzer {
  private employees: RawEmployee[] = [];
  
  async analyze() {
    try {
      await this.parseCurrentEmployees();
      await this.parsePastEmployees();
      
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_COMPANY',
        data: this.employees
      });
      
      this.showResults(response.stats);
    } catch (error) {
      this.showError(error);
    }
  }
  
  private async parseCurrentEmployees() {
    const cards = document.querySelectorAll('[data-entity-urn*="company-employee"]');
    for (const card of cards) {
      this.employees.push(this.extractEmployeeData(card));
    }
  }
  
  private async parsePastEmployees() {
    // Click "Past" filter with exponential backoff
    const pastButton = document.querySelector('[aria-label*="Past"]');
    if (!pastButton) return;
    
    (pastButton as HTMLElement).click();
    await this.waitForLoad();
    
    const cards = document.querySelectorAll('[data-entity-urn*="company-employee"]');
    for (const card of cards) {
      const emp = this.extractEmployeeData(card);
      emp.isPast = true;
      this.employees.push(emp);
    }
  }
}
```

**Responsibilities:**
- DOM observation and parsing
- UI injection (button, results panel)
- Pagination handling
- Rate limiting and backoff
- User interaction handling

#### Popup UI (`popup/index.html` + `popup/popup.ts`)
```typescript
// Extension popup for viewing results and export
class PopupController {
  async init() {
    const { lastAnalysis } = await chrome.storage.local.get('lastAnalysis');
    if (!lastAnalysis) {
      this.showEmptyState();
      return;
    }
    
    this.renderStats(lastAnalysis.stats);
    this.renderHistogram(lastAnalysis.stats.histogram);
  }
  
  async exportCSV() {
    const { lastAnalysis } = await chrome.storage.local.get('lastAnalysis');
    const csv = this.generateCSV(lastAnalysis.processed);
    this.downloadFile(csv, 'company-analysis.csv', 'text/csv');
  }
  
  async exportJSON() {
    const { lastAnalysis } = await chrome.storage.local.get('lastAnalysis');
    const json = JSON.stringify(lastAnalysis, null, 2);
    this.downloadFile(json, 'company-analysis.json', 'application/json');
  }
}
```

### Storage Schema

```typescript
// types/storage.ts
interface StorageSchema {
  lastAnalysis?: {
    companyId: string;
    companyName: string;
    timestamp: number;
    processed: ProcessedEmployee[];
    stats: TenureStatistics;
  };
  settings: {
    maxEmployees: number; // Default: 50
    enablePastEmployees: boolean; // Default: true
    theme: 'light' | 'dark' | 'auto';
  };
  cache: {
    [companyId: string]: {
      timestamp: number;
      data: ProcessedEmployee[];
      expiresAt: number; // 24 hours
    };
  };
}

interface RawEmployee {
  name?: string;
  title: string;
  startDate: DateString; // "YYYY-MM" or "MMM YYYY"
  endDate?: DateString;
  profileUrl: string;
  location?: string;
  isPast: boolean;
}

interface ProcessedEmployee extends RawEmployee {
  tenureMonths: number;
  tenureYears: number;
  confidence: 'high' | 'medium' | 'low'; // Based on date precision
}

interface TenureStatistics {
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
```

### Permissions Model

```json
{
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*"
  ],
  "optional_permissions": [
    "downloads"
  ]
}
```

**Justification:**
- `storage`: Persist analysis results and user settings
- `activeTab`: Read DOM content when user clicks "Analyze" (user-initiated)
- `https://www.linkedin.com/*`: Required for content script injection
- `downloads` (optional): Export CSV/JSON files

---

## 5. Compliance, Privacy, and Ethics

### LinkedIn ToS Compliance

**Permitted Actions:**
- ✅ User-initiated parsing of currently visible DOM content
- ✅ Simulating user clicks on navigation elements (e.g., "Past" filter)
- ✅ Local storage of analyzed data on user's device
- ✅ Exporting user's own analyzed data

**Prohibited Actions:**
- ❌ Automated/background scraping without user action
- ❌ Circumventing LinkedIn's access controls or rate limits
- ❌ Storing data on external servers
- ❌ Sharing data between users or third parties

### Consent UX

**First-Time Use Flow:**
```
┌─────────────────────────────────────────┐
│  Before You Analyze                      │
├─────────────────────────────────────────┤
│  This extension will:                    │
│  • Parse visible employee data on this   │
│    page (name, title, tenure dates)      │
│  • Store results locally on your device  │
│  • NOT send data to external servers     │
│                                          │
│  You agree to use this tool in           │
│  compliance with LinkedIn's Terms of     │
│  Service and for personal use only.      │
│                                          │
│  [ Learn More ]  [ Cancel ]  [ Proceed ] │
└─────────────────────────────────────────┘
```

### Data Minimization
- Collect ONLY fields necessary for tenure analysis
- Name field marked optional (for context, not analysis)
- Profile URLs used solely for deduplication
- No profile photos, emails, or contact information

### PII Handling
- All data stored in `chrome.storage.local` (device-only)
- No telemetry or analytics collection
- Export warnings: "Exported files contain personal data. Handle responsibly."
- Clear data option in settings

### Retention Policy
- Analysis results expire after 30 days (auto-purge)
- User can manually clear at any time
- Cache invalidation: 24 hours

### User Controls
- Settings page with:
  - Toggle: "Include Past Employees" (default: ON)
  - Slider: "Max Employees to Analyze" (10-100, default: 50)
  - Button: "Clear All Stored Data"
  - Checkbox: "Suppress consent dialog" (after first acceptance)

### Legal Review Checklist
- [ ] Terms of Service compliance verified by legal counsel
- [ ] Privacy policy drafted and accessible
- [ ] GDPR compliance review (if targeting EU users)
- [ ] CCPA compliance review (if targeting California users)
- [ ] Intellectual property clearance (no LinkedIn trademarks in name)
- [ ] Disclaimer: "Unofficial tool, not affiliated with LinkedIn"

---

## 6. Data Acquisition Strategy

### Robust Selectors

**Primary Selector Strategy:**
```typescript
const SELECTORS = {
  employeeCard: {
    primary: '[data-entity-urn*="company-employee"]',
    fallback: [
      '.org-people-profile-card',
      '[data-control-name="people_profile_card"]',
      'li.ember-view.org-people-profile-card__profile-card'
    ]
  },
  name: {
    primary: '.org-people-profile-card__profile-title',
    fallback: ['[aria-label*="View"]', 'a.app-aware-link']
  },
  title: {
    primary: '.artdeco-entity-lockup__subtitle',
    fallback: ['.t-14.t-black--light', '.org-people-profile-card__profile-info']
  },
  tenure: {
    primary: '.artdeco-entity-lockup__caption',
    fallback: ['.t-12.t-black--light', 'time']
  }
};

function extractWithFallback(element: Element, selectorSet: SelectorSet): string | null {
  for (const selector of [selectorSet.primary, ...selectorSet.fallback]) {
    const found = element.querySelector(selector);
    if (found) return found.textContent?.trim() || null;
  }
  return null;
}
```

### Pagination Strategy

```typescript
class PaginationHandler {
  async loadAllEmployees(maxCount: number): Promise<Element[]> {
    const employees: Element[] = [];
    let page = 1;
    
    while (employees.length < maxCount) {
      const newEmployees = this.getVisibleEmployees();
      employees.push(...newEmployees);
      
      const nextButton = this.findNextButton();
      if (!nextButton || !this.isEnabled(nextButton)) break;
      
      nextButton.click();
      await this.waitForNewContent(page);
      
      page++;
      if (page > 10) break; // Safety cap
    }
    
    return employees.slice(0, maxCount);
  }
  
  private async waitForNewContent(page: number) {
    const delay = Math.min(1000 * Math.pow(1.5, page - 1), 5000); // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Wait for spinner to disappear
    await this.waitForCondition(
      () => !document.querySelector('.artdeco-spinner'),
      3000
    );
  }
}
```

### Field Extraction & Parsing

```typescript
class DateParser {
  parse(dateString: string): Date | null {
    // "Jan 2020", "January 2020", "2020"
    const patterns = [
      /(\w+)\s+(\d{4})/, // "Jan 2020"
      /(\d{4})/          // "2020"
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        if (match[2]) {
          const month = this.parseMonth(match[1]);
          const year = parseInt(match[2]);
          return new Date(year, month, 1);
        } else {
          // Year only - assume mid-year
          return new Date(parseInt(match[1]), 6, 1);
        }
      }
    }
    return null;
  }
  
  private parseMonth(month: string): number {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const index = months.findIndex(m => month.toLowerCase().startsWith(m));
    return index >= 0 ? index : 0;
  }
}
```

### Rate Limiting & Backoff

```typescript
class RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequestsPerMinute = 20;
  
  async throttle() {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(t => now - t < 60000);
    
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestTimes.push(now);
  }
}
```

### Confidence Scoring

```typescript
function calculateConfidence(employee: RawEmployee): 'high' | 'medium' | 'low' {
  let score = 100;
  
  if (!employee.startDate) return 'low';
  
  // Deduct for missing or imprecise data
  if (employee.startDate.match(/^\d{4}$/)) score -= 20; // Year only
  if (employee.isPast && !employee.endDate) score -= 30;
  if (!employee.title) score -= 10;
  
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}
```

---

## 7. Analytics

### Tenure Calculation

```typescript
class TenureCalculator {
  calculateTenure(employee: ProcessedEmployee): number {
    const start = this.parseDate(employee.startDate);
    if (!start) return 0;
    
    const end = employee.endDate 
      ? this.parseDate(employee.endDate)
      : new Date(); // Current date for active employees
    
    // Calculate months difference
    const months = (end.getFullYear() - start.getFullYear()) * 12 
                  + (end.getMonth() - start.getMonth());
    
    return Math.max(0, months);
  }
  
  private parseDate(dateString: string): Date | null {
    return new DateParser().parse(dateString);
  }
}
```

### Statistical Analysis

```typescript
class StatisticsEngine {
  calculate(employees: ProcessedEmployee[]): TenureStatistics {
    const tenures = employees.map(e => e.tenureMonths).sort((a, b) => a - b);
    const current = employees.filter(e => !e.isPast);
    const past = employees.filter(e => e.isPast);
    
    return {
      count: employees.length,
      currentCount: current.length,
      pastCount: past.length,
      mean: this.mean(tenures),
      median: this.percentile(tenures, 50),
      p25: this.percentile(tenures, 25),
      p75: this.percentile(tenures, 75),
      p90: this.percentile(tenures, 90),
      min: tenures[0] || 0,
      max: tenures[tenures.length - 1] || 0,
      histogram: this.generateHistogram(tenures),
      dataQuality: this.assessQuality(employees)
    };
  }
  
  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  
  private generateHistogram(tenures: number[]): TenureStatistics['histogram'] {
    const bins = {
      '0-6m': 0, '6-12m': 0, '1-2y': 0, '2-3y': 0,
      '3-5y': 0, '5-10y': 0, '10y+': 0
    };
    
    for (const months of tenures) {
      if (months < 6) bins['0-6m']++;
      else if (months < 12) bins['6-12m']++;
      else if (months < 24) bins['1-2y']++;
      else if (months < 36) bins['2-3y']++;
      else if (months < 60) bins['3-5y']++;
      else if (months < 120) bins['5-10y']++;
      else bins['10y+']++;
    }
    
    return bins;
  }
  
  private assessQuality(employees: ProcessedEmployee[]) {
    return {
      missingStartDate: employees.filter(e => !e.startDate).length,
      missingEndDate: employees.filter(e => e.isPast && !e.endDate).length,
      ambiguousDates: employees.filter(e => e.confidence === 'low').length
    };
  }
}
```

### Missing Data Handling

**Strategy:**
1. **Exclude**: Employees without start dates entirely excluded from analysis
2. **Impute**: Missing end dates for past employees → use median tenure of company
3. **Flag**: Records with low confidence highlighted in export, excluded from median/percentile calculations
4. **Report**: Data quality section shows % of usable records

---

## 8. UX & Accessibility

### UI Components

#### Analyze Button Injection
```typescript
function injectAnalyzeButton() {
  const header = document.querySelector('.org-top-card');
  if (!header || document.getElementById('company-analyzer-btn')) return;
  
  const button = document.createElement('button');
  button.id = 'company-analyzer-btn';
  button.className = 'artdeco-button artdeco-button--secondary';
  button.innerHTML = `
    <span class="artdeco-button__text">📊 Analyze Tenure</span>
  `;
  button.setAttribute('aria-label', 'Analyze employee tenure distribution');
  button.addEventListener('click', () => new CompanyAnalyzer().analyze());
  
  header.appendChild(button);
}
```

#### Progress Indicator
```html
<div id="analyzer-progress" role="status" aria-live="polite">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 45%"></div>
  </div>
  <p>Analyzing employees... 22/50</p>
</div>
```

#### Results Panel
```html
<div id="analyzer-results" role="region" aria-label="Analysis results">
  <header>
    <h2>Tenure Analysis</h2>
    <button id="close-btn" aria-label="Close results">×</button>
  </header>
  
  <section class="stats-summary">
    <div class="stat-card">
      <span class="stat-value">18.5</span>
      <span class="stat-label">Median (months)</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">23.2</span>
      <span class="stat-label">Mean (months)</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">42</span>
      <span class="stat-label">Employees</span>
    </div>
  </section>
  
  <section class="histogram">
    <canvas id="tenure-chart" aria-label="Tenure distribution histogram"></canvas>
  </section>
  
  <footer>
    <button id="export-csv" class="secondary">Export CSV</button>
    <button id="export-json" class="secondary">Export JSON</button>
  </footer>
</div>
```

### State Management

| State | UI Treatment |
|-------|-------------|
| **Idle** | "Analyze" button visible |
| **Loading** | Button disabled, progress bar shown, status text updates |
| **Success** | Results panel overlays page, scrollable, dismissible |
| **Empty** | "No employee data found. Ensure you're on a company page with visible employees." |
| **Error** | Alert banner: "Analysis failed: {reason}. Please try again." |
| **Rate Limited** | "Too many requests. Please wait 60 seconds before retrying." |

### Keyboard Navigation

- `Alt+A`: Trigger analysis (when on company page)
- `Tab`: Navigate through results
- `Esc`: Close results panel
- `Enter`/`Space`: Activate buttons
- Arrow keys: Navigate histogram bars

### Screen Reader Support

```typescript
function announceStatus(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = document.getElementById('sr-announcements');
  if (!liveRegion) {
    const region = document.createElement('div');
    region.id = 'sr-announcements';
    region.className = 'sr-only';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    document.body.appendChild(region);
  }
  
  liveRegion!.textContent = message;
}

// Usage
announceStatus('Analysis started. Processing 42 employees.');
announceStatus('Analysis complete. Median tenure is 18 months.', 'assertive');
```

### Internationalization Hooks

```typescript
// i18n/messages.json (Chrome extension format)
{
  "analyze_button_text": {
    "message": "Analyze Tenure",
    "description": "Button text to start analysis"
  },
  "median_label": {
    "message": "Median",
    "description": "Label for median statistic"
  }
}

// Usage
const text = chrome.i18n.getMessage('analyze_button_text');
```

---

## 9. Testing (≥80% Coverage)

### Test Structure

```
tests/
├── unit/
│   ├── parsers/
│   │   ├── date-parser.test.ts
│   │   ├── employee-extractor.test.ts
│   │   └── selector-fallback.test.ts
│   ├── analytics/
│   │   ├── tenure-calculator.test.ts
│   │   ├── statistics-engine.test.ts
│   │   └── histogram-generator.test.ts
│   └── utils/
│       ├── validation.test.ts
│       └── storage-schema.test.ts
├── integration/
│   ├── message-passing.test.ts
│   ├── storage-persistence.test.ts
│   └── content-worker-flow.test.ts
└── e2e/
    ├── company-page-analysis.spec.ts
    ├── export-functionality.spec.ts
    └── error-scenarios.spec.ts
```

### Unit Tests

```typescript
// tests/unit/analytics/tenure-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { TenureCalculator } from '@/analytics/tenure-calculator';

describe('TenureCalculator', () => {
  const calculator = new TenureCalculator();
  
  it('calculates tenure for current employee', () => {
    const employee = {
      startDate: 'Jan 2022',
      endDate: undefined,
      isPast: false
    };
    
    const tenure = calculator.calculateTenure(employee);
    expect(tenure).toBeGreaterThan(20); // Assuming test runs in 2024
  });
  
  it('calculates tenure for past employee', () => {
    const employee = {
      startDate: 'Jan 2020',
      endDate: 'Dec 2022',
      isPast: true
    };
    
    const tenure = calculator.calculateTenure(employee);
    expect(tenure).toBe(35); // 35 months
  });
  
  it('handles year-only dates with mid-year assumption', () => {
    const employee = {
      startDate: '2020',
      endDate: '2022',
      isPast: true
    };
    
    const tenure = calculator.calculateTenure(employee);
    expect(tenure).toBe(24); // 2 years
  });
  
  it('returns 0 for missing start date', () => {
    const employee = { startDate: null, isPast: false };
    expect(calculator.calculateTenure(employee)).toBe(0);
  });
});
```

### Integration Tests

```typescript
// tests/integration/message-passing.test.ts
import { describe, it, expect, vi } from 'vitest';
import { chrome } from '@/test-utils/chrome-mock';

describe('Content Script → Service Worker Communication', () => {
  it('sends analysis request and receives stats', async () => {
    const mockData = [
      { startDate: 'Jan 2020', isPast: false, title: 'Engineer' }
    ];
    
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_COMPANY',
      data: mockData
    });
    
    expect(response.success).toBe(true);
    expect(response.stats).toHaveProperty('median');
    expect(response.stats.count).toBe(1);
  });
  
  it('handles errors gracefully', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_COMPANY',
      data: [] // Empty data
    });
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/company-page-analysis.spec.ts
import { test, expect } from '@playwright/test';

test.describe('LinkedIn Company Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.linkedin.com/company/example/');
    await page.waitForSelector('.org-top-card');
  });
  
  test('analyzes company tenure successfully', async ({ page }) => {
    await page.click('#company-analyzer-btn');
    
    await expect(page.locator('#analyzer-progress')).toBeVisible();
    await expect(page.locator('#analyzer-results')).toBeVisible({ timeout: 20000 });
    
    const medianStat = page.locator('.stat-card:has-text("Median")');
    await expect(medianStat).toBeVisible();
    
    const medianValue = await medianStat.locator('.stat-value').textContent();
    expect(parseFloat(medianValue!)).toBeGreaterThan(0);
  });
  
  test('exports CSV successfully', async ({ page }) => {
    await page.click('#company-analyzer-btn');
    await page.waitForSelector('#analyzer-results');
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#export-csv')
    ]);
    
    expect(download.suggestedFilename()).toMatch(/company-analysis.*\.csv$/);
    
    const path = await download.path();
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf-8');
    expect(content).toContain('title,startDate,tenureMonths');
  });
  
  test('handles rate limiting gracefully', async ({ page }) => {
    // Simulate rapid clicks
    for (let i = 0; i < 5; i++) {
      await page.click('#company-analyzer-btn');
    }
    
    const errorBanner = page.locator('.error-banner:has-text("rate")');
    await expect(errorBanner).toBeVisible();
  });
});
```

### Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| `tenure-calculator.ts` | 95% | Critical |
| `statistics-engine.ts` | 95% | Critical |
| `date-parser.ts` | 90% | High |
| `employee-extractor.ts` | 85% | High |
| `selector-fallback.ts` | 80% | High |
| `storage-manager.ts` | 80% | Medium |
| `message-router.ts` | 75% | Medium |
| UI components | 70% | Low |
| **Overall** | **≥80%** | **Required** |

### Coverage Enforcement

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80
        },
        './src/analytics/': {
          lines: 95
        }
      }
    }
  }
});
```

---

## 10. CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [created]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [unit, integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:${{ matrix.test-type }}
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: ${{ matrix.test-type }}

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build extension
        run: npm run build
      - name: Run E2E tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    needs: [lint, test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Package extension
        run: npm run package
      - uses: actions/upload-artifact@v4
        with:
          name: extension-package
          path: dist/extension.zip
          retention-days: 30

  release:
    if: github.event_name == 'release'
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: extension-package
      - name: Upload to Chrome Web Store
        env:
          CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
          REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
        run: |
          # Upload using chrome-webstore-upload-cli
          npx chrome-webstore-upload-cli@latest upload \
            --source extension.zip \
            --auto-publish
      - name: Attach to GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: extension.zip
```

### Build Script

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite build --mode development --watch",
    "build": "tsc && vite build",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test:unit": "vitest run --coverage tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test": "npm run test:unit && npm run test:integration",
    "package": "node scripts/package.js",
    "release": "standard-version"
  }
}
```

```javascript
// scripts/package.js
const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('dist/extension.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.directory('dist/', false); // Package entire dist folder
archive.finalize();

output.on('close', () => {
  console.log(`✅ Packaged ${archive.pointer()} bytes`);
});
```

### Branch Protection

**Required status checks:**
- ✅ Lint
- ✅ Type check
- ✅ Unit tests (≥80% coverage)
- ✅ Integration tests
- ✅ E2E tests
- ✅ Build succeeds

**Rules:**
- Require pull request reviews (1 approver)
- Dismiss stale reviews on new commits
- Require conversation resolution
- No force pushes to `main`
- No deletions of `main`

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (e.g., manifest v3 → v4)
MINOR: New features (e.g., add JSON export)
PATCH: Bug fixes, performance improvements

Examples:
1.0.0 → Initial release
1.1.0 → Add past employee analysis
1.1.1 → Fix date parsing bug
2.0.0 → Redesigned UI (breaking changes)
```

### Release Automation

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version (e.g., 1.2.0)'
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Update version
        run: |
          npm version ${{ github.event.inputs.version }} --no-git-tag-version
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add package.json manifest.json
          git commit -m "chore: bump version to ${{ github.event.inputs.version }}"
          git tag v${{ github.event.inputs.version }}
          git push && git push --tags
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.event.inputs.version }}
          release_name: Release v${{ github.event.inputs.version }}
          draft: false
          prerelease: false
```

---

## 11. Security & Threat Model

### Threat Analysis

| Threat | Risk | Mitigation |
|--------|------|------------|
| **Permission Abuse** | Medium | Minimal permissions (`activeTab` only), no `<all_urls>` |
| **XSS via DOM Injection** | High | CSP, DOMPurify sanitization, no `innerHTML` with user data |
| **PII Leakage** | High | Local-only storage, no external requests, clear data option |
| **Malicious Code Injection** | Medium | Integrity hashes, code signing, CSP `script-src 'self'` |
| **LinkedIn DOM Hijacking** | Low | Namespace-prefixed IDs, defensive selectors |
| **Rate Limit Bypass Attempts** | Low | Client-side throttling, exponential backoff |
| **Unauthorized Data Sharing** | Medium | No backend, export warnings, privacy policy |

### Content Security Policy

```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self'"
  }
}
```

**Enforces:**
- No inline scripts
- No external script loading
- No `eval()` or `new Function()`
- Self-hosted resources only

### Input Sanitization

```typescript
import DOMPurify from 'dompurify';

function sanitizeEmployeeName(name: string): string {
  return DOMPurify.sanitize(name, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

function safeInnerHTML(element: HTMLElement, content: string) {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'span'],
    ALLOWED_ATTR: ['class']
  });
  element.innerHTML = clean;
}
```

### Least Privilege Principle

**Permissions justification:**
- ❌ `tabs`: Not needed (use `activeTab` instead)
- ❌ `webRequest`: Not needed
- ❌ `cookies`: Not needed
- ✅ `storage`: Required for caching results
- ✅ `activeTab`: Required for user-initiated DOM access

### Code Signing

```bash
# Generate private key (keep secret!)
openssl genrsa -out key.pem 2048

# Generate public key for manifest
openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A

# Sign extension package
chrome --pack-extension=./dist --pack-extension-key=key.pem
```

### Vulnerability Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 12. Deliverables

### manifest.json (MV3)

```json
{
  "manifest_version": 3,
  "name": "LinkedIn Company Tenure Analyzer",
  "version": "1.0.0",
  "description": "Analyze employee tenure distributions on LinkedIn company pages with one click.",
  "icons": {
    "16": "assets/icon16.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  },
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*"
  ],
  "optional_permissions": [
    "downloads"
  ],
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/company/*/"],
      "js": ["content/analyzer.js"],
      "css": ["content/styles.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "assets/icon16.png",
      "48": "assets/icon48.png"
    },
    "default_title": "View Tenure Analysis"
  },
  "options_page": "options/index.html",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["https://www.linkedin.com/*"]
    }
  ]
}
```

### Content Script Outline

```typescript
// content/analyzer.ts
import { RawEmployee, AnalysisRequest } from '@/types';
import { EmployeeExtractor } from './extractors/employee-extractor';
import { PaginationHandler } from './pagination-handler';
import { UIManager } from './ui-manager';
import { RateLimiter } from '@/utils/rate-limiter';

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
  
  async analyze() {
    try {
      this.ui.showProgress();
      
      const employees: RawEmployee[] = [];
      
      // Parse current employees
      const currentCards = await this.pagination.loadAllEmployees(50);
      for (const card of currentCards) {
        await this.rateLimiter.throttle();
        const emp = this.extractor.extract(card);
        if (emp) employees.push(emp);
        this.ui.updateProgress(employees.length, 50);
      }
      
      // Parse past employees (if enabled)
      const settings = await this.getSettings();
      if (settings.enablePastEmployees) {
        await this.navigateToPast();
        const pastCards = await this.pagination.loadAllEmployees(50);
        for (const card of pastCards) {
          await this.rateLimiter.throttle();
          const emp = this.extractor.extract(card);
          if (emp) {
            emp.isPast = true;
            employees.push(emp);
          }
        }
      }
      
      // Send to service worker for processing
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_COMPANY',
        data: employees,
        companyId: this.extractCompanyId(),
        companyName: this.extractCompanyName()
      });
      
      if (response.success) {
        this.ui.showResults(response.stats);
      } else {
        this.ui.showError(response.error);
      }
      
    } catch (error) {
      this.ui.showError(error.message);
      console.error('[Analyzer]', error);
    }
  }
  
  private async navigateToPast() {
    const pastButton = document.querySelector('[aria-label*="Past"]') as HTMLElement;
    if (!pastButton) throw new Error('Past employees filter not found');
    
    pastButton.click();
    await this.pagination.waitForLoad();
  }
  
  private extractCompanyId(): string {
    const match = window.location.pathname.match(/\/company\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }
  
  private extractCompanyName(): string {
    const heading = document.querySelector('.org-top-card-summary__title');
    return heading?.textContent?.trim() || 'Unknown Company';
  }
  
  private async getSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    return settings || { enablePastEmployees: true, maxEmployees: 50 };
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  if (isCompanyPage()) {
    new UIManager().injectAnalyzeButton();
  }
}

function isCompanyPage(): boolean {
  return /^\/company\/[^\/]+\/?$/.test(window.location.pathname);
}
```

### Storage Schema Example (JSON)

```json
{
  "lastAnalysis": {
    "companyId": "google",
    "companyName": "Google",
    "timestamp": 1697500800000,
    "processed": [
      {
        "name": "Jane Doe",
        "title": "Software Engineer",
        "startDate": "Jan 2021",
        "endDate": null,
        "profileUrl": "https://linkedin.com/in/janedoe",
        "location": "San Francisco, CA",
        "isPast": false,
        "tenureMonths": 45,
        "tenureYears": 3.75,
        "confidence": "high"
      },
      {
        "name": "John Smith",
        "title": "Product Manager",
        "startDate": "2019",
        "endDate": "2022",
        "profileUrl": "https://linkedin.com/in/johnsmith",
        "location": "New York, NY",
        "isPast": true,
        "tenureMonths": 36,
        "tenureYears": 3.0,
        "confidence": "medium"
      }
    ],
    "stats": {
      "count": 42,
      "currentCount": 30,
      "pastCount": 12,
      "mean": 28.5,
      "median": 24.0,
      "p25": 15.0,
      "p75": 38.0,
      "p90": 54.0,
      "min": 3,
      "max": 120,
      "histogram": {
        "0-6m": 5,
        "6-12m": 8,
        "1-2y": 12,
        "2-3y": 9,
        "3-5y": 6,
        "5-10y": 2,
        "10y+": 0
      },
      "dataQuality": {
        "missingStartDate": 0,
        "missingEndDate": 3,
        "ambiguousDates": 5
      }
    }
  },
  "settings": {
    "maxEmployees": 50,
    "enablePastEmployees": true,
    "theme": "auto"
  },
  "cache": {}
}
```

### Test Coverage Mapping

| Module | Unit | Integration | E2E | Total |
|--------|------|-------------|-----|-------|
| tenure-calculator | 95% | - | - | 95% |
| statistics-engine | 95% | - | - | 95% |
| date-parser | 90% | - | - | 90% |
| employee-extractor | 85% | - | - | 85% |
| message-router | 70% | 85% | - | 82% |
| storage-manager | 60% | 90% | - | 80% |
| content-analyzer | 65% | 80% | 90% | 78% |
| ui-manager | 70% | - | 85% | 75% |
| **Overall** | **78%** | **85%** | **88%** | **83%** ✅ |

### Architecture Diagram (ASCII)

```
┌────────────────────────────────────────────────────────────────┐
│                    LINKEDIN COMPANY PAGE                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Company Header                                          │  │
│  │  ┌───────────────────────────────────┐                  │  │
│  │  │ [📊 Analyze Tenure]  ← Injected  │                  │  │
│  │  └───────────────────────────────────┘                  │  │
│  │                                                          │  │
│  │  People Section                                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │ Employee 1  │ │ Employee 2  │ │ Employee 3  │       │  │
│  │  │ Title       │ │ Title       │ │ Title       │       │  │
│  │  │ Jan 2021    │ │ 2020        │ │ Mar 2022    │       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ DOM Parsing
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                     CONTENT SCRIPT                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐        │
│  │   Extractor  │→ │  Pagination   │→ │  UI Manager  │        │
│  └──────────────┘  └───────────────┘  └──────────────┘        │
│                              │                                 │
│                              │ runtime.sendMessage             │
└──────────────────────────────┼─────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    SERVICE WORKER                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐        │
│  │   Validator  │→ │ Tenure Calc   │→ │   Stats Eng  │        │
│  └──────────────┘  └───────────────┘  └──────────────┘        │
│                              │                                 │
│                              │ chrome.storage.local.set        │
└──────────────────────────────┼─────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                   CHROME STORAGE (LOCAL)                       │
│  {                                                             │
│    lastAnalysis: { stats, processed, timestamp },              │
│    settings: { maxEmployees, enablePast },                     │
│    cache: { ... }                                              │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ chrome.storage.local.get
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        POPUP UI                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tenure Analysis Results                                 │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                       │  │
│  │  │ Median │ │  Mean  │ │ Count  │                       │  │
│  │  │  24m   │ │ 28.5m  │ │   42   │                       │  │
│  │  └────────┘ └────────┘ └────────┘                       │  │
│  │                                                          │  │
│  │  ████████████▌ Histogram                                │  │
│  │  ██████████                                              │  │
│  │  ████████████████                                        │  │
│  │                                                          │  │
│  │  [Export CSV]  [Export JSON]                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 13. Acceptance Criteria & Review Checklist

### Pass/Fail Criteria

#### UX Criteria
- [ ] ✅ "Analyze" button appears on all company pages within 2 seconds of page load
- [ ] ✅ Analysis completes in < 15 seconds for 50 employees
- [ ] ✅ Progress indicator updates at least every 5 employees
- [ ] ✅ Results display correctly formatted statistics (no NaN, Infinity, or negative values)
- [ ] ✅ Export generates valid CSV/JSON files
- [ ] ✅ All UI elements keyboard-navigable
- [ ] ✅ Screen reader announces status updates

#### Analytics Criteria
- [ ] ✅ Tenure calculated accurately (validated against manual calculation on 10 test cases)
- [ ] ✅ Histogram bins sum to total employee count
- [ ] ✅ Median falls between P25 and P75
- [ ] ✅ Handles missing data without crashing (excludes incomplete records)
- [ ] ✅ Confidence scoring correctly assigns high/medium/low

#### Coverage Criteria
- [ ] ✅ Overall test coverage ≥80%
- [ ] ✅ Critical modules (tenure, stats) coverage ≥95%
- [ ] ✅ All E2E scenarios pass in headless Chrome
- [ ] ✅ No untested error paths in core logic

#### Performance Criteria
- [ ] ✅ Extension bundle size < 1MB (uncompressed)
- [ ] ✅ Memory usage < 50MB during analysis
- [ ] ✅ No DOM operations blocking main thread > 100ms
- [ ] ✅ Popup opens in < 500ms

#### Compliance Criteria
- [ ] ✅ Consent dialog shown on first use
- [ ] ✅ No external network requests (verified via Network Inspector)
- [ ] ✅ Data stored only in chrome.storage.local
- [ ] ✅ Clear data functionality works
- [ ] ✅ Privacy policy accessible from options page
- [ ] ✅ Extension name avoids LinkedIn trademark

### Stakeholder Sign-Off

| Role | Reviewer | Status | Date |
|------|----------|--------|------|
| **Engineering Lead** | - | ⬜ Pending | - |
| **Product Manager** | - | ⬜ Pending | - |
| **Legal/Compliance** | - | ⬜ Pending | - |
| **Security** | - | ⬜ Pending | - |
| **QA Lead** | - | ⬜ Pending | - |
| **Accessibility SME** | - | ⬜ Pending | - |

### Pre-Launch Checklist

- [ ] All automated tests passing in CI
- [ ] Manual testing on Windows, Mac, Linux
- [ ] Tested on Chrome versions 120, 121, 122
- [ ] Privacy policy published
- [ ] Support email/contact form set up
- [ ] Extension listing drafted (title, description, screenshots)
- [ ] Store assets ready (icon, promo images, video demo)
- [ ] Monitoring/error tracking configured (e.g., Sentry)
- [ ] User documentation written
- [ ] Rollback plan documented

---

## Appendix

### Technology Stack

- **Language**: TypeScript 5.2+
- **Build Tool**: Vite 5.0 + Rollup
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Linting**: ESLint + Prettier
- **UI Framework**: Vanilla JS + Web Components (lightweight)
- **Charts**: Chart.js (lightweight histogram rendering)
- **Sanitization**: DOMPurify
- **CI/CD**: GitHub Actions
- **Version Control**: Git + Conventional Commits

### Key Dependencies

```json
{
  "dependencies": {
    "dompurify": "^3.0.6",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.254",
    "@types/dompurify": "^3.0.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "archiver": "^6.0.1"
  }
}
```

### File Structure

```
linkedin-tenure-analyzer/
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── analyzer.ts
│   │   ├── extractors/
│   │   │   └── employee-extractor.ts
│   │   ├── pagination-handler.ts
│   │   ├── ui-manager.ts
│   │   └── styles.css
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.ts
│   │   └── styles.css
│   ├── options/
│   │   ├── index.html
│   │   └── options.ts
│   ├── analytics/
│   │   ├── tenure-calculator.ts
│   │   ├── statistics-engine.ts
│   │   └── histogram-generator.ts
│   ├── utils/
│   │   ├── date-parser.ts
│   │   ├── rate-limiter.ts
│   │   ├── storage-manager.ts
│   │   └── validators.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── package.js
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── manifest.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Summary

This system design provides a comprehensive, production-ready blueprint for a LinkedIn Company Tenure Analyzer Chrome Extension (MV3). Key highlights:

1. **Compliance-First**: User-consented, on-page parsing with explicit ToS guardrails
2. **Robust Architecture**: Service worker, content scripts, and structured message passing
3. **Privacy-Respecting**: Local-only storage, no external requests, clear user controls
4. **Well-Tested**: ≥80% coverage with unit, integration, and E2E tests
5. **Production-Ready**: CI/CD automation, semantic versioning, security scanning
6. **Accessible**: WCAG 2.1 AA, keyboard navigation, screen reader support
7. **Maintainable**: TypeScript, modular design, comprehensive documentation

**Next Steps:**
1. Set up repository structure
2. Implement core modules (tenure calculator, statistics engine)
3. Build content script with fallback selectors
4. Create UI components with accessibility features
5. Write comprehensive test suite
6. Configure CI/CD pipeline
7. Legal/compliance review
8. User acceptance testing
9. Publish to Chrome Web Store

Total estimated development time: **6-8 weeks** (2 engineers)

