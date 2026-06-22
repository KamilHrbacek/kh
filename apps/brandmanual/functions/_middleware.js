// Email one-time-PIN gate for the whole brand manual (Cloudflare Pages Function).
// Simple, per-app, stateless cookies. NOBODY types a secret: the HMAC signing key
// is generated on first run and stored in KV (binding BM_KV). This is the interim
// gate; group-wide it will be replaced by KH-RBAC.
//
// Flow:
//   GET  any page                 → manual if a valid session cookie, else login page
//   POST /__auth/request {email}  → if allowlisted, sign a 10-min PIN challenge into a
//                                   cookie + email the 6-digit PIN. Always "ok" (no
//                                   account enumeration).
//   POST /__auth/verify {email,pin}→ on match, set a 24h signed session cookie
//   GET  /__auth/logout           → clear the session
//
// Setup on the kh-brandmanual Pages project (all CONFIG, no secret to type):
//   - KV binding  BM_KV  → namespace "kh-brandmanual-auth" (holds the signing key)
//   - Email path (one of):
//       SEB            — a Cloudflare Email Routing send_email binding (free; reuses
//                        the flowsmith sender), or
//       RESEND_API_KEY — a Resend API key.
//   - BM_MAIL_FROM (var) — sender, default "forms@flowsmith.online" (kh.group is a
//                          no-mail domain now, so the PIN must come from a sending one)
// Allowlist is in code (not secret) — edit ALLOW to add/remove reviewers.

const ALLOW = [
  "kh@kh-group.eu",
  "kamil@hrbacek.net",
  "kamil.hrbacek@gmail.com",
];
const PIN_TTL = 600;        // 10 min
const SESSION_TTL = 86400;  // 24 h
const enc = new TextEncoder();

const html = (body, status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" } });
const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "X-Robots-Tag": "noindex, nofollow", ...extra } });

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function hex(bytes) { return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function eq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function cookies(req) {
  const out = {};
  (req.headers.get("Cookie") || "").split(/;\s*/).forEach((p) => { const i = p.indexOf("="); if (i > 0) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1)); });
  return out;
}
const setCookie = (name, val, maxAge) => `${name}=${encodeURIComponent(val)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

// Signing key: generated once, persisted in KV. No human ever types a secret.
async function getKey(env) {
  let k = await env.BM_KV.get("hmac_key");
  if (!k) { k = hex(crypto.getRandomValues(new Uint8Array(32))); await env.BM_KV.put("hmac_key", k); }
  return k;
}

async function validSession(secret, req) {
  const c = cookies(req).bm_sess;
  if (!c) return null;
  const [emailB64, exp, sig] = c.split(".");
  if (!emailB64 || !exp || !sig) return null;
  if (Date.now() / 1000 > Number(exp)) return null;
  let email;
  try { email = atob(emailB64.replace(/-/g, "+").replace(/_/g, "/")); } catch { return null; }
  if (!ALLOW.includes(email)) return null;
  return eq(sig, await hmac(secret, `sess|${email}|${exp}`)) ? email : null;
}

async function sendPin(env, email, pin) {
  const from = env.BM_MAIL_FROM || "forms@flowsmith.online";
  const subject = "Your KH brand manual PIN";
  const text = `Your sign-in PIN for the KH brand manual is ${pin}\n\nIt expires in 10 minutes. If you didn't request it, ignore this email.`;
  if (env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ from: `KH Brand Manual <${from}>`, to: email, subject, text }) });
    return;
  }
  if (env.SEB && typeof EmailMessage !== "undefined") {
    const raw = `From: KH Brand Manual <${from}>\r\nTo: ${email}\r\nSubject: ${subject}\r\nMessage-ID: <${crypto.randomUUID()}@flowsmith.online>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${text}`;
    await env.SEB.send(new EmailMessage(from, email, raw));
    return;
  }
  console.log("brandmanual: no email transport (set SEB binding or RESEND_API_KEY) — PIN not sent");
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Interim (KH-approved): until the BM_KV binding is added, serve the manual openly
  // (noindex still applies). Binding BM_KV flips the email-PIN gate ON — fail-closed
  // from then on. So review can happen now; the password is added later by binding KV.
  if (!env.BM_KV) return next();
  const secret = await getKey(env);

  if (url.pathname === "/__auth/request" && request.method === "POST") {
    let email = "";
    try { email = ((await request.json()).email || "").trim().toLowerCase(); } catch {}
    if (ALLOW.includes(email)) {
      const pin = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
      const exp = Math.floor(Date.now() / 1000) + PIN_TTL;
      const sig = await hmac(secret, `req|${email}|${pin}|${exp}`);
      await sendPin(env, email, pin);
      return json({ ok: true }, 200, { "Set-Cookie": setCookie("bm_chal", `${exp}.${sig}`, PIN_TTL) });
    }
    return json({ ok: true });
  }

  if (url.pathname === "/__auth/verify" && request.method === "POST") {
    let email = "", pin = "";
    try { const b = await request.json(); email = (b.email || "").trim().toLowerCase(); pin = (b.pin || "").trim(); } catch {}
    const chal = cookies(request).bm_chal;
    if (chal && ALLOW.includes(email)) {
      const [exp, sig] = chal.split(".");
      if (exp && sig && Date.now() / 1000 <= Number(exp) && eq(sig, await hmac(secret, `req|${email}|${pin}|${exp}`))) {
        const sexp = Math.floor(Date.now() / 1000) + SESSION_TTL;
        const ssig = await hmac(secret, `sess|${email}|${sexp}`);
        return json({ ok: true }, 200, { "Set-Cookie": setCookie("bm_sess", `${b64url(enc.encode(email))}.${sexp}.${ssig}`, SESSION_TTL) });
      }
    }
    return json({ ok: false }, 401);
  }

  if (url.pathname === "/__auth/logout") {
    return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": setCookie("bm_sess", "", 0) } });
  }

  if (await validSession(secret, request)) return next();
  return html(LOGIN);
}

const LOGIN = `<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content="noindex,nofollow"><title>KH Brand Manual — sign in</title>
<style>:root{--ink:#15150f;--paper:#f4f2ec;--accent:#FF6000;--mute:#8a8a82;--line:#dcd9d1}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--paper);color:var(--ink);font-family:'Titillium Web',system-ui,sans-serif}.card{width:min(92vw,360px);padding:34px 30px;border:1px solid var(--line);border-radius:0 16px 0 0;background:#fff}h1{font-weight:600;font-size:20px;margin:0 0 4px}p{color:var(--mute);font-size:13px;margin:0 0 22px;line-height:1.5}label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin:0 0 6px}input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;font-size:15px;font-family:inherit;margin-bottom:14px}button{width:100%;padding:11px;border:0;border-radius:8px;background:var(--ink);color:var(--paper);font-size:14px;font-family:inherit;cursor:pointer}button:hover{background:var(--accent)}.msg{font-size:13px;margin-top:14px;min-height:1.2em}.hide{display:none}</style>
<body><div class=card>
<h1>KH Brand Manual</h1><p>Private. Enter your email — we'll send a one-time PIN.</p>
<div id=s1><label>Email</label><input id=email type=email autocomplete=email placeholder="you@kh-group.eu"><button onclick=req()>Send PIN</button></div>
<div id=s2 class=hide><label>PIN (check your email)</label><input id=pin inputmode=numeric maxlength=6 placeholder="000000"><button onclick=ver()>Sign in</button></div>
<div class=msg id=msg></div>
</div><script>
var M=document.getElementById('msg');
async function req(){var e=document.getElementById('email').value.trim();if(!e)return;M.textContent='Sending…';await fetch('/__auth/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:e})});document.getElementById('s1').classList.add('hide');document.getElementById('s2').classList.remove('hide');M.textContent='If your email is on the list, a PIN is on its way.';}
async function ver(){var e=document.getElementById('email').value.trim(),p=document.getElementById('pin').value.trim();M.textContent='Checking…';var r=await fetch('/__auth/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:e,pin:p})});if(r.ok){M.textContent='Welcome.';location.href='/';}else{M.textContent='Wrong or expired PIN.';}}
</script></body></html>`;
