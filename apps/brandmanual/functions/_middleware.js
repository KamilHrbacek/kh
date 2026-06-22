// HTTP Basic Auth gate for the whole brand manual (Cloudflare Pages Function).
// Fail-CLOSED: with no credentials configured it denies everything, so the manual
// is never accidentally public. Set BM_USER + BM_PASS as env vars on the
// kh-brandmanual Pages project (dashboard → Settings → Variables, or
// `wrangler pages secret put`). noindex alone is not protection — this is.
export async function onRequest(context) {
  const { request, env, next } = context;
  const USER = env.BM_USER;
  const PASS = env.BM_PASS;

  const deny = () =>
    new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="KH Brand Manual", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow",
      },
    });

  if (!USER || !PASS) return deny(); // not configured yet → stay private

  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) return deny();

  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return deny();
  }
  const idx = decoded.indexOf(":");
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (user !== USER || pass !== PASS) return deny();

  return next();
}
