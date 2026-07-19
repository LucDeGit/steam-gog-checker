# Steam → GOG Checker (Chromium / Edge / Brave)

Chromium variant of the extension. Uses Manifest V3 with a `service_worker` background.

## How it works

1. A content script runs on `store.steampowered.com/app/*`
2. It extracts the game name from the Steam DOM (`#appHubAppName`)
3. It asks the service worker to search `catalog.gog.com` for that name
4. A 3-tier matching algorithm (exact -> prefix -> Jaccard similarity >= 0.7) selects the best candidate
5. If a match is found, a banner is injected above the Steam purchase area

## Install

1. Clone or download this folder
2. Open `edge://extensions/` (or `chrome://extensions/`, `brave://extensions/`)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `chromium/` folder
5. Visit any Steam game page

## Security

Built with least-privilege principles.

### Permissions requested

| Permission | Why |
|------------|-----|
| `declarativeNetRequestWithHostAccess` | Rewrite the CORS response header from `catalog.gog.com` (which restricts origin to `https://www.gog.com`). Required so the service worker can read the response. |
| `host_permissions: store.steampowered.com/*` | Inject the content script on Steam pages. |
| `host_permissions: catalog.gog.com/*` | Allow the service worker to query the GOG API. |

No `tabs`, `storage`, `cookies`, `webRequest`, `activeTab`, or similar broad permissions.

### Scoped `declarativeNetRequest` rule

`rules.json` rewrites response headers only for `catalog.gog.com` and only for requests initiated by the extension's service worker (`tabIds: [-1]`). No third-party page requests are affected.

### No `innerHTML` with external data

All data coming from the GOG API (titles, prices, currencies, URLs) is inserted into the DOM via `document.createElement` and `Element.textContent`. No XSS surface even if the API returned malicious HTML.

### URL validation

The banner's destination URL (`href`) is validated before use:
- Must parse as an absolute URL
- Protocol must be `https:`
- Hostname must be `www.gog.com` or `gog.com`

Any rejected URL -> no banner is injected.

### Outgoing requests

- Single destination: `https://catalog.gog.com/v1/catalog?query=...`
- `credentials: 'omit'` (no cookies sent)
- No personal data transmitted, only the game name shown on the Steam page is sent to GOG
- No telemetry, no tracking, no third-party servers

### Currency / injections

The currency returned by GOG is filtered via strict whitelist (`EUR` -> `€`, `USD` -> `$`, `GBP` -> `£`; anything else is dropped). The discount percentage is parsed with `parseFloat` before display.

## Configuration

Two parameters are hardcoded but easy to change:

- **Country / currency** in `background.js`: `countryCode=BE&currencyCode=EUR`. Change to `FR/EUR`, `US/USD`, etc. to match your region.
- **Matching threshold** in `content.js`: `if (scored[0].score >= 0.7)`. Lower for more permissive matches, higher for stricter.

## Debug

Open the console (F12) on a Steam game page. All logs are prefixed with `[Steam->GOG]`. Service worker logs are relayed to the same console under `[Steam->GOG] [SW]`.

Example output for a successful match:

```
[Steam->GOG] steam game name: "Hades"
[Steam->GOG] strategies: ["Hades"]
[Steam->GOG] [SW] query = "Hades"
[Steam->GOG] [SW] HTTP 200
[Steam->GOG] [SW] 5 products
[Steam->GOG] exact match: Hades
[Steam->GOG] banner injected in #game_area_purchase
```

## Known limitations

- **False negatives** are possible when the Steam and GOG titles diverge too much (odd editions, different subtitles). The 0.7 Jaccard threshold favors precision over recall.
- **No cache** — every Steam page load triggers one request to catalog.gog.com. See roadmap.
- The `catalog.gog.com` API is not officially documented; it may change without notice.
