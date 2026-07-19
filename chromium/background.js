// Service worker : tourne dans le contexte de l'extension.
// La règle declarativeNetRequest réécrit les headers CORS pour permettre la lecture.

const ENDPOINT = {
  name: 'catalog',
  buildUrl: (q) =>
    `https://catalog.gog.com/v1/catalog?query=${encodeURIComponent(q)}&limit=20&order=desc:score&productType=in:game,pack&countryCode=BE&locale=en-US&currencyCode=EUR`,
  parse: (data) =>
    (data?.products || []).map((p) => ({
      title: p.title,
      slug: p.slug,
      url: p.storeLink || (p.slug ? `https://www.gog.com/game/${p.slug}` : null),
      productType: p.productType,
      price: p.price
        ? {
            final: p.price.final || null,
            base: p.price.base || null,
            discount: p.price.discount || null,
            currency: p.price.finalMoney?.currency || 'EUR',
            isFree: p.price.isFree || false,
          }
        : null,
    })),
};

async function search(query, logs) {
  const url = ENDPOINT.buildUrl(query);
  logs.push(`fetch -> ${url}`);
  const res = await fetch(url, {
    credentials: 'omit',
    headers: { 'Accept': 'application/json' },
  });
  logs.push(`HTTP ${res.status}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const products = ENDPOINT.parse(data);
  logs.push(`${products.length} produits`);
  return products;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== 'gog_search' || typeof msg.query !== 'string') return false;

  (async () => {
    const logs = [`query = "${msg.query}"`];
    try {
      const products = await search(msg.query, logs);
      sendResponse({ ok: true, products, logs });
    } catch (e) {
      logs.push(`erreur : ${e?.message || e}`);
      sendResponse({ ok: false, error: String(e?.message || e), logs });
    }
  })();

  return true;
});
