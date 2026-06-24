/* STOX API — Cloudflare Pages Functions (catch-all under /api/*).
 *
 * PHASE A: every route returns deterministic MOCK data — the same values the dashboard used
 * to carry inline — so the UI is byte-for-byte identical, but the data now arrives over fetch.
 * To go live later, replace a single handler body with a real adapter (bank export, Yahoo
 * Finance, FX feed, the AI source engine); the frontend never changes.
 *
 * Contract is documented in reference/stox-handoff/stox-backend/README.md. Shapes here match
 * what apps/stox/index.html consumes. Auth (Cloudflare Access) + per-portfolio scope come in a
 * later phase; identity() already reads the CF-Access header when a policy is attached.
 */

const CORS = {
  'access-control-allow-origin': '*', // tighten to https://stox.kh.group when Access lands
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: CORS });

/* ---- mock data (ported verbatim from the former inline constants in index.html) ---------- */
const FX = { EUR: 1, USD: 0.92, JPY: 0.0062, CZK: 0.040 };

const HOLDINGS = {
  KH: [
    { sym: 'FLEX', name: 'Franklin Lexington PE Secondaries', type: 'Fund', region: 'Global', ccy: 'EUR', value: 126747.92, returnPct: 1.40, dayPct: 0.20 },
    { sym: 'JQUA', name: 'JPMorgan US Quality Factor', type: 'ETF', region: 'US', ccy: 'USD', value: 89275.00, returnPct: 12.85, dayPct: 0.60 },
    { sym: 'CEMR', name: 'iShares Edge MSCI Europe Momentum', type: 'ETF', region: 'Europe', ccy: 'EUR', value: 70737.20, returnPct: 1.08, dayPct: 0.30 },
    { sym: 'VHYL', name: 'Vanguard FTSE All-World High Div', type: 'ETF', region: 'Global', ccy: 'USD', value: 79819.65, returnPct: -0.37, dayPct: -0.40 },
    { sym: 'EMVL', name: 'iShares Edge MSCI EM Value', type: 'ETF', region: 'Emerging', ccy: 'USD', value: 46173.60, returnPct: 23.47, dayPct: 1.10 },
    { sym: 'WSML', name: 'iShares MSCI World Small-Cap', type: 'ETF', region: 'Developed', ccy: 'USD', value: 27915.92, returnPct: 5.23, dayPct: 0.50 },
    { sym: 'REMX', name: 'VanEck Rare Earth & Strategic Metals', type: 'ETF', region: 'US', ccy: 'USD', value: 17199.00, returnPct: 5.79, dayPct: 0.90 },
    { sym: 'PBE', name: 'Invesco Biotechnology & Genome', type: 'ETF', region: 'US', ccy: 'USD', value: 16758.80, returnPct: 3.37, dayPct: 0.40 },
    { sym: '1306', name: 'NEXT FUNDS TOPIX ETF', type: 'ETF', region: 'Japan', ccy: 'JPY', value: 2578200, returnPct: 12.31, dayPct: 0.80 },
    { sym: 'DFEN', name: 'VanEck Defense UCITS', type: 'ETF', region: 'Europe', ccy: 'EUR', value: 12544.80, returnPct: -11.73, dayPct: -1.20 },
    { sym: 'PRN', name: 'Invesco Dorsey Wright Industrials', type: 'ETF', region: 'US', ccy: 'USD', value: 12766.50, returnPct: 21.14, dayPct: 0.70 },
    { sym: 'AIRR', name: 'First Trust RBA American Industrial', type: 'ETF', region: 'US', ccy: 'USD', value: 11781.00, returnPct: 10.53, dayPct: 0.50 },
  ],
  Monika: [
    { sym: 'VWCE', name: 'Vanguard FTSE All-World', type: 'ETF', region: 'Global', ccy: 'EUR', value: 38400, returnPct: 9.20, dayPct: 0.30 },
    { sym: 'IWDA', name: 'iShares Core MSCI World', type: 'ETF', region: 'Developed', ccy: 'EUR', value: 26100, returnPct: 10.40, dayPct: 0.40 },
    { sym: 'CSPX', name: 'iShares Core S&P 500', type: 'ETF', region: 'US', ccy: 'USD', value: 19800, returnPct: 13.10, dayPct: 0.50 },
    { sym: 'AGGH', name: 'iShares Core Global Bond', type: 'ETF', region: 'Global', ccy: 'EUR', value: 14200, returnPct: 1.80, dayPct: -0.10 },
    { sym: 'EIMI', name: 'iShares Core MSCI EM', type: 'ETF', region: 'Emerging', ccy: 'USD', value: 8600, returnPct: 6.40, dayPct: 0.60 },
  ],
};

const YIELDS = { VHYL: 3.6, EMVL: 2.9, JQUA: 1.3, CEMR: 2.1, WSML: 1.6, '1306': 2.0, AIRR: 0.9, PRN: 0.7, REMX: 0.0, PBE: 0.0, DFEN: 0.4, FLEX: 0.0 };

const WATCHLIST = [
  // sym, name, region, ccy, weeksAgo flagged, entry (native), last (native), notional intended €, dayPct
  { sym: 'NKE', name: 'Nike', region: 'US', ccy: 'USD', weeksAgo: 60, entry: 95.00, last: 45.20, notional: 8000, dayPct: 0.8 },
  { sym: 'SBUX', name: 'Starbucks', region: 'US', ccy: 'USD', weeksAgo: 44, entry: 78.00, last: 100.65, notional: 7000, dayPct: 0.5 },
  { sym: 'DIS', name: 'Walt Disney', region: 'US', ccy: 'USD', weeksAgo: 38, entry: 84.00, last: 103.89, notional: 8000, dayPct: 1.1 },
  { sym: 'BA', name: 'Boeing', region: 'US', ccy: 'USD', weeksAgo: 54, entry: 245.00, last: 222.72, notional: 6000, dayPct: -0.6 },
  { sym: 'SAP', name: 'SAP SE', region: 'Europe', ccy: 'EUR', weeksAgo: 40, entry: 132.00, last: 155.22, notional: 9000, dayPct: -0.4 },
  { sym: 'GE', name: 'GE Aerospace', region: 'US', ccy: 'USD', weeksAgo: 72, entry: 158.00, last: 357.64, notional: 7000, dayPct: 0.9 },
  { sym: 'MBG.DE', name: 'Mercedes-Benz', region: 'Europe', ccy: 'EUR', weeksAgo: 50, entry: 62.00, last: 44.58, notional: 6000, dayPct: -0.7 },
  { sym: 'AIR.DE', name: 'Airbus', region: 'Europe', ccy: 'EUR', weeksAgo: 46, entry: 150.00, last: 187.48, notional: 7000, dayPct: -0.5 },
  { sym: 'BRK-B', name: 'Berkshire Hathaway', region: 'US', ccy: 'USD', weeksAgo: 64, entry: 410.00, last: 489.46, notional: 12000, dayPct: -0.3 },
  { sym: 'ALV.DE', name: 'Allianz', region: 'Europe', ccy: 'EUR', weeksAgo: 42, entry: 330.00, last: 401.60, notional: 8000, dayPct: 0.4 },
  { sym: 'HD', name: 'Home Depot', region: 'US', ccy: 'USD', weeksAgo: 48, entry: 360.00, last: 334.28, notional: 7000, dayPct: 0.6 },
  { sym: 'GOOGL', name: 'Alphabet', region: 'US', ccy: 'USD', weeksAgo: 80, entry: 132.00, last: 368.03, notional: 10000, dayPct: 0.7 },
];

const NEWS = [
  { src: 'Truth Social', text: 'New tariff threat on semiconductor imports — "we will protect American chips".', tickers: 'NVDA · ASML', dir: 'down' },
  { src: 'Reuters', text: 'ECB holds rates; signals patience into autumn. EU equities firm.', tickers: 'VWCE · IWDA', dir: 'up' },
  { src: 'Bloomberg', text: 'Apple services revenue beats; guidance lifted on AI features.', tickers: 'AAPL', dir: 'up' },
  { src: 'X / crowd', text: 'Retail flow piles into Nvidia ahead of GTC — options volume at record.', tickers: 'NVDA', dir: 'up' },
  { src: 'FT', text: 'Tesla deliveries miss; price cuts pressure margins again.', tickers: 'TSLA', dir: 'down' },
];

const SIGNALS = [
  { name: 'US large-cap tech', score: 78 },
  { name: 'Semiconductors', score: 41 },
  { name: 'EU industrials', score: 63 },
  { name: 'EV / Tesla', score: 28 },
];

const ADVISOR = [
  { act: 'Add', sym: 'EMVL', sector: 'Emerging', conviction: 82, rationale: 'EM value momentum is building and a softer USD is a tailwind. Adds to a winning but under-weight book.', sources: [['Bloomberg', 30, '+'], ['Reuters', 22, '+'], ['EM Weekly · newsletter', 28, '+'], ['Perplexity synth', 20, '~']] },
  { act: 'Buy', sym: 'AVGO', sector: 'Semiconductors', conviction: 76, rationale: 'Custom AI-silicon demand intact; on your watchlist but never bought — entry still reasonable.', sources: [['FT', 26, '+'], ['Morningstar', 24, '+'], ['X / crowd', 20, '+'], ['Perplexity synth', 30, '~']] },
  { act: 'Hold', sym: 'NVDA', sector: 'Semiconductors', conviction: 88, rationale: 'Headline dip on tariff noise; order books unchanged. Core position — do nothing.', sources: [['Bloomberg', 34, '+'], ['Reuters', 26, '~'], ['Truth Social', 20, '-'], ['Perplexity synth', 20, '+']] },
  { act: 'Trim', sym: 'TSLA', sector: 'US', conviction: 61, rationale: 'Margin trend and sentiment both negative; you trimmed once — consider finishing.', sources: [['FT', 30, '-'], ['Reuters', 24, '-'], ['X / crowd', 26, '~'], ['Perplexity synth', 20, '-']] },
  { act: 'Hold', sym: 'DFEN', sector: 'Defense', conviction: 70, rationale: 'Down ~12%, but EU defense capex is a ~2030 thesis. Hold; do not add fresh money now.', sources: [['Defense News', 30, '+'], ['Reuters', 24, '~'], ['Macro · newsletter', 26, '+'], ['Perplexity synth', 20, '~']] },
  { act: 'Buy', sym: 'TSM', sector: 'Semiconductors', conviction: 84, rationale: 'The foundry everyone depends on; valuation undemanding versus its moat and AI demand.', sources: [['Bloomberg', 32, '+'], ['Morningstar', 26, '+'], ['Semi Weekly · newsletter', 24, '+'], ['Perplexity synth', 18, '+']] },
  { act: 'Buy', sym: 'VNM', sector: 'Emerging', conviction: 73, rationale: 'Vietnam: the next Asian tiger you flagged. Frontier-to-EM upgrade path is the catalyst.', sources: [['EM Weekly · newsletter', 30, '+'], ['Reuters', 22, '+'], ['Perplexity synth', 26, '+'], ['X / crowd', 18, '~']] },
  { act: 'Watch', sym: 'ARKK', sector: 'AI', conviction: 52, rationale: 'High beta, high noise. Wait for a clearer trend before committing fresh money.', sources: [['X / crowd', 30, '~'], ['FT', 24, '-'], ['Perplexity synth', 24, '~'], ['Morningstar', 18, '-']] },
  { act: 'Buy', sym: 'URA', sector: 'Uranium', conviction: 69, rationale: 'Nuclear restart cycle + supply deficit; a contrarian energy angle off the beaten path.', sources: [['Macro · newsletter', 32, '+'], ['Bloomberg', 24, '+'], ['Reuters', 22, '~'], ['Perplexity synth', 18, '+']] },
  { act: 'Avoid', sym: 'MEME', sector: 'US', conviction: 34, rationale: 'Crowd-driven, no fundamental support. Against your preferences — skip.', sources: [['X / crowd', 40, '~'], ['Truth Social', 24, '~'], ['Perplexity synth', 20, '-'], ['FT', 16, '-']] },
];

const SOURCES = [
  { name: 'Bank export', weight: 90, status: 'live', lastUpdate: null },
  { name: 'Yahoo Finance', weight: 70, status: 'live', lastUpdate: null },
  { name: 'Investment newsletters (e-mail)', weight: 75, status: 'lagging', lastUpdate: null },
  { name: 'Perplexity', weight: 55, status: 'live', lastUpdate: null },
];

function identity(request) {
  // Cloudflare Access injects this header once a policy is attached; until then, owner.
  const email = request.headers.get('cf-access-authenticated-user-email') || 'owner@kh.group';
  return { user: email, role: 'owner', portfolios: Object.keys(HOLDINGS) };
}

export function onRequest(context) {
  const { request } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
  const q = url.searchParams;
  const me = identity(request);
  const nowISO = new Date().toISOString();

  switch (path) {
    case '/':
    case '/health':     return json({ ok: true, phase: 'A (mock)', ts: nowISO });
    case '/me':         return json(me);
    case '/portfolios': return json(me.portfolios);                              // ["KH","Monika"]
    case '/fx':         return json({ ...FX, asOf: nowISO });                    // TODO: live FX feed
    case '/holdings':   return json(HOLDINGS[q.get('pf') || 'KH'] || []);        // TODO: bank export
    case '/yields':     return json(YIELDS);                                     // TODO: dividend feed
    case '/watchlist':
      if (request.method === 'POST') return json({ ok: true }, 201);             // TODO: persist (D1/KV)
      return json(WATCHLIST);
    case '/news':       return json(NEWS);                                       // TODO: reader engine
    case '/signals':    return json(SIGNALS);                                    // TODO: signal engine
    case '/recommendations':
    case '/advisor': {                                                           // TODO: AI engine
      const sec = q.get('sector');
      return json(!sec || sec === 'All' ? ADVISOR : ADVISOR.filter((r) => r.sector === sec));
    }
    case '/sources':    return json(SOURCES.map((s) => ({ ...s, lastUpdate: s.lastUpdate || nowISO })));
    default:            return json({ error: 'not found', path }, 404);
  }
}
