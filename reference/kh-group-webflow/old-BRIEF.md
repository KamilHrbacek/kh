# Brief — kh-group.eu

> **Vstupní brief pro samostatnou cowork session.** Otevři cowork
> v tomhle projektu (`~/Projects/www-kh-group/`) a předhoď tenhle soubor
> agentovi jako kontext.
>
> Extrahováno z `~/Projects/WEB-BUILD-ROADMAP.md` (§1). Pokud
> roadmap přidá novou informaci, znovuvygeneruj přes
> `outputs/extract_briefs.py` nebo aktualizuj ručně.

| Pole | Hodnota |
|---|---|
| **Projekt** | `www-kh-group` |
| **Roadmap §** | 1 |
| **Cílová doména** | kh-group.eu |

---

## 1. kh-group.eu

**Status**: Webflow site, custom domain aktivní. Hostuje se přes Webflow,
ne přes CF (potvrzeno auditem CF zón — kh-group.eu není zóna v účtu).

**Strategický cíl**: Migrovat na CF Pages a zároveň přeskupit obsah —
firma má větší úpravy v portfoliu.

**Změny obsahu od poslední revize**:
- **Zrušit stránku „Elektromobilita"** — nabíječka elektro končí
  k 1. 7. 2026 (rozhodnuto). Odkaz vyřadit z menu i z patičky.
- **Přidat odkaz na `madhouse.vip`** — rodinná RV značka, dává smysl
  propojit s krajinou portfolia.
- **UNI-MAX prodán → Zafido**: zmínit jako bývalou aktivitu skupiny
  („dříve součást KH, nyní rozvíjí Zafido"). Tím se vytrácejí přímé
  odkazy na související značky **Consignia** a **Industris** — buď
  vyřadit, nebo upozadit do sekce „historie / dříve byla naše".
- **Odstranit banner „dodávky dílenského vybavení"** (souvisel s UNI-MAX
  obchodním kanálem).
- **Zesílit sekci PhotoRobot** — flagship firma, dostat ji výraznější
  prezentaci.
- **Spustit / přidat sls.market a prototype.builders** — nové aktivity
  skupiny, zatím v rozjezdu.
- **Technické zázemí — silnější vyznění**: laserové robotické sváření,
  SLS tisk včetně finishingu, zpracování plechů na technologiích Trumpf,
  CNC obrábění na Mazak Integrex. Tohle je teď jeden z hlavních value
  propů skupiny, dnešní stránka ho nezobrazuje dostatečně silně.

**Postup**:
1. Mirror `kh-group-1.webflow.io` (Webflow shortname) přes
   `mirror_webflow.py` + případně `deep_mirror.py` pokud má více stránek.
2. Scaffold přes `scaffold_sites.py` se správným per-site config
   (Organization entity, brand color, kontakt).
3. **Před deployem** přepsat copy + strukturu sekcí podle změn výše.
   Pravděpodobně to znamená přejít z prostého mirror do skutečné
   rekonstrukce — buď Astro repo, nebo stále plain HTML s upraveným
   index.html.
4. git → CF Pages flow stejně jako u Starter dávky.
5. Custom domain attach po dokončení DNS migrace.

**Otevřené otázky pro budoucí session**:
- Zachovat současný Webflow vizuál, nebo to vzít jako příležitost
  na redesign?
- Jaký bude osud Consignia a Industris stránek — vyřadit nebo upozadit?
- Mám-li doplnit prototype.builders a sls.market sekce, potřebuju
  briefing co tyto firmy dělají (pro perex).

---

## Per-session návody

- **Stack rozhodnutí**: viz `~/Projects/CF-PAGES-DEPLOY-PLAYBOOK.md`
  pro mechanics deploye (CF Pages, _headers, _redirects).
- **Naming konvence**: lokální složka i CF Pages project i GitHub repo
  jsou `www-kh-group` (viz `~/Projects/WEB-RENAME-PLAN.md`).
- **Webflow IX2 dependency**: pokud děláš mirror existujícího Webflow webu,
  **NESTRIPUJ** `data-wf-domain`, `data-wf-page`, `data-wf-site` atributy
  z `<html>` — runtime by se rozpadl.
