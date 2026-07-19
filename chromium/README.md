# Steam → GOG Checker

Extension navigateur (Chromium / Edge / Firefox, Manifest V3) qui affiche un bandeau au-dessus de la zone d'achat sur une page Steam si le jeu est aussi disponible sur GOG.com. Le bandeau montre le prix GOG (avec promo si applicable) et redirige vers la fiche produit d'un simple clic.

![screenshot placeholder](docs/screenshot.png)

## Fonctionnement

1. Un content script s'exécute sur `store.steampowered.com/app/*`
2. Il extrait le nom du jeu depuis le DOM Steam (`#appHubAppName`)
3. Il demande à un service worker de chercher ce jeu sur `catalog.gog.com`
4. Le service worker fait la requête et renvoie les résultats
5. Un algorithme de matching à 3 niveaux (exact → préfixe → similarité Jaccard ≥ 0.7) sélectionne le meilleur candidat
6. Si un match est trouvé, un bandeau est injecté avant la zone d'achat Steam

## Installation

### Chromium / Edge / Brave (mode développeur)

1. Clone ou télécharge ce repo
2. Va sur `edge://extensions/` (ou `chrome://extensions/`)
3. Active le **Mode développeur**
4. **Charger l'extension décompressée** → sélectionne le dossier `steam-gog-checker/`
5. Visite une page Steam de jeu

### Firefox

Voir [`../steam-gog-checker-firefox/README.md`](../steam-gog-checker-firefox/README.md).

## Sécurité

L'extension a été conçue avec le principe du moindre privilège. Détails :

### Permissions demandées

| Permission | Justification |
|------------|---------------|
| `declarativeNetRequestWithHostAccess` | Réécrire l'en-tête CORS de la réponse de `catalog.gog.com` (qui bloque explicitement les origines autres que `https://www.gog.com`). Requis sinon le service worker ne peut pas lire la réponse. |
| `host_permissions: store.steampowered.com/*` | Injecter le content script sur les pages Steam. |
| `host_permissions: catalog.gog.com/*` | Autoriser le service worker à requêter l'API GOG. |

Pas de permission `tabs`, `storage`, `cookies`, `webRequest`, `activeTab`, etc.

### Règle `declarativeNetRequest` restreinte

Le fichier `rules.json` réécrit uniquement les réponses de `catalog.gog.com` **et seulement pour les requêtes initiées par le service worker de l'extension** (`tabIds: [-1]`). Aucune requête faite par une page tierce n'est affectée.

### Aucun `innerHTML` avec données externes

Toutes les données provenant de l'API GOG (titres, prix, devises, URLs) sont insérées dans le DOM via `document.createElement` et `Element.textContent`. Aucun risque d'XSS même si l'API renvoyait du HTML malveillant.

### Validation d'URL

L'URL de destination du bandeau (`href`) est validée avant utilisation :
- Doit parser comme URL absolue
- Protocole obligatoirement `https:`
- Hostname obligatoirement `www.gog.com` ou `gog.com`

Toute URL rejetée → pas de bandeau injecté.

### Requêtes sortantes

- Une seule destination : `https://catalog.gog.com/v1/catalog?query=...`
- `credentials: 'omit'` (aucun cookie envoyé)
- Aucune donnée personnelle transmise, seul le nom du jeu affiché sur la page Steam est envoyé à GOG
- Pas de télémétrie, pas de tracking, aucun serveur tiers

### Devise / injections

La devise renvoyée par GOG est filtrée par whitelist (`EUR` → `€`, `USD` → `$`, `GBP` → `£`, sinon rien). Le pourcentage de remise est parsé en `parseFloat` avant affichage.

## Configuration

Deux paramètres sont codés en dur mais faciles à modifier :

- **Pays / devise** : dans `background.js`, `countryCode=BE&currencyCode=EUR`. Change en `FR/EUR`, `US/USD`, etc. selon ton pays.
- **Seuil de matching** : dans `content.js`, `const THRESHOLD = 0.7`. Baisse-le pour être plus permissif, monte-le pour être plus strict.

## Debug

Ouvre la console (F12) sur une page Steam. Tous les logs sont préfixés `[Steam→GOG]`. Les logs du service worker sont rapatriés dans la même console via `[Steam→GOG] [SW]`.

Exemple attendu sur un match :

```
[Steam→GOG] nom du jeu Steam : "Hades"
[Steam→GOG] stratégies : ["Hades"]
[Steam→GOG] [SW] query = "Hades"
[Steam→GOG] [SW] HTTP 200
[Steam→GOG] [SW] 5 produits
[Steam→GOG] match exact : Hades
[Steam→GOG] badge inséré dans #game_area_purchase
```

## Limites connues

- **Faux négatifs** possibles quand le titre Steam et le titre GOG divergent trop (éditions particulières, sous-titres différents). Le seuil Jaccard à 0.7 privilégie la précision.
- **Pas de cache** : chaque chargement de page Steam = une requête à catalog.gog.com. Roadmap ↓.
- L'API `catalog.gog.com` n'est pas documentée officiellement par GOG, elle peut changer sans préavis.

## Roadmap

- [ ] Cache local (`chrome.storage.local`) avec TTL 24 h
- [ ] Support Itch.io en parallèle
- [ ] Comparaison de prix bidirectionnelle (badge Steam sur pages GOG)
- [ ] Popup UI pour configurer le pays/devise
- [ ] Signaler dans le bandeau si le prix GOG est plus bas que celui affiché sur Steam

## Licence

MIT. Voir [`LICENSE`](./LICENSE).

## Disclaimer

Projet perso non affilié à Valve/Steam ni à GOG.com / CD PROJEKT. Les marques et logos "Steam" et "GOG" appartiennent à leurs propriétaires respectifs.
