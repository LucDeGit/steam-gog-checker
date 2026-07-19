# Steam → GOG Checker (Firefox)

Variante Firefox de l'extension. Voir [`../steam-gog-checker/README.md`](../steam-gog-checker/README.md) pour la description, l'audit de sécurité et la roadmap.

## Différences avec la version Chromium

| | Chromium / Edge | Firefox |
|---|---|---|
| Background | `service_worker` | `scripts` (event page) |
| Manifest extras | — | `browser_specific_settings.gecko.id` |
| Version min navigateur | Chrome 88+ | Firefox 113+ |

## Installation temporaire (test)

1. Ouvre Firefox → `about:debugging#/runtime/this-firefox`
2. Clique **Charger un module complémentaire temporaire**
3. Sélectionne `manifest.json` de ce dossier
4. Disparait au redémarrage de Firefox

## Installation permanente

**A. Firefox Developer Edition / Nightly**
- `about:config` → `xpinstall.signatures.required = false`
- Zippe le dossier en `.xpi` et drag & drop dans Firefox

**B. Signature Mozilla auto (unlisted)**
- Compte sur https://addons.mozilla.org/developers/
- Soumets le `.xpi` en mode **unlisted** (distribution hors store)
- Récupère le `.xpi` signé, installable dans n'importe quel Firefox stable
