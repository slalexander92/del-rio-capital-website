import { siteContent } from "../../data/site-content.mjs";

// One shared document owns navigation, brand assets, metadata, and contact details.
export function renderLayout({
  title,
  description,
  path,
  activeNav,
  content,
  bodyClass = "",
  image = "/assets/images/tolleson.webp",
  imageAlt = "Del Rio Capital industrial property in Tolleson, Arizona",
}) {
  const canonical = new URL(path, siteContent.domain).href;
  const socialImage = new URL(image, siteContent.domain).href;
  const schema =
    path === "/"
      ? `<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteContent.name,
          url: siteContent.domain,
          logo: `${siteContent.domain}/assets/del-rio-capital-logo.svg`,
          description: siteContent.description,
          email: siteContent.email,
          telephone: siteContent.phone.href.replace("tel:", ""),
          sameAs: [siteContent.linkedin],
          areaServed: "Southwest United States",
        }).replaceAll("<", "\\u003c")}</script>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#142e27">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(socialImage)}">
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
    ${path === "/" ? '<link rel="preload" href="/assets/images/tolleson.webp" as="image" fetchpriority="high">' : ""}
    <link rel="stylesheet" href="/assets/styles.css">
    ${schema}
  </head>
  <body class="${escapeHtml(bodyClass)}">
    <a class="skip-link" href="#main">Skip to content</a>
    ${renderHeader(activeNav)}
    <main id="main" tabindex="-1">${content}</main>
    ${renderFooter()}
  </body>
</html>
`;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function renderHeader(activeNav) {
  return `<header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="/" aria-label="Del Rio Capital home">
          <img src="/assets/del-rio-capital-logo.svg" alt="Del Rio Capital" width="144" height="98">
        </a>
        <nav class="site-nav" id="primary-navigation" aria-label="Primary navigation">
          <a class="nav-link" href="/" ${activeNav === "home" ? 'aria-current="page"' : ""}>Home</a>
          <a class="nav-link" href="/about/" ${activeNav === "about" ? 'aria-current="page"' : ""}>About</a>
          <a class="nav-link" href="/portfolio/" ${activeNav === "portfolio" ? 'aria-current="page"' : ""}>Portfolio</a>
          <a class="nav-link" href="/contact/" ${activeNav === "contact" ? 'aria-current="page"' : ""}>Contact</a>
        </nav>
      </div>
    </header>`;
}

function renderFooter() {
  return `<footer class="site-footer">
      <div class="container footer-top">
        <div class="footer-brand">
          <a href="/" aria-label="Del Rio Capital home"><img src="/assets/del-rio-capital-logo.svg" alt="Del Rio Capital" width="180" height="125" loading="lazy"></a>
          <p>Industrial focus.<br>Southwest opportunity.</p>
        </div>
        <div class="footer-column">
          <span class="footer-label">Explore</span>
          <a href="/about/">About Del Rio Capital</a>
          <a href="/portfolio/">Portfolio</a>
          <a href="/about/#partners">Partners</a>
        </div>
        <div class="footer-column footer-connect">
          <span class="footer-label">Connect</span>
          <a href="mailto:${escapeHtml(siteContent.email)}">${escapeHtml(siteContent.email)}</a>
          <a href="${escapeHtml(siteContent.phone.href)}">${escapeHtml(siteContent.phone.label)}</a>
          <a class="footer-social" href="${escapeHtml(siteContent.linkedin)}">Del Rio Capital on LinkedIn</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${new Date().getFullYear()} Del Rio Capital. All rights reserved.</span>
        <span>Commercial real estate investment · Southwest U.S.</span>
      </div>
    </footer>`;
}
