/* STOX API — Cloudflare Worker scaffold.
   Every route returns the SAME shape the dashboard already consumes, sourced from
   sample-data.json. Replace each handler body with a real adapter (bank export,
   Yahoo Finance, FX feed, AI engine) when data is available — the frontend won't change.

   Deploy: Cloudflare Pages Functions or a standalone Worker. Put Cloudflare Access
   in front for auth; read the identity from the CF-Access-Authenticated-User-Email header. */

import SAMPLE from './sample-data.json' assert { type: 'json' };

const CORS = {
  'access-control-allow-origin': '*',            // tighten to https://stox.kh.group in prod
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json; charset=utf-8',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: CORS });

function identity(req) {
  // Cloudflare Access injects this once a policy is attached.
  const email = req.headers.get('cf-access-authenticated-user-email') || 'owner@kh.group';
  // map email -> role + visible portfolios (wire to your access rules / KV)
  return { user: email, role: 'owner', portfolios: ['KH', 'Monika'] };
}

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const p = url.pathname.replace(/^\/api/, '');
    const q = url.searchParams;
    const me = identity(req);

    switch (p) {
      case '/me':          return json(me);
      case '/portfolios':  return json(me.portfolios.map(id => ({ id, name: id })));
      case '/holdings':    return json(SAMPLE.holdings[q.get('pf') || 'KH'] || []);
      case '/fx':          return json(SAMPLE.fx);                       // TODO: live FX feed
      case '/history':     return json(synthHistory(q.get('sym'), q.get('tf'))); // TODO: real series
      case '/dividends':   return json(SAMPLE.dividends || []);         // TODO: bank dividend feed
      case '/advisor':     return json(filterSector(SAMPLE.advisor, q.get('sector'))); // TODO: AI engine
      case '/sources':     return json(SAMPLE.sources);                 // TODO: source-health from engine
      case '/watchlist':
        if (req.method === 'POST') return json({ ok: true }, 201);      // TODO: persist (KV/D1)
        return json(SAMPLE.watchlist || []);
      case '/lots':        return json(SAMPLE.lots?.[q.get('sym')] || []); // TODO: real buy/add/sell
      case '/settings':
        if (req.method === 'PUT') return json({ ok: true });            // TODO: persist per portfolio
        return json(SAMPLE.settings || {});
      default:             return json({ error: 'not found', path: p }, 404);
    }
  },
};

// --- placeholder generators (mirror the frontend's deterministic mock until real data lands) ---
function filterSector(list, sec) {
  return (!sec || sec === 'All') ? list : list.filter(r => r.sector === sec);
}
function synthHistory(sym = 'X', tf = '1Y') {
  const days = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365, '5Y': 1825 }[tf] || 365;
  let s = [...sym].reduce((a, c) => a + c.charCodeAt(0), 0), out = [], v = 100;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const today = Date.now();
  for (let i = 0; i < days; i++) {
    v += (rnd() - 0.48) * 1.5;
    out.push({ t: new Date(today - (days - 1 - i) * 864e5).toISOString().slice(0, 10), v: +v.toFixed(2) });
  }
  return out;
}
