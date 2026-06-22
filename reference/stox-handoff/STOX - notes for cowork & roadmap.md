# STOX — notes for cowork & roadmap

## Data sources — what is REAL vs illustrative

REAL (provided by owner — safe to wire/keep):
- **Holdings** (Portfolio tab): the 12 positions (1 mutual fund + 11 ETFs), each with its
  **native value, currency, and total return %** — taken from the bank app "MOJE INVESTICE".
  Currencies actually held: **EUR, USD, JPY**.
- **Bank totals** (reference): portfolio value 11,785,387.73 CZK; total invested 11,058,181.25 CZK.
- **Watchlist tickers**: the owner's real Apple-app watchlist symbols.

ILLUSTRATIVE / MOCK (replace with live feeds or owner data):
- **FX rates** (EUR/USD/JPY/CZK) in `FX={...}` — hardcoded; wire live rates.
- **Day % (intraday)** per holding — synthesized (the bank shows only total return, no intraday).
- **All price-history curves** (hero chart, in-row mini sparklines, detail-card charts) — synthesized walks that only honour start (cost) and end (current value).
- **Contributions / transactions** shown in a holding's detail card — synthesized (owner will supply real buy/add/sell lots → enables real cost basis + what-if).
- **Watchlist entry prices / flag dates / notional** — synthesized.
- **Markets feed, Sentiment watch, Advisor** — Phase-2 placeholders.

## Pending / roadmap (captured so nothing is lost)

### DONE (frontend, mock data — cowork wires real feeds)
- #1 Watchlist = Portfolio look · #2 Settings (fee/prefs/sources) · #4 base-currency switch ·
  #5 main-chart timeframe + drag-pan + expand · #6 watchlist trash · #8 FX-risk split modal ·
  #9 World map modal (region bubbles on the dotted SVG; country-path upgrade still pending) ·
  #10 Income/dividends modal · #12 Composition donuts + #12b unified series · #13 candidate
  shortlist (Advisor: picks → buy-list, sector prefer/avoid badges) · #16 recs on watchlist rows +
  Add-idea hint · #19 Composition & Flow as modals · #20 signed returns · #21 Model-a-mix Sankey
  (deploy → holdings → projected return) · #11 build tag.

### BLOCKED / needs owner input or backend
- #7 **Shared access**: roles UI + portfolio switcher (KH / Monika / custom) are frontend previews —
  real auth, multi-user & audit trail wire in with the `admin.kh.group` / Cloudflare Access layer.
- #3 Detail-card DB, real lots & per-title thesis — owner to supply real buy/add/sell data.
- #14 source weighting UI done — the actual source-reading/AI engine is cowork's backend.
- Live data: FX rates, intraday %, real price history, dividend feed — all illustrative until wired.

### REMAINING FRONTEND
- (none open) — #17 Model-a-mix on watchlist and #18 Watchlist Flow/Sankey are now built
  (one "⇄ Model selected" modal: budget sliders across selected ideas + deploy→ideas→would-be-return sankey).

### DONE (frontend, mock data)
- currency locale formatting (cur(): cs-CZ Kč, ja-JP ¥, $ , €) · holdings table SORT (value/return%/
  total/day/A–Z, base-equivalent) · two-row table FILTER (currency × region, AND, empty combos greyed) ·
  hero DUAL filter (independent currency+region pills) + period-perf readout in the timeframe row ·
  invested/gain bar under hero total · map CHOROPLETH (sirLisko, tint by return %, fixed anchors,
  external legend, country click → ISO+name+book) · FX candlestick per currency · portfolio switcher ·
  Advisor candidate CARD (chart + sources + buy-list) · model-mix sticky header + advisor suggestion.
- #1 Watchlist look · #2 Settings · #4 base-currency · #5 timeframe+drag+expand · #6 watchlist trash ·

### STILL OPEN
1. **Watchlist = same design as Portfolio**: adopt the holdings row look (mini sparklines, chips);
   add per-row **checkbox** to include/exclude a title from charts & models; a **trash** action to
   remove; a **"＋ Add title"** button for live modelling during a banker meeting.
2. **Settings / configuration page**:
   - **Management fee** charged by the bank → factor into net P/L.
   - **Preferred sectors / commodities + avoid-list** → feeds the Gemini "gem" / Advisor so it can
     auto-draft replies to broker offers (what we want / don't want).
   - **Data-source configuration** (bank export, Yahoo Finance, …) — selectable & documented.
3. **Detail-card database**: owner to add real lots per title → replaces synthesized contributions.
   Also per-title **notes / thesis**: why we bought, the expectation at the time, target horizon, and a
   stance (hold / add / trim) — so past reasoning stays visible later (e.g. DFEN = EU defense capex,
   ~2030 thesis → hold, don't add; the map may show better places to deploy fresh money meanwhile).
4. **Base currency**: hero big number + table already switch (USD default). Reconcile the CZK home
   total with the bank figure once FX is live.
5. **Main chart controls**: timeframe presets (1W/1M/3M/6M/1Y/5Y/MAX), drag-to-pan the time axis,
   and expand-to-large-modal — requested, not yet built.
6. **Watchlist trash**: remove an idea from the sandbox.
7. **Shared access (banker / second pair of eyes)**: a read-mostly role so a banker can view real
   data & reasoning and optionally suggest/correct buys (owner runs regular investing). Decide scope:
   whole dashboard vs. a limited view (e.g. watchlist + suggestions only). Implies: auth, roles
   (owner / advisor / read-only), and an audit trail of who suggested what. Architecture: this is the
   real reason the `admin.kh.group` + login layer matters — STOX becomes multi-user, not just private.
8. **Currency risk view**: JPY book is outperforming — but track FX stability separately so a gain
   isn't quietly eaten (or inflated) by currency risk. Show return split: asset move vs FX move.
   Add a **candlestick FX chart (history + expected/forward)** per currency, openable on click —
   some regions move on FX, not on paper value (a region can pop or get shot on the exchange rate).
9. **Geographic / exchanges**: explore more exchanges (Vietnam & other Asian "tigers", …). Calls for a
   **world SVG map with data plotted on it** (value/return per region/exchange). If it's a lot, make
   the visualisation window **switchable** (chart ↔ map) and/or open it in a **modal** — ideally both.
10. **Dividend / income tracking**: VHYL (Vanguard FTSE All-World High Dividend) is the income play and
    dividends do arrive — modest in absolute terms. Track dividends received and compare whether the
    dividend-title strategy earns its place (and which titles), vs. growth plays like Emerging/JPY.
    Show total return = price + dividends, and a separate income view.
12. **More views (the more angles, the better the judgement)**: pie/donut charts — one ring for
    *share invested* per holding, a parallel ring for *share of the gains* (absolute & relative), so you
    see who eats the capital vs. who earns. Plus a **Sankey** (money → world → holding → result) and a
    **radial / rose** breakdown. Add as switchable panels (chart ↔ pie ↔ sankey ↔ map) and/or modal.
    12b. When a book/region is *locked* (clicked in allocation), the hero chart should stay interactive
    (crosshair + value), not a static line — needs the chart unified on one "current series" variable.
13. **Candidate shortlist (news-scored picks)**: a list of candidate titles where market news is evaluated,
    filterable by the same sector prefer/avoid tags, from which you pick into a buy-list → realise or
    discuss with the banker. Show per-candidate which sources flagged it.
14. **Source diversification + weighting**: ingest the owner's investment newsletters from e-mail, plus
    Perplexity & other sources; let each source carry a weight the AI uses when composing
    recommendations. Strength of this tool = NOT taking data only where everyone else does. On the
    shortlist, show which sources a signal came from and the weight given.
15. **Inverted Advisor flow** (frontend preview built): owner doesn't read articles; the AI reads sources
    continuously (cowork backend) and the UI shows only the call per title (buy/trim/hold) within a
    filter, a conviction score, and a per-source "why" on click.
16. **Recommendations everywhere** (frontend built): buy/avoid call + conviction chip on Watchlist rows,
    full "why" + per-source breakdown in the watchlist detail, and a live AI-read hint in the Add-idea
    form as you type a ticker — all placeholder signals; cowork wires the real source engine behind them.
17. **Model-a-mix on the Watchlist**: the Portfolio "Model a mix" splits a deploy budget across owned
    holdings (reinforcing positions). Extend the same slider mechanic to the Watchlist — allocate a
    budget across the *selected* ideas (checkbox set) to model a fresh buy before realising it, tied to
    the recommendations and +Add.
18. **Sankey/Flow for Watchlist & beyond**: reuse the capital→returns Sankey on the watchlist to show
    *intended capital vs. expected return* per idea — a fast read on which candidates promise the most
    per euro deployed.
19. **Both Composition & Flow as modals** (equal peers): move the dimension/filter controls *into* each
    modal (Flow already does), so the homepage stays clean — no inline viz blocks.
20. **Signed returns layout**: treat losses as negative (not |pl|) so winners and losers separate
    visually; add edge bars (left & right) showing the gain↔loss ratio with small % totals.
21. **Model-a-mix its own Sankey**: deploy budget → ideas → expected return, so a modelled buy shows its
    projected flow and payoff shape.
11. **Build/version + source health**: show a build number + build time (UTC) in the footer (done, static —
    wire to real build in CI). Add a **source-health panel**: each feed (bank export, Yahoo Finance, FX,
    …) reports last-update time / status, since feeds drop or lag — so we always know how fresh and how
    complete the data on screen actually is (which positions are live vs stale).
