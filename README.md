# Steam → GOG Checker

Browser extension that displays a banner above the purchase area on a Steam game page when that game is also available on GOG.com — with the current GOG price and a direct link.

![screenshot placeholder](docs/screenshot.png)

## Install

**Easiest**: grab the latest version from the [Releases](../../releases) page for your browser:

- `steam-gog-checker-chromium-vX.Y.Z.zip` — Chrome / Edge / Brave / Opera / Vivaldi
- `steam-gog-checker-firefox-vX.Y.Z.zip` — Firefox 113+
- `steam-gog-checker-firefox-vX.Y.Z.xpi` — Firefox (for AMO signing / permanent install)

**→ Full step-by-step guide: [INSTALL.md](./INSTALL.md)** (covers Chromium sideloading, Firefox temporary install, AMO self-signing, and Developer Edition / Nightly setup).

Per-variant notes:

- [`chromium/`](./chromium/) — Chrome / Edge / Brave (Manifest V3, service worker)
- [`firefox/`](./firefox/) — Firefox 113+ (Manifest V3, event page)

The functional code is identical between variants; only `manifest.json` differs.

## Build locally

```bash
# Chromium
cd chromium && zip -r ../steam-gog-checker-chromium.zip . && cd ..

# Firefox
cd firefox && zip -r ../steam-gog-checker-firefox.zip . && cd ..
```

Or use GitHub Actions: pushing a `vX.Y.Z` tag automatically builds both archives and publishes a Release.

## How it works

1. A content script runs on `store.steampowered.com/app/*`
2. It reads the game name from the Steam DOM (`#appHubAppName`)
3. It asks a background service worker to search `catalog.gog.com` for that name
4. A 3-tier matching algorithm (exact → prefix → Jaccard similarity >= 0.7) picks the best candidate
5. If a match is found, a banner is injected above the Steam purchase area

## Security audit

Built with least-privilege principles.

- **No `innerHTML` with external data** — all DOM insertions use `createElement` + `textContent`. No XSS surface even if the GOG API returned malicious HTML.
- **URL validation** — banner `href` must parse as an absolute URL, use `https:`, and point to `www.gog.com` or `gog.com`. Anything else is rejected and no banner is injected.
- **Minimal permissions** — `declarativeNetRequestWithHostAccess` plus two `host_permissions` (Steam + catalog.gog.com). No `tabs`, `storage`, `cookies`, `webRequest`.
- **DNR rule scoped** to service worker requests only via `tabIds: [-1]`. Third-party sites are unaffected.
- **`credentials: 'omit'`** on all fetches to GOG, no cookies sent.
- **No telemetry**, no third-party servers, no personal data transmitted — only the game name shown on the Steam page is sent to GOG.
- **Currency whitelist** — only `EUR`, `USD`, `GBP` are mapped to symbols; unknown values are dropped.
- **Discount parsed as `parseFloat`** before display.

Full details in [`chromium/README.md`](./chromium/README.md#security).

## Roadmap

- [ ] Local cache (`chrome.storage.local`) with 24 h TTL
- [ ] Itch.io support in parallel
- [ ] Bidirectional check (Steam badge on GOG pages)
- [ ] Popup UI to configure country / currency
- [ ] Highlight when the GOG price beats the Steam price

## About this project

This extension was vibe-coded with [Claude](https://claude.ai) (Anthropic) as a pair-programming assistant, then iterated against real Steam pages until it behaved. The security section above documents the guardrails applied during development — no `innerHTML` on external data, URL validation, minimal permissions, scoped DNR rule — but the code hasn't gone through external audit.

Treat it like the personal-use browser extension it is: audit it yourself before installing if you care, open an issue if something looks off, and don't ship it to production critical paths.

## License

MIT. See [`LICENSE`](./LICENSE).

## Disclaimer

Personal project, not affiliated with Valve/Steam or GOG.com / CD PROJEKT. "Steam" and "GOG" trademarks belong to their respective owners.
