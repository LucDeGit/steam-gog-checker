# Installation Guide

Because this extension isn't distributed through the Chrome Web Store or Firefox Add-ons store, you need to install it manually ("sideload"). This guide walks you through every option.

## Table of contents

- [Chromium-based browsers (Chrome / Edge / Brave / Opera / Vivaldi)](#chromium-based-browsers)
- [Firefox — Option A: temporary install](#firefox--option-a-temporary-install)
- [Firefox — Option B: permanent install via AMO (recommended)](#firefox--option-b-permanent-install-via-amo-recommended)
- [Firefox — Option C: Developer Edition / Nightly with unsigned add-ons](#firefox--option-c-developer-edition--nightly-with-unsigned-add-ons)
- [Verifying it works](#verifying-it-works)
- [Updating the extension](#updating-the-extension)
- [Uninstalling](#uninstalling)

---

## Chromium-based browsers

The process is identical for Chrome, Edge, Brave, Opera, and Vivaldi.

### 1. Download and extract

Grab `steam-gog-checker-chromium-vX.Y.Z.zip` from the [Releases page](../../releases). Extract it **somewhere permanent** — the browser reads files from that folder on every use, so if you delete or move it the extension breaks. Good spots:

- `~/browser-extensions/steam-gog-checker/` (Linux / macOS)
- `C:\Users\<you>\Extensions\steam-gog-checker\` (Windows)

Do **not** leave it in `Downloads/` or on your Desktop where you might delete it.

### 2. Open the extensions page

| Browser | URL |
|---------|-----|
| Chrome | `chrome://extensions/` |
| Edge | `edge://extensions/` |
| Brave | `brave://extensions/` |
| Opera | `opera://extensions/` |
| Vivaldi | `vivaldi://extensions/` |

Or use the menu: **Extensions → Manage extensions**.

### 3. Enable Developer mode

Toggle the **Developer mode** switch. In Chrome, Brave, Opera, and Vivaldi it's in the top-right corner. In Edge, it's in the left sidebar.

### 4. Load unpacked

Click **Load unpacked** (appears after enabling dev mode). Navigate to the extracted folder and select it. **Important**: pick the folder that contains `manifest.json` directly, not a parent folder.

### 5. Done

The extension appears in the list. Visit any Steam game page (e.g. https://store.steampowered.com/app/1091500/) — you should see a purple GOG banner above the purchase box if the game is on GOG.

### Caveats to know

- **Startup warning**: Chrome and Edge display "Disable developer mode extensions" on each launch. It's Google/Microsoft nudging you toward the Web Store. Just dismiss it — the extension keeps working. There's no clean way to hide the warning permanently on a personal install without enterprise policies.
- **Folder is live**: the browser reads from your extracted folder every time. If you move or delete it, the extension breaks. Reload it from the extensions page if that happens.
- **No auto-updates**: without a store, you have to manually pull new releases (see [Updating](#updating-the-extension) below).

---

## Firefox — Option A: temporary install

Fastest way to test the extension. **The extension is removed when Firefox restarts** — use this for evaluation, not daily use.

1. Download `steam-gog-checker-firefox-vX.Y.Z.zip` from the [Releases page](../../releases)
2. Extract it somewhere
3. Open `about:debugging#/runtime/this-firefox`
4. Click **Load Temporary Add-on...**
5. Select the `manifest.json` file inside the extracted folder
6. The extension is loaded — visit a Steam game page to check

To keep it across restarts, use Option B or C below.

---

## Firefox — Option B: permanent install via AMO (recommended)

Mozilla lets you self-sign extensions for personal use through addons.mozilla.org (AMO) in **unlisted** mode. It's free, takes ~15 minutes total, and gives you a signed `.xpi` that installs permanently in any standard Firefox — including Firefox ESR.

### Steps

1. Create a Mozilla developer account at https://addons.mozilla.org/developers/
2. Click **Submit a New Add-on**
3. When asked *"How to distribute this version?"*, choose **"On your own"** (unlisted distribution) — this skips the manual review and just runs an automated signing check
4. Upload the `.xpi` file from the release. If you only have the `.zip`, just rename its extension to `.xpi`
5. Fill in the required minimal fields (name, summary, license — MIT)
6. Submit. Mozilla's automated system typically signs it within 1–5 minutes for a simple extension like this
7. Once signed, download the signed `.xpi` from your developer dashboard
8. Open Firefox → drag and drop the signed `.xpi` into any window
9. Confirm the install prompt

The extension is now installed permanently and survives restarts. Updates work the same way: bump the version, re-sign, re-install.

---

## Firefox — Option C: Developer Edition / Nightly with unsigned add-ons

If you don't want to touch AMO, use a Firefox variant that allows unsigned extensions. **This does NOT work in standard Firefox or Firefox ESR** — those enforce signatures without exception.

### Steps

1. Install [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) or [Firefox Nightly](https://www.mozilla.org/firefox/channel/desktop/#nightly)
2. Open `about:config`
3. Search for `xpinstall.signatures.required` and set it to `false`
4. Rename `steam-gog-checker-firefox-vX.Y.Z.zip` to `.xpi`
5. Drag and drop the `.xpi` into a Firefox window
6. Confirm the install prompt

The extension is installed permanently in that Firefox profile.

---

## Verifying it works

Open any Steam page for a game that's on GOG. Good test cases:

- [Cyberpunk 2077](https://store.steampowered.com/app/1091500/)
- [The Witcher 3: Wild Hunt](https://store.steampowered.com/app/292030/)
- [Hades](https://store.steampowered.com/app/1145360/)
- [Baldur's Gate 3](https://store.steampowered.com/app/1086940/)

You should see a purple banner above the "Buy" box: **"Also available on GOG.COM"** with the current GOG price and a "View on GOG →" button.

Games not on GOG (Counter-Strike 2, Dota 2, PUBG, Black Desert…) show no banner. That's expected.

### If nothing appears

Press F12 on the Steam page and look at the Console tab. The extension logs everything under `[Steam->GOG]`. Common causes:

- Extension not loaded → check the extensions page
- Ad blocker / firewall blocking `catalog.gog.com` → allow the domain
- Genuine no-match (the game really isn't on GOG)

Full debug walkthrough in [`chromium/README.md`](chromium/README.md#debug).

---

## Updating the extension

**Chromium**:
1. Download the new release
2. Replace the contents of your existing extracted folder with the new files (keep the same folder path)
3. On `chrome://extensions/`, click the **reload icon** on the extension card

**Firefox (Option A)**: reload as a Temporary Add-on with the new files.

**Firefox (Option B)**: re-sign the new version through AMO and re-install the signed `.xpi`.

**Firefox (Option C)**: drag & drop the new `.xpi` — Firefox will replace the old version.

---

## Uninstalling

- **Chromium**: `chrome://extensions/` → find the extension → **Remove**
- **Firefox**: `about:addons` → Extensions → three-dot menu → **Remove**

You can also delete the extracted folder on Chromium after uninstalling.
