# Open-AIRSS

> A minimalist web frontend for self-hosted RSS aggregators.

Open-AIRSS is an open-source reading interface for any RSS aggregator that supports the Google Reader API (FreshRSS, Miniflux, etc.). Clean interface, no tracking, no cloud, no nonsense.

---

## Features

- Three-panel reading interface (feeds / articles / content)
- 6 themes — 3 dark (Catppuccin Mocha, Tokyo Night, Rosé Pine) and 3 light (Catppuccin Latte, One Light, Flexoki Light)
- 10 font choices, persistent across sessions
- Full keyboard navigation
- Compatible with any Google Reader API backend (FreshRSS, Miniflux, Nextcloud News...)
- Docker-ready — one command to deploy
- No telemetry, no third-party requests

---

## Screenshots

_Coming soon._

---

## Getting Started

### With Docker (recommended)

```bash
git clone https://github.com/MarioGervais/open-airss.git
cd open-airss
cp .env.example .env
# Edit .env with your FreshRSS/Miniflux server URL
docker compose up --build -d
```

Then open `http://localhost:3000` in your browser.

### Manual install

```bash
npm install
npm run dev
```

---

## Configuration

Copy `.env.example` to `.env` and fill in the values:

```env
PUBLIC_API_URL=https://your-freshrss-instance.example.com
```

> **Note:** In the login form, use your FreshRSS **API password** — not your regular login password. You can find it under your FreshRSS profile settings.

---

## Compatible Backends

| Backend        | API                    | Status    |
| -------------- | ---------------------- | --------- |
| FreshRSS       | Google Reader          | Supported |
| Miniflux       | Google Reader          | Supported |
| Nextcloud News | Google Reader          | Supported |
| Tiny Tiny RSS  | Google Reader (plugin) | Untested  |

---

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) + TypeScript
- CSS custom properties (no framework)
- Docker + Node.js for production

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

- [Report a bug](.github/ISSUE_TEMPLATE/bug_report.md)
- [Request a feature](.github/ISSUE_TEMPLATE/feature_request.md)

---

## License

[GNU Affero General Public License v3.0](LICENSE)

You are free to use, modify, and distribute this software under the terms of the AGPL-3.0. Any modifications deployed over a network must also be released under the same license.

---

## Acknowledgements

Inspired by [Miniflux](https://miniflux.app/) and [Reminiflux](https://github.com/reminiflux/reminiflux).

```

Tu peux coller ça directement à Claude Code :
```

Replace the content of README.md with the following: [colle le texte]
