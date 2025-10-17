# 📊 LinkedIn Company Tenure Analyzer

A Chrome extension that analyzes employee tenure distributions on LinkedIn company pages with **one click**. Get instant insights into how long employees typically stay at a company.

---

## 🚀 For Users

### What is this tool?

The LinkedIn Company Tenure Analyzer helps you understand **employee stability and company culture** by showing:
- How long employees typically stay at a company
- Average tenure and turnover patterns
- Employee distribution across tenure ranges (0-6 months, 1-2 years, etc.)
- Data exported as CSV/JSON for further analysis

All analysis happens **locally on your computer** — we never send data to external servers.

### ⚡ Quick Start (5 Minutes)

#### Step 1a: Install the Extension from WebStore (coming soon)
1. Visit [Chrome Web Store](https://github.com/haroldmei/linkedin-tenure-analyzer/releases) 
2. Click **"Add to Chrome"**
3. Confirm the installation

#### Step 1b: Install the Extension manually
1. Visit [linkedin-tenure-analyzer Release](https://chrome.google.com/webstore) 
2. Click **"extension.zip"** to download the release
3. On your Chrome open [chrome://extensions](chrome://extensions), then drag **"extension.zip"** to it.

#### Step 2: Use It
1. Go to any LinkedIn company page (e.g., `linkedin.com/company/google/people/`)
2. Look for the **"📊 Analyze Tenure"** button near the company information
3. Click it and wait 2-3 minutes for analysis to complete
4. View results and download as CSV or JSON

**That's it!** 🎉

### 📊 Understanding Your Results

**Median Tenure**: The "middle" value — if median is 2.5 years, half the employees have been there longer, half shorter.

**Mean Tenure**: The average tenure across all employees.

**Quartiles (P25, P75)**: 
- **P25**: 25% of employees have been there shorter, 75% longer
- **P75**: 75% of employees have been there shorter, 25% longer

**Histogram**: Visual breakdown of employees across different tenure ranges.

### ⚙️ Settings

Click the extension icon → **Options** to configure:
- **Max Employees to Analyze**: 10-100 (higher = more comprehensive but slower)
- **Include Past Employees**: Include former employees in analysis (if available)
- **Theme**: Light, dark, or auto (matches your system)

### ❓ FAQ

**Q: Is this safe?**  
A: Yes! The extension only reads publicly visible LinkedIn data and stores everything locally on your device. We never upload data anywhere.

**Q: Why does it take a few minutes?**  
A: The extension visits each employee's profile to extract accurate hire dates. LinkedIn limits requests to prevent overload, so we wait between visits.

**Q: Does LinkedIn allow this?**  
A: The extension uses publicly available data that you can see on LinkedIn. However, use responsibly and check LinkedIn's Terms of Service.

**Q: Can I analyze past employees?**  
A: Yes! If available on the company page, enable "Include Past Employees" in settings.

**Q: What if I see fewer employees than expected?**  
A: Some companies limit visibility of their People section. The extension analyzes whatever is available to your account.

### 📥 Exporting Data

After analysis completes:
1. Click **"Download CSV"** or **"Download JSON"**
2. Use the data in Excel, Google Sheets, or your analysis tool

**CSV format** includes: Name, Title, Start Date, Location, Tenure (months/years)

### 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Button doesn't appear | Reload the page; make sure you're on a company page (not posts/jobs) |
| Analysis fails | Check your internet connection; try on a different company |
| Takes too long | Reduce "Max Employees" in settings or close other tabs |
| Results seem incomplete | LinkedIn may have limited visibility; this is normal |

### 📧 Need Help?

- [Report Issues](https://github.com/haroldmei/linkedin-tenure-analyzer/issues)
- [Ask Questions](https://github.com/haroldmei/linkedin-tenure-analyzer/discussions)

---

## 👨‍💻 For Developers & Contributors

### Project Overview

This is a **Manifest V3 Chrome extension** built with:
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **Vitest** - Unit testing framework
- **ESLint + Prettier** - Code quality

**Key Challenge**: LinkedIn is a Single Page Application (SPA) with dynamically loaded content. The extension:
1. Finds employee cards in the "People you may know" section
2. Visits each employee's profile
3. Extracts hire dates from their work history
4. Calculates tenure statistics
5. Displays results with export options

### 🛠️ Development Setup

#### Prerequisites
- Node.js 18+ 
- npm or yarn
- Chrome/Chromium browser
- Git

#### Installation

```bash
# Clone repository
git clone https://github.com/haroldmei/linkedin-tenure-analyzer.git
cd linkedin-tenure-analyzer

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev
```

#### Load Extension Locally

1. Go to `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this project
5. Extension will reload automatically on code changes

### 📁 Project Structure

```
linkedin-tenure-analyzer/
├── src/
│   ├── analytics/              # Statistics calculation
│   │   ├── tenure-calculator.ts    # Parse dates → tenure months
│   │   └── statistics-engine.ts    # Calculate medians, percentiles, etc.
│   │
│   ├── background/             # Service Worker (background processing)
│   │   └── service-worker.ts       # Message handling, data processing
│   │
│   ├── content/                # Content Scripts (runs on LinkedIn)
│   │   ├── analyzer.ts             # Main analysis orchestrator
│   │   ├── employee-extractor.ts   # Extract data from profiles
│   │   ├── pagination-handler.ts   # Load all employee cards
│   │   ├── ui-manager.ts           # Inject button & results UI
│   │   ├── selectors.ts            # CSS selectors for DOM parsing
│   │   └── styles.css              # Content script styles
│   │
│   ├── popup/                  # Popup UI (results display)
│   │   ├── popup.ts
│   │   ├── index.html
│   │   └── styles.css
│   │
│   ├── options/                # Settings page
│   │   ├── options.ts
│   │   ├── index.html
│   │   └── styles.css
│   │
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts
│   │
│   └── utils/                  # Shared utilities
│       ├── date-parser.ts          # Parse "Jan 2020" format
│       ├── rate-limiter.ts         # Throttle API calls
│       ├── storage-manager.ts      # Chrome storage wrapper
│       └── validators.ts           # Input validation
│
├── tests/
│   └── unit/
│       ├── analytics/          # Tenure calculation tests
│       ├── content/            # DOM parsing tests
│       └── utils/              # Utility tests
│
├── dist/                       # Build output (DO NOT COMMIT)
├── manifest.json               # Extension configuration
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config (main bundle)
├── vite.content.config.ts      # Vite config (content script)
└── vitest.config.ts            # Testing config
```

### 🔄 Data Flow

```
LinkedIn Company Page
    ↓
[User clicks "Analyze Tenure" button]
    ↓
Content Script (analyzer.ts)
    ├→ Expand "People you may know" section
    ├→ Get employee cards (pagination-handler.ts)
    ├→ For each employee:
    │   ├→ Extract profile URL (employee-extractor.ts)
    │   ├→ Load profile in hidden iframe
    │   └→ Parse hire date from work history
    └→ Send data to Service Worker
         ↓
    Service Worker (service-worker.ts)
    ├→ Parse dates to tenure months (tenure-calculator.ts)
    ├→ Calculate statistics (statistics-engine.ts)
    ├→ Store results locally (storage-manager.ts)
    └→ Send back to popup
         ↓
    Popup UI (popup.ts)
    ├→ Display statistics
    └→ Export as CSV/JSON
```

### 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:unit

# Run specific test file
npx vitest tests/unit/analytics/tenure-calculator.test.ts

# Watch mode (auto-rerun on changes)
npx vitest --watch
```

**Coverage Target**: ≥80% for all metrics (lines, functions, branches)

### 🔨 Build Commands

```bash
npm run dev           # Development build with watch mode
npm run build         # Production build (optimized)
npm run lint          # Check code quality
npm run type-check    # Verify TypeScript
npm run package       # Create distributable ZIP
```

### 📋 Key Technical Decisions

1. **Iframe-based Profile Loading**: 
   - Why: LinkedIn profiles are SPAs; fetching HTML doesn't work because content is loaded via JavaScript
   - Solution: Load profiles in hidden iframes to ensure DOM is fully rendered
   - Trade-off: Slower than fetching HTML, but accurate

2. **Rate Limiting (10s between profile visits)**:
   - Why: LinkedIn enforces rate limits to prevent abuse
   - Implementation: `EmployeeExtractor` tracks last fetch time and waits if needed

3. **Local Storage Only**:
   - Why: Privacy & compliance with LinkedIn ToS
   - All data stored in `chrome.storage.local` (encrypted by browser)

4. **CSS Selectors with Fallbacks**:
   - Why: LinkedIn frequently changes UI class names
   - Solution: Multiple selectors tried in order, first match wins

### 🐛 Common Issues & Solutions

**Issue**: Extension not showing button on company page
```
Solution: 
- Check DevTools console for errors
- Verify page URL matches pattern: /company/[name]/
- Reload extension (chrome://extensions → reload button)
```

**Issue**: "No employee data found" error
```
Solution:
- You're on the wrong company page section (not "People")
- Some companies restrict access to their people list
- Try a different company
```

**Issue**: Tests failing after code change
```
Solution:
- Run: npm test -- --reporter=verbose
- Check error message for specific failing assertions
- Look at similar passing tests for patterns
```

### 📝 Contributing Guidelines

#### Before You Start
1. Check [open issues](https://github.com/haroldmei/linkedin-tenure-analyzer/issues)
2. Read [CONTRIBUTING.md](CONTRIBUTING.md)
3. Discuss major changes in an issue first

#### Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test
npm run lint

# Commit with clear messages
git commit -m "feat: add new feature description"

# Push and open Pull Request
git push origin feature/your-feature-name
```

#### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier (auto-fixed on save)
- **Linting**: ESLint + TypeScript rules
- **Comments**: Explain *why*, not what (code explains what)

```typescript
// ❌ Don't
// Get visible employees
const employees = this.getVisibleEmployees();

// ✅ Do
// Load only visible employees to avoid DOM thrashing
// and improve performance on large People sections
const employees = this.getVisibleEmployees();
```

#### Testing Requirements

- Write tests for new features
- Test edge cases and error handling
- Aim for ≥80% coverage
- Use descriptive test names

```typescript
describe('TenureCalculator', () => {
  it('should calculate months correctly for full years', () => {
    const startDate = 'Jan 2020';
    const result = calculator.parseToMonths(startDate);
    expect(result).toBeGreaterThan(0);
  });

  it('should handle invalid dates gracefully', () => {
    const result = calculator.parseToMonths('Invalid');
    expect(result).toBeNull();
  });
});
```

### 🔗 Useful Resources

- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 🚀 Future Improvements

See [ROADMAP.md](ROADMAP.md) for planned features:
- [ ] Compare multiple companies
- [ ] Historical trend analysis
- [ ] Team composition insights
- [ ] Department-level analysis
- [ ] Integration with data analysis tools

---

## 📋 Specifications

### Browser Support

- Chrome 120+
- Edge 120+ (Chromium-based)
- Other Manifest V3 compatible browsers

### Performance

- Analysis time: 2-5 minutes for 50 employees (depends on internet)
- Profile load: ~10 seconds per employee (rate-limited)
- Memory: <50MB during analysis

### Data Privacy

- ✅ No external servers
- ✅ No tracking
- ✅ Local-only storage
- ✅ Open source code

---

## 📄 License & Disclaimer

**License**: MIT - see [LICENSE](LICENSE)

**Disclaimer**: This is an **unofficial tool** not affiliated with, endorsed by, or connected to LinkedIn Corporation. Use at your own risk and in accordance with [LinkedIn's Terms of Service](https://www.linkedin.com/legal/user-agreement).

---

## 📞 Support & Community

- 🐛 [Report a Bug](https://github.com/haroldmei/linkedin-tenure-analyzer/issues)
- 💬 [Ask a Question](https://github.com/haroldmei/linkedin-tenure-analyzer/discussions)
- ✨ [Request a Feature](https://github.com/haroldmei/linkedin-tenure-analyzer/issues)
- 👥 [Join our Community](https://github.com/haroldmei/linkedin-tenure-analyzer)

---

**Made with ❤️ for the LinkedIn community**

