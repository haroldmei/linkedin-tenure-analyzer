# LinkedIn Company Tenure Analyzer

A Chrome extension that analyzes employee tenure distributions on LinkedIn company pages with one click.

## Features

- 📊 **One-Click Analysis** - Get instant insights into employee tenure patterns
- 📈 **Comprehensive Statistics** - Mean, median, percentiles, and distribution histograms
- 📥 **Export Data** - Download results in CSV or JSON format
- 🔒 **Privacy-Focused** - All data stored locally, no external servers
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation
- 🎨 **Modern UI** - Clean, intuitive interface with dark mode support

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/linkedin-tenure-analyzer.git
   cd linkedin-tenure-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

Run the development build with auto-reload:
```bash
npm run dev
```

## Usage

1. Navigate to any LinkedIn company page (e.g., `https://www.linkedin.com/company/google/`)
2. Click the "📊 Analyze Tenure" button that appears near the company header
3. Wait for the analysis to complete
4. View statistics and export data as needed

## Project Structure

```
linkedin-tenure-analyzer/
├── src/
│   ├── analytics/          # Tenure calculation and statistics
│   ├── background/         # Service worker
│   ├── content/            # Content scripts and UI
│   ├── popup/             # Extension popup
│   ├── options/           # Settings page
│   ├── types/             # TypeScript definitions
│   └── utils/             # Shared utilities
├── tests/                 # Unit and integration tests
├── assets/               # Icons and images
└── scripts/              # Build scripts
```

## Development

### Available Scripts

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests with coverage
- `npm run package` - Create distributable ZIP file

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:unit

# Run specific test file
npx vitest tests/unit/analytics/tenure-calculator.test.ts
```

### Code Quality

This project follows industry best practices:

- **TypeScript** with strict mode
- **ESLint** for code linting
- **Prettier** for code formatting
- **Vitest** for unit testing
- **≥80% test coverage** requirement

## Architecture

### Manifest V3 Components

- **Service Worker** - Background processing, data transformation, statistics calculation
- **Content Script** - DOM parsing, UI injection, user interaction handling
- **Popup UI** - Results display and export functionality
- **Options Page** - User settings and data management

### Data Flow

```
User Click → Content Script → Parse DOM → Service Worker → 
Calculate Stats → Storage → Display Results
```

## Privacy & Compliance

- ✅ **Local Storage Only** - No data sent to external servers
- ✅ **User-Initiated** - Analysis only runs when you click the button
- ✅ **ToS Compliant** - Parses only visible, user-accessible data
- ✅ **Transparent** - Open source code for full transparency

## Configuration

Configure the extension through the options page:

- **Max Employees** - Limit analysis to 10-100 profiles
- **Include Past Employees** - Toggle past employee analysis
- **Theme** - Auto, light, or dark mode

## Browser Support

- Chrome 120+
- Edge 120+ (Chromium-based)
- Other Chromium browsers with Manifest V3 support

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass and coverage ≥80%
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Disclaimer

This is an **unofficial tool** not affiliated with, endorsed by, or connected to LinkedIn Corporation. Use at your own risk and in accordance with LinkedIn's Terms of Service.

## Support

- 🐛 [Report Issues](https://github.com/yourusername/linkedin-tenure-analyzer/issues)
- 💬 [Discussions](https://github.com/yourusername/linkedin-tenure-analyzer/discussions)
- 📧 Email: support@example.com

## Roadmap

- [ ] Support for multiple languages
- [ ] Advanced filtering options
- [ ] Comparison between companies
- [ ] Historical trend analysis
- [ ] Team composition insights

---

**Made with ❤️ for the LinkedIn community**

