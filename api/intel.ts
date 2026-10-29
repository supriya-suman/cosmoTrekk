// api/intel.ts — GET /api/intel?topic=mars → "Mission Intel": related items from the free NASA Image and Video Library.
// Honest statuses only: we never label fallback content as "Live". Vercel's CDN caches answers for 1 day (shared cache).
import { json, fetchWithTimeout } from './_lib/http.js'; // helpers

const TOPICS: Record<string, string> = { // allow-list: topic → search phrase (players cannot send arbitrary URLs or prompts)
  mars: 'Mars surface', moon: 'Moon surface Apollo', sun: 'Sun solar dynamics observatory', venus: 'Venus planet', saturn: 'Saturn Cassini', // planets etc.
  asteroid: 'asteroid Bennu', comet: 'comet nucleus', exoplanet: 'exoplanet illustration', satellite: 'satellite orbit Earth', station: 'International Space Station', // more
  earth: 'Earth from space', galaxies: 'galaxy Hubble', nebulae: 'nebula Webb', 'black-holes': 'black hole', auroras: 'aurora from space', eclipses: 'solar eclipse', // more
};

export async function GET(request: Request): Promise<Response> { // handles GET requests
  const topic = new URL(request.url).searchParams.get('topic') ?? ''; // ?topic=…
  const q = TOPICS[topic]; // look up the allowed search phrase
  if (!q) return json({ status: 'Offline training bank', items: [] }); // unknown topic → bundled content only
  try { // call NASA
    const r = await fetchWithTimeout(`https://images-api.nasa.gov/search?media_type=image&q=${encodeURIComponent(q)}`, {}, 8000); // free, no key required
    if (!r.ok) return json({ status: 'Offline training bank', items: [] }); // quota/server error → honest fallback
    const data = (await r.json()) as { collection?: { items?: { data?: { nasa_id: string; title: string }[] }[] } }; // response shape
    const items = (data.collection?.items ?? []).slice(0, 4).map((i) => i.data?.[0]).filter(Boolean).map((d) => ({ title: String(d!.title).slice(0, 120), url: `https://images.nasa.gov/details/${encodeURIComponent(d!.nasa_id)}` })); // keep 4 safe items
    if (!items.length) return json({ status: 'Offline training bank', items: [] }); // empty response
    return json({ status: 'Cached source content', items, checkedAt: new Date().toISOString(), source: 'NASA Image and Video Library' }, 200, { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }); // cache 1 day on Vercel's CDN
  } catch { // timeout / network error
    return json({ status: 'Offline training bank', items: [] }); // honest fallback
  }
}
