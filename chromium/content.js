(async function () {
  'use strict';

  const TAG = '[Steam→GOG]';
  console.log(`${TAG} content script chargé sur`, location.href);

  // --- 1. Récupération du nom du jeu ---
  const nameEl =
    document.querySelector('#appHubAppName') || document.querySelector('.apphub_AppName');
  if (!nameEl) {
    console.warn(`${TAG} élément du nom du jeu introuvable`);
    return;
  }
  const steamName = nameEl.textContent.trim();
  if (!steamName) return;
  console.log(`${TAG} nom du jeu Steam : "${steamName}"`);

  // --- 2. Normalisation + similarité Jaccard ---
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[®™©]/g, '')
      .replace(/[:;'"\-_,!?\.\(\)\[\]\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(
        /\b(the|a|an|le|la|les|edition|deluxe|gold|goty|game\s+of\s+the\s+year|complete|definitive|remastered|enhanced|directors?\s+cut|final\s+cut|extended|expanded|ultimate|standard|anniversary)\b/g,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(s) {
    return new Set(s.split(/\s+/).filter((w) => w.length > 1));
  }

  function jaccard(a, b) {
    const A = tokens(a),
      B = tokens(b);
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const w of A) if (B.has(w)) inter++;
    return inter / (A.size + B.size - inter);
  }

  // --- 3. Recherche ---
  function buildSearchQueries(name) {
    const cleaned = name
      .replace(/[®™©]/g, '')
      .replace(/[:;'"\-_,!?\(\)\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const queries = [cleaned];
    const noArticle = cleaned.replace(/^(the|a|an)\s+/i, '');
    if (noArticle && noArticle !== cleaned) queries.push(noArticle);
    const beforeColon = name
      .split(/[:\-–—]/)[0]
      .replace(/[®™©'"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (beforeColon && !queries.includes(beforeColon) && beforeColon.length >= 3)
      queries.push(beforeColon);
    const words = cleaned.split(/\s+/).filter((w) => w.length > 1);
    if (words.length > 3) {
      const s = words.slice(0, 3).join(' ');
      if (!queries.includes(s)) queries.push(s);
    }
    if (words.length > 2) {
      const s = words.slice(0, 2).join(' ');
      if (!queries.includes(s)) queries.push(s);
    }
    return queries;
  }

  async function searchOnce(query) {
    const response = await chrome.runtime.sendMessage({ type: 'gog_search', query });
    if (!response) throw new Error('pas de réponse du service worker');
    if (Array.isArray(response.logs)) for (const l of response.logs) console.log(`${TAG} [SW]`, l);
    if (!response.ok) throw new Error(`SW: ${response.error}`);
    return response.products || [];
  }

  async function searchGog(name) {
    const queries = buildSearchQueries(name);
    console.log(`${TAG} stratégies :`, queries);
    for (const q of queries) {
      const products = await searchOnce(q);
      if (products.length > 0) return products;
    }
    return [];
  }

  function findBestMatch(name, products) {
    if (!products.length) return null;
    const target = normalize(name);
    if (!target) return null;

    for (const p of products) {
      if (normalize(p.title) === target) {
        console.log(`${TAG} match exact : ${p.title}`);
        return p;
      }
    }
    for (const p of products) {
      const n = normalize(p.title);
      if (!n) continue;
      if ((n.startsWith(target + ' ') || target.startsWith(n + ' ')) && Math.abs(n.length - target.length) <= 15) {
        console.log(`${TAG} match préfixe : ${p.title}`);
        return p;
      }
    }
    const scored = products
      .map((p) => ({ p, score: jaccard(target, normalize(p.title)) }))
      .sort((a, b) => b.score - a.score);
    console.log(
      `${TAG} top Jaccard :`,
      scored.slice(0, 5).map((s) => `${s.p.title.trim()} (${s.score.toFixed(2)})`)
    );
    if (scored[0] && scored[0].score >= 0.7) {
      console.log(`${TAG} match Jaccard : ${scored[0].p.title}`);
      return scored[0].p;
    }
    return null;
  }

  // --- 4. Badge (aucun innerHTML, URL validée) ---
  function safeStoreUrl(product) {
    let raw = product.url;
    if (!raw && product.slug) {
      raw = `https://www.gog.com/game/${encodeURIComponent(product.slug)}`;
    }
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:') return null;
      if (u.hostname !== 'www.gog.com' && u.hostname !== 'gog.com') return null;
      return u.toString();
    } catch {
      return null;
    }
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  }

  function formatPrice(price) {
    if (!price) return null;
    if (price.isFree) return { free: true };
    if (!price.final) return null;
    // Currency filtrée en whitelist stricte
    const raw = String(price.currency || '');
    const cur = raw === 'EUR' ? '€' : raw === 'USD' ? '$' : raw === 'GBP' ? '£' : '';
    const out = { final: `${price.final}${cur}` };
    if (price.base && price.discount) {
      const d = parseFloat(price.discount);
      if (!isNaN(d) && d > 0) {
        out.base = `${price.base}${cur}`;
        out.discount = `-${d}%`;
      }
    }
    return out;
  }

  function buildBadge(product) {
    const storeUrl = safeStoreUrl(product);
    if (!storeUrl) {
      console.warn(`${TAG} URL GOG rejetée : ${product.url}`);
      return null;
    }

    const a = el('a', 'sgc-banner');
    a.href = storeUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = `Aussi disponible sur GOG : ${product.title.trim()}`;

    const left = el('div', 'sgc-left');
    const logo = el('div', 'sgc-logo');
    logo.appendChild(el('span', 'sgc-logo-text', 'GOG'));
    left.appendChild(logo);

    const textCol = el('div', 'sgc-text');
    textCol.appendChild(el('div', 'sgc-title', 'Aussi disponible sur GOG.COM'));
    textCol.appendChild(el('div', 'sgc-subtitle', `DRM-free · ${product.title.trim()}`));
    left.appendChild(textCol);
    a.appendChild(left);

    const right = el('div', 'sgc-right');
    const price = formatPrice(product.price);
    if (price) {
      if (price.free) {
        right.appendChild(el('div', 'sgc-price-final', 'Gratuit'));
      } else if (price.discount) {
        const block = el('div', 'sgc-price-block');
        block.appendChild(el('div', 'sgc-price-discount', price.discount));
        const amounts = el('div', 'sgc-price-amounts');
        amounts.appendChild(el('div', 'sgc-price-base', price.base));
        amounts.appendChild(el('div', 'sgc-price-final', price.final));
        block.appendChild(amounts);
        right.appendChild(block);
      } else {
        right.appendChild(el('div', 'sgc-price-final', price.final));
      }
    }
    right.appendChild(el('div', 'sgc-cta', 'Voir sur GOG →'));
    a.appendChild(right);

    return a;
  }

  function injectBadge(badge) {
    const purchaseArea = document.querySelector('#game_area_purchase');
    if (purchaseArea) {
      purchaseArea.insertBefore(badge, purchaseArea.firstChild);
      console.log(`${TAG} badge inséré dans #game_area_purchase`);
      return;
    }
    const fallbacks = ['.apphub_HeaderStandardTop', '.glance_ctn', '#appHubAppName'];
    for (const sel of fallbacks) {
      const t = document.querySelector(sel);
      if (t) {
        t.appendChild(badge);
        console.log(`${TAG} fallback : ${sel}`);
        return;
      }
    }
    console.warn(`${TAG} aucune cible d'injection`);
  }

  // --- 5. Orchestration ---
  try {
    const products = await searchGog(steamName);
    const match = findBestMatch(steamName, products);
    if (match) {
      const badge = buildBadge(match);
      if (badge) injectBadge(badge);
    } else {
      console.log(`${TAG} pas de match GOG pour "${steamName}"`);
    }
  } catch (e) {
    console.error(`${TAG} erreur :`, e);
  }
})();
