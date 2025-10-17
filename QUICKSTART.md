# Quick Start Guide

Get the LinkedIn Tenure Analyzer up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Chrome 120+ browser
- Basic command line knowledge

## Installation

```bash
# 1. Clone and navigate
git clone https://github.com/yourusername/linkedin-tenure-analyzer.git
cd linkedin-tenure-analyzer

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

## Load in Chrome

1. Open `chrome://extensions/` in Chrome
2. Toggle **Developer mode** ON (top-right)
3. Click **Load unpacked**
4. Select the `dist` folder from your project
5. ✅ Extension loaded!

## Try It Out

1. Go to `https://www.linkedin.com/company/google/`
2. Click **📊 Analyze Tenure** button
3. Wait ~10 seconds for analysis
4. View results! 🎉

## Development Mode

Want to make changes?

```bash
# Start development with auto-rebuild
npm run dev

# In another terminal, run tests
npm test
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development build with watch |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run lint` | Check code quality |
| `npm run package` | Create distributable ZIP |

## Project Structure (Simplified)

```
linkedin-tenure-analyzer/
├── src/
│   ├── analytics/      # Tenure calculations
│   ├── background/     # Service worker
│   ├── content/        # Content script & UI
│   ├── popup/          # Extension popup
│   ├── options/        # Settings page
│   └── utils/          # Helpers
├── tests/              # Unit tests
└── manifest.json       # Extension config
```

## Key Files

- `src/content/analyzer.ts` - Main analysis logic
- `src/analytics/tenure-calculator.ts` - Tenure calculation
- `src/analytics/statistics-engine.ts` - Statistics generation
- `manifest.json` - Extension configuration

## Making Changes

1. Edit files in `src/`
2. Build: `npm run build`
3. Reload extension in Chrome
4. Test your changes

## Common Tasks

### Add a new statistic

Edit `src/analytics/statistics-engine.ts`:

```typescript
calculate(employees: ProcessedEmployee[]): TenureStatistics {
  // Add your calculation here
  const myNewStat = calculateMyNewStat(employees);
  
  return {
    // ... existing stats
    myNewStat,  // Add to return object
  };
}
```

### Modify UI

Edit `src/content/ui-manager.ts` or `src/popup/popup.ts`

### Add a test

Create file in `tests/unit/`:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('does something', () => {
    expect(true).toBe(true);
  });
});
```

## Debugging

### View Console Logs

- **Content Script**: Right-click page → Inspect → Console
- **Service Worker**: Extensions page → Details → Inspect views: service worker
- **Popup**: Right-click popup → Inspect

### Check for Errors

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test
```

## Need Help?

- 📖 Full guide: [SETUP.md](SETUP.md)
- 🏗️ Architecture: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)
- 🤝 Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/linkedin-tenure-analyzer/issues)

## What's Next?

1. ✅ Read the full [README.md](README.md)
2. ✅ Explore the [system design](SYSTEM_DESIGN.md)
3. ✅ Check out [open issues](https://github.com/yourusername/linkedin-tenure-analyzer/issues)
4. ✅ Make your first contribution!

Happy hacking! 🚀

