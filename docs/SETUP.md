# Setup Guide

This guide will help you set up the LinkedIn Tenure Analyzer extension for development.

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Chrome** 120 or higher
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/linkedin-tenure-analyzer.git
cd linkedin-tenure-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- TypeScript compiler
- Vite build tool
- Vitest testing framework
- ESLint and Prettier
- Chrome types

### 3. Build the Extension

#### Development Build (with watch mode)

```bash
npm run dev
```

This will:
- Build the extension in development mode
- Watch for file changes
- Automatically rebuild on changes

#### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Navigate to your project folder and select the `dist` directory
5. The extension should now appear in your extensions list

### 5. Test the Extension

1. Navigate to any LinkedIn company page (e.g., `https://www.linkedin.com/company/google/`)
2. Look for the "📊 Analyze Tenure" button near the company header
3. Click the button to run an analysis
4. View results in the popup

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:unit

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npx vitest tests/unit/analytics/tenure-calculator.test.ts
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npm run type-check

# Format code (if you have Prettier script)
npm run format
```

### Building for Production

```bash
# Build extension
npm run build

# Create distributable ZIP
npm run package
```

The packaged extension will be at `dist/extension.zip`.

## Project Structure

```
linkedin-tenure-analyzer/
├── src/
│   ├── analytics/          # Core analytics modules
│   │   ├── tenure-calculator.ts
│   │   └── statistics-engine.ts
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   ├── content/           # Content scripts
│   │   ├── analyzer.ts
│   │   ├── employee-extractor.ts
│   │   ├── pagination-handler.ts
│   │   ├── ui-manager.ts
│   │   └── styles.css
│   ├── popup/            # Extension popup
│   │   ├── index.html
│   │   ├── popup.ts
│   │   └── styles.css
│   ├── options/          # Settings page
│   │   ├── index.html
│   │   ├── options.ts
│   │   └── styles.css
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── utils/           # Shared utilities
│       ├── date-parser.ts
│       ├── rate-limiter.ts
│       ├── storage-manager.ts
│       └── validators.ts
├── tests/              # Test files
│   ├── unit/          # Unit tests
│   └── setup.ts       # Test setup
├── assets/            # Extension icons
├── scripts/           # Build scripts
├── .github/          # GitHub Actions workflows
├── manifest.json     # Extension manifest
├── vite.config.ts   # Vite configuration
└── tsconfig.json    # TypeScript configuration
```

## Configuration Files

### `manifest.json`

The Chrome extension manifest defining:
- Extension metadata
- Permissions
- Content scripts
- Background service worker
- Icons and UI pages

### `vite.config.ts`

Vite build configuration:
- Entry points for different scripts
- Path aliases
- Output configuration
- Static file copying

### `tsconfig.json`

TypeScript compiler configuration:
- Strict mode enabled
- Path aliases (`@/` → `src/`)
- Target ES2020

### `vitest.config.ts`

Test framework configuration:
- Coverage thresholds (≥80%)
- Test environment (jsdom)
- Path aliases

## Debugging

### Chrome DevTools

1. **Content Script**: Right-click on page → Inspect → Console tab
2. **Service Worker**: `chrome://extensions/` → Extension details → Service worker → Inspect
3. **Popup**: Right-click popup → Inspect

### Console Logging

The extension uses prefixed logging:
- `[Analyzer]` - Content script
- `[ServiceWorker]` - Background service worker
- `[EmployeeExtractor]` - DOM extraction

### Common Issues

#### Extension not loading

- Ensure `dist` folder exists (run `npm run build`)
- Check for manifest.json errors in extensions page
- Reload extension after changes

#### Button not appearing

- Verify you're on a LinkedIn company page
- Check content script injection in DevTools
- Look for console errors

#### Analysis failing

- Check Network tab for blocked requests
- Verify LinkedIn DOM structure hasn't changed
- Check service worker console for errors

## Hot Reload

For development with auto-reload:

1. Install [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
2. Run `npm run dev`
3. Extension will auto-reload on file changes

## Environment Variables

No environment variables required for basic development. For CI/CD:

- `GITHUB_TOKEN` - GitHub releases
- `CHROME_CLIENT_ID` - Chrome Web Store upload
- `CHROME_CLIENT_SECRET` - Chrome Web Store upload
- `CHROME_REFRESH_TOKEN` - Chrome Web Store upload

## Next Steps

1. Review the [System Design](SYSTEM_DESIGN.md) document
2. Read [Contributing Guidelines](CONTRIBUTING.md)
3. Check out [open issues](https://github.com/yourusername/linkedin-tenure-analyzer/issues)
4. Join our [discussions](https://github.com/yourusername/linkedin-tenure-analyzer/discussions)

## Getting Help

- 📖 [Documentation](README.md)
- 🐛 [Report Bug](https://github.com/yourusername/linkedin-tenure-analyzer/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/yourusername/linkedin-tenure-analyzer/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/yourusername/linkedin-tenure-analyzer/discussions)

Happy coding! 🚀

