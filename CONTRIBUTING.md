# Contributing to sanity-plugin-content-sync

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sanity-plugin-content-sync.git
cd sanity-plugin-content-sync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Sanity tokens
```

4. Run type checking:
```bash
npm run type-check
```

5. Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── api/           # API endpoint handlers
├── components/    # React UI components
├── hooks/         # React hooks
├── lib/           # Core library code
│   ├── diff/      # Diff algorithms
│   ├── merge/     # Merge policies
│   └── transaction/ # Transaction execution
├── schemas/       # Sanity schemas
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new features

## Testing

- Write unit tests for core logic in `lib/`
- Add integration tests for API endpoints
- Test UI components with user interactions

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Run `npm run lint` and `npm test`
5. Update documentation if needed
6. Submit a pull request

## Commit Messages

Use conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Build/tooling changes

Example: `feat: add smart merge policy for arrays`

## Questions?

Open an issue or start a discussion!
