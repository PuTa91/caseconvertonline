export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Only redirect on the root path
  if (url.pathname !== "/") return next();

  // If the user already chose a language, respect it
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)cc_lang=([a-z]{2})/i);
  const savedLang = match ? match[1].toLowerCase() : null;
  const supported = new Set(["en","hu","de","fr","es","nl","pt","pl"]);
  if (savedLang && supported.has(savedLang)) {
    if (savedLang === "en") return next();
    url.pathname = `/${savedLang}/`;
    return Response.redirect(url.toString(), 302);
  }

  // If URL already has ?lang=xx, respect it (optional manual override)
  const qp = (url.searchParams.get("lang") || "").toLowerCase();
  if (qp && supported.has(qp)) {
    const resUrl = new URL(request.url);
    resUrl.searchParams.delete("lang");
    if (qp !== "en") resUrl.pathname = `/${qp}/`;
    else resUrl.pathname = `/`;
    const res = Response.redirect(resUrl.toString(), 302);
    res.headers.append("Set-Cookie", `cc_lang=${qp}; Path=/; Max-Age=31536000; SameSite=Lax`);
    return res;
  }

  // Cloudflare country header (free, no external API)
  const country = (request.headers.get("CF-IPCountry") || "").toUpperCase();

  const countryMap = {
    HU: "hu",
    DE: "de", AT: "de", CH: "de",
    FR: "fr", BE: "fr", LU: "fr",
    ES: "es",
    NL: "nl",
    PT: "pt", BR: "pt",
    PL: "pl"
  };

  // 1) Country → language
  let lang = countryMap[country] || null;

  // 2) Fallback: Accept-Language
  if (!lang) {
    const al = (request.headers.get("Accept-Language") || "").toLowerCase();
    const pick = ["hu","de","fr","es","nl","pt","pl","en"].find(l => al.includes(l));
    lang = pick || "en";
  }

  // Default stays on /
  if (lang === "en") return next();

  url.pathname = `/${lang}/`;
  const res = Response.redirect(url.toString(), 302);
  res.headers.append("Set-Cookie", `cc_lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`);
  return res;
}
