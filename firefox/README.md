# Steam → GOG Checker (Firefox)

Firefox variant of the extension. See [`../chromium/README.md`](../chromium/README.md) for the full description, security audit, and roadmap — the functional code is identical.

## Differences vs. the Chromium variant

|  | Chromium / Edge | Firefox |
|---|---|---|
| Background | `service_worker` | `scripts` (event page) |
| Manifest extras | — | `browser_specific_settings.gecko.id` |
| Minimum browser version | Chrome 88+ | Firefox 113+ |

Why `scripts` instead of `service_worker`? Firefox has supported `service_worker` since 121, but the event page (`scripts`) has been the reliable MV3 background pattern since Firefox 109 and behaves consistently across versions.

## Temporary install (dev)

1. Open Firefox -> `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` in this folder
4. The extension is loaded until the next Firefox restart

## Permanent install

**A. Firefox Developer Edition / Nightly**

- `about:config` -> set `xpinstall.signatures.required` to `false`
- Zip this folder as `.xpi` and drag & drop into Firefox

**B. Self-sign via Mozilla (free, unlisted)**

- Register at https://addons.mozilla.org/developers/
- Submit the `.xpi` as **unlisted** (distributed outside the AMO store)
- Mozilla auto-signs (usually within minutes)
- Download the signed `.xpi` and install in any standard Firefox
