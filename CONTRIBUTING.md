# Contributing to LinkedIn Tenure Analyzer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkedin-tenure-analyzer.git
   cd linkedin-tenure-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development build**
   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Define types for all function parameters and return values
- Avoid `any` types unless absolutely necessary
- Use interfaces for object shapes

### Code Style

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Keep functions focused and small (< 50 lines preferred)
- Add JSDoc comments for exported functions

### Testing

- Write unit tests for all new features
- Maintain ≥80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

```typescript
// Good
describe('TenureCalculator', () => {
  it('calculates tenure for past employee with end date', () => {
    // ...
  });
});

// Avoid
describe('TenureCalculator', () => {
  it('works', () => {
    // ...
  });
});
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test additions or changes
   - `refactor:` - Code refactoring
   - `chore:` - Build process or auxiliary tool changes

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Clear description of changes
   - All CI checks passing
   - Test coverage maintained or improved
   - No merge conflicts
   - At least one approval from maintainers

## Reporting Issues

When reporting bugs, please include:

- Extension version
- Chrome version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (if any)

## Feature Requests

For feature requests:

- Clearly describe the feature
- Explain the use case
- Provide examples if possible
- Consider implementation complexity

## Code Review

All submissions require code review. We use GitHub pull requests for this purpose. Here's what reviewers look for:

- Code quality and maintainability
- Test coverage
- Documentation
- Performance implications
- Security considerations
- Accessibility compliance

## Community Guidelines

- Be respectful and constructive
- Welcome newcomers
- Help others learn
- Focus on the code, not the person
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## Questions?

- Open a [Discussion](https://github.com/yourusername/linkedin-tenure-analyzer/discussions)
- Comment on existing issues
- Ask in your PR

Thank you for contributing! 🎉

