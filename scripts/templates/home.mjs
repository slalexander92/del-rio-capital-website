import { escapeHtml } from "./layout.mjs";
import { renderPartnerCard, renderPropertyCard } from "./pages.mjs";

// The homepage connects the investment thesis to real assets and the people behind them.
export function renderHome(site) {
  const area = site.properties.reduce(
    (total, property) => total + property.area,
    0,
  );
  const price = site.properties.reduce(
    (total, property) => total + property.purchasePrice,
    0,
  );

  return `
      <section class="hero" aria-labelledby="hero-title">
        <img class="hero-image" src="/assets/images/tolleson.webp" width="1351" height="900" alt="Industrial building at 700 South 94th Avenue in Tolleson, Arizona" fetchpriority="high">
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="container hero-content">
          <p class="eyebrow">Southwest industrial real estate</p>
          <h1 class="hero-title" id="hero-title">Industrial focus.<br><span class="serif-accent">Exceptional potential.</span></h1>
          <p class="hero-description">Value-add and opportunistic industrial investments across the Southwest U.S., built on local insight and hands-on execution.</p>
          <div class="hero-actions">
            <a class="button button-light" href="/portfolio/">View our portfolio</a>
            <a class="hero-text-link" href="/about/">About Del Rio Capital</a>
          </div>
        </div>
        <div class="hero-caption">700 S. 94th Avenue <span>Tolleson, AZ</span></div>
      </section>

      <section class="investment-strip" aria-label="Selected portfolio at a glance">
        <div class="container investment-strip-inner">
          <div class="strip-intro"><span class="eyebrow">Selected portfolio</span><p>Acquisition<br>overview</p></div>
          <div class="strip-stat"><strong>$${(price / 1000000).toFixed(2)}<span>M</span></strong><span>Selected acquisition value · USD</span></div>
          <div class="strip-stat"><strong>${new Intl.NumberFormat("en-US").format(area)}</strong><span>Square feet in selected portfolio</span></div>
          <div class="strip-stat strip-focus"><strong>Southwest</strong><span>One region. A clear investment focus.</span></div>
        </div>
      </section>

      <section class="section approach-section" id="approach" aria-labelledby="approach-title">
        <div class="container">
          <div class="section-heading">
            <div><p class="eyebrow">Our approach</p><h2 class="section-title" id="approach-title">Identify potential.<br><span class="serif-accent">Create value.</span></h2></div>
            <div class="section-copy"><p>We acquire industrial properties with untapped potential in the Southwest’s established markets. A focused strategy and hands-on execution turn that potential into better buildings and stronger tenancy.</p><a class="text-link" href="/about/#approach">Read about our investment approach</a></div>
          </div>
          <div class="principles-grid">
            <article class="principle"><h3>Find the right basis.</h3><p>Identify value-add and opportunistic acquisitions in desirable industrial locations.</p></article>
            <article class="principle"><h3>Invest with intention.</h3><p>Modernize properties through targeted capital improvements and a clear asset-level plan.</p></article>
            <article class="principle"><h3>Execute on the details.</h3><p>Take an active approach to renovation, leasing, and repositioning each investment.</p></article>
          </div>
        </div>
      </section>

      <section class="section portfolio-section" aria-labelledby="portfolio-title">
        <div class="container">
          <div class="section-heading portfolio-heading"><div><p class="eyebrow">Our portfolio</p><h2 class="section-title" id="portfolio-title">Selected<br><span class="serif-accent">investments.</span></h2></div><a class="text-link" href="/portfolio/">View all properties</a></div>
          <div class="properties-grid">${site.properties.map((property, index) => renderPropertyCard(property, index)).join("")}</div>
        </div>
      </section>

      <section class="section partners-section" aria-labelledby="partners-title">
        <div class="container leadership-layout">
          <div class="leadership-intro"><p class="eyebrow">Leadership</p><h2 class="section-title" id="partners-title">Meet the<br><span class="serif-accent">partners.</span></h2><p>Del Rio Capital is led by Gaelan Kerr-Koppel and Ed Whittemore, with a shared focus on industrial real estate and the work that creates value.</p><a class="text-link" href="/about/#partners">About our partners</a></div>
          <div class="partners-grid">${site.partners.map(renderPartnerCard).join("")}</div>
        </div>
      </section>

      <section class="contact-cta" aria-labelledby="connect-title">
        <div class="container contact-cta-inner"><div><p class="eyebrow">Acquisitions &amp; capital partnerships</p><h2 id="connect-title">Start a<br><span class="serif-accent">conversation.</span></h2></div><div class="cta-copy"><p>Share an industrial acquisition opportunity or discuss a potential investment partnership with our team.</p><a class="button button-light" href="/contact/">Contact Del Rio Capital</a><a class="cta-email" href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></div></div>
      </section>`;
}
