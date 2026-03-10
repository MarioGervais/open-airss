# Contributing to Open-AIRSS

Thank you for your interest in contributing. This document explains how to get involved, report issues, and submit changes.

---

## Code of Conduct

Be respectful. Constructive criticism is welcome; hostility is not.

---

## Ways to Contribute

- Report bugs
- Suggest features
- Improve documentation
- Submit code via pull requests

---

## Reporting Bugs

Before opening an issue, please check that it has not already been reported.

When filing a bug report, include:

- Your backend (FreshRSS, Miniflux, etc.) and its version
- Your browser and OS
- Steps to reproduce the issue
- Expected vs. actual behavior
- Any relevant logs or screenshots

---

## Suggesting Features

Open a feature request issue and describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternatives you considered

---

## Development Setup

### Requirements

- Node.js 20+
- npm 9+
- A running FreshRSS or Miniflux instance (or a test account)

### Local install

```bash
git clone https://github.com/your-username/open-airss.git
cd open-airss
npm install
cp .env.example .env
# Fill in your backend URL in .env
npm run dev
```

---

## Submitting a Pull Request

1. Fork the repository
2. Create a branch from `main`:
   ```bash
   git checkout -b fix/your-bug-description
   ```
3. Make your changes
4. Run the tests:
   ```bash
   npm run test
   ```
5. Run the linter:
   ```bash
   npm run lint
   ```
6. Commit with a clear message (see below)
7. Push and open a pull request against `main`

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description

Examples:
feat(reader): add keyboard shortcut for marking all as read
fix(api): handle expired session tokens correctly
docs(readme): update Docker instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Branch Naming

| Type     | Pattern                      |
| -------- | ---------------------------- |
| Feature  | `feat/short-description`     |
| Bug fix  | `fix/short-description`      |
| Docs     | `docs/short-description`     |
| Refactor | `refactor/short-description` |

---

## License

By contributing to Open-AIRSS, you agree that your contributions will be licensed under the [AGPL-3.0](LICENSE).
