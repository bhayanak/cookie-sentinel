# Contributing to Cookie Monster

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/user/cookie-monster.git
cd cookie-monster
pnpm install
pnpm dev
```

Load the `dist/` folder as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Code Style

- **TypeScript** for all source files
- **Prettier** for formatting (`pnpm format`)
- **ESLint** with security plugin (`pnpm lint`)
- Run `pnpm validate` before submitting a PR

## Testing

```bash
pnpm test              # Run tests
pnpm test:coverage     # With coverage (90%+ required)
```

All new features must include unit tests. Coverage thresholds are enforced:
- Lines: 90%
- Functions: 90%
- Statements: 90%
- Branches: 80%

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `pnpm validate` to ensure everything passes
5. Commit with conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
6. Push and open a Pull Request against `main`

## Reporting Issues

- Use GitHub Issues
- Include browser version, extension version, and steps to reproduce
- Screenshots or screen recordings are very helpful

## Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, email the maintainers directly.

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
