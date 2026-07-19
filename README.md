# Steam → GOG Checker

Extension navigateur qui affiche un bandeau au-dessus de la zone d'achat sur une page Steam si le jeu est aussi disponible sur GOG.com, avec le prix et un lien direct.

## Installation

**Le plus simple** : télécharge la dernière version depuis les [Releases](../../releases) selon ton navigateur :

- `steam-gog-checker-chromium-vX.Y.Z.zip` — Chrome / Edge / Brave
- `steam-gog-checker-firefox-vX.Y.Z.zip` — Firefox 113+
- `steam-gog-checker-firefox-vX.Y.Z.xpi` — Firefox (fichier à signer via AMO pour installation permanente)

Puis suis les instructions du README de la variante :

- [`chromium/`](./chromium/) — Chrome / Edge / Brave (Manifest V3, service worker)
- [`firefox/`](./firefox/) — Firefox 113+ (Manifest V3, event page)

Le code fonctionnel est identique dans les deux variantes, seul le `manifest.json` change.

## Build local

```bash
# Chromium
cd chromium && zip -r ../steam-gog-checker-chromium.zip . && cd ..

# Firefox
cd firefox && zip -r ../steam-gog-checker-firefox.zip . && cd ..
```

Ou via GitHub Actions : chaque tag `vX.Y.Z` poussé déclenche automatiquement un build + release avec les deux archives.

## Audit de sécurité rapide

- **Aucun `innerHTML`** avec des données provenant de l'API. Toutes les insertions DOM passent par `createElement` + `textContent`.
- **URL validée** : le href du bandeau doit être en `https://` et pointer vers `www.gog.com` ou `gog.com`, sinon rejetée.
- **Permissions minimales** : `declarativeNetRequestWithHostAccess` et deux `host_permissions` (Steam + catalog.gog.com). Pas de `tabs`, `storage`, `cookies`, `webRequest`.
- **Règle DNR restreinte** au service worker (`tabIds: [-1]`), n'affecte pas les autres sites.
- **`credentials: 'omit'`** sur les fetch vers GOG, aucun cookie envoyé.
- **Aucune télémétrie**, aucun serveur tiers, aucune donnée personnelle transmise.

Détails dans [`chromium/README.md`](./chromium/README.md#sécurité).

## Licence

MIT.
