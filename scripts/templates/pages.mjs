import { escapeHtml } from "./layout.mjs";

// Supporting pages share the same content model so adding a property or partner
// requires a content change, while presentation and links stay consistent.
export function renderAbout(site) {
  return `
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">About Del Rio Capital</p>
        <h1 class="display-title">Built on conviction.<br>Driven by <span class="serif-accent">execution.</span></h1>
        <p class="page-intro">${escapeHtml(site.description)}</p>
      </div>
    </section>

    <section id="approach" class="section about-approach" aria-labelledby="approach-heading">
      <div class="container approach-layout">
        <div class="approach-heading">
          <p class="eyebrow">Our approach</p>
          <h2 id="approach-heading" class="section-title">See the potential.<br><span class="serif-accent">Do the work.</span></h2>
        </div>
        <div class="approach-narrative">
          <p class="approach-introduction">Del Rio Capital pursues industrial properties where focused capital investment and hands-on execution can unlock value. Our approach brings acquisition, renovation, and leasing together around a clear business plan.</p>
          <article class="approach-topic">
            <h3>Acquisition opportunities</h3>
            <p>We work with brokers and owners to identify value-add and opportunistic industrial acquisitions across the Southwest U.S.</p>
            <a class="text-link" href="/contact/#acquisitions">Discuss an acquisition</a>
          </article>
          <article class="approach-topic">
            <h3>Capital partnerships</h3>
            <p>We welcome conversations with investors and capital partners who share our focus on industrial real estate and disciplined execution.</p>
            <a class="text-link" href="/contact/#partnerships">Discuss a partnership</a>
          </article>
        </div>
      </div>
    </section>

    <section id="partners" class="section partners-section" aria-labelledby="partners-heading">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Our partners</p>
          <h2 id="partners-heading" class="section-title">A focused platform.<br><span class="serif-accent">A personal commitment.</span></h2>
          <p class="section-copy">Meet the partners behind Del Rio Capital.</p>
        </div>
        <div class="partners-grid">
          ${site.partners.map(renderPartnerCard).join("")}
        </div>
      </div>
    </section>

    <section class="section about-portfolio" aria-labelledby="about-portfolio-heading">
      <div class="container about-portfolio-inner">
        <div>
          <p class="eyebrow">The work behind the strategy</p>
          <h2 id="about-portfolio-heading" class="section-title">Real assets.<br><span class="serif-accent">Tangible progress.</span></h2>
        </div>
        <a class="text-link" href="/portfolio/">View our portfolio</a>
      </div>
    </section>
  `;
}

export function renderPortfolio(site) {
  return `
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">Our portfolio</p>
        <h1 class="display-title">Our <span class="serif-accent">portfolio.</span></h1>
        <p class="page-intro">Explore our industrial properties, acquisition details, and business plans across the Southwest U.S.</p>
      </div>
    </section>

    <section class="section portfolio-section" aria-labelledby="portfolio-heading">
      <div class="container">
        <div class="portfolio-heading">
          <h2 id="portfolio-heading" class="eyebrow">Selected investments</h2>
          <span class="portfolio-count">${escapeHtml(site.properties.length)} properties</span>
        </div>
        <div class="properties-grid">
          ${site.properties.map(renderPropertyCard).join("")}
        </div>
      </div>
    </section>
  `;
}

export function renderProperty(property, site) {
  const propertyIndex = site.properties.findIndex(
    ({ slug }) => slug === property.slug,
  );
  const nextProperty =
    site.properties.length > 1
      ? site.properties[(propertyIndex + 1) % site.properties.length]
      : null;
  const facts = [
    { label: "Building area", value: `${formatNumber(property.area)} SF` },
    { label: "Asset type", value: property.type },
    { label: "Market", value: property.market },
    { label: "Purchase price", value: formatCurrency(property.purchasePrice) },
    {
      label: "Price per square foot",
      value: `${formatCurrency(property.pricePerSquareFoot)} / SF`,
    },
  ];
  // Numeric content owns the standard facts; optional details only add new labels.
  const factLabels = new Set(
    facts.map(({ label }) => label.trim().toLowerCase()),
  );
  for (const fact of property.facts || []) {
    const label = fact.label.trim().toLowerCase();
    if (!factLabels.has(label)) {
      facts.push(fact);
      factLabels.add(label);
    }
  }

  return `
    <section class="property-detail-hero">
      <div class="container">
        <nav class="property-breadcrumb" aria-label="Breadcrumb">
          <a href="/portfolio/">Back to portfolio</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">${escapeHtml(property.city)}, ${escapeHtml(property.state)}</span>
        </nav>
        <p class="eyebrow">${escapeHtml(property.type)}</p>
        <h1 class="display-title">${escapeHtml(property.address)}</h1>
        <div class="property-detail-meta">
          <p>${escapeHtml(property.city)}, ${escapeHtml(property.state)}</p>
          <span>${formatNumber(property.area)} SF</span>
        </div>
      </div>
      <div class="property-detail-image">
        <img src="${escapeHtml(property.image)}" alt="${escapeHtml(property.address)}, ${escapeHtml(property.city)} industrial property" width="1350" height="900" fetchpriority="high">
      </div>
    </section>

    <section class="section property-detail-section" aria-labelledby="property-story-heading">
      <div class="container property-detail-layout">
        <aside class="property-facts" aria-label="Property facts">
          <p class="eyebrow">At a glance</p>
          <dl>${facts.map(renderFact).join("")}</dl>
          ${
            property.outcome
              ? `
            <div class="outcome-panel">
              <p class="eyebrow">${escapeHtml(property.outcome.label)}</p>
              <p>${escapeHtml(property.outcome.text)}</p>
            </div>
          `
              : ""
          }
        </aside>
        <article class="property-story">
          <p class="eyebrow">The investment</p>
          <h2 id="property-story-heading" class="section-title">The opportunity.</h2>
          <p class="property-summary">${escapeHtml(property.summary)}</p>
          <div class="property-story-block">
            ${property.story.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </div>
          ${
            property.strategy
              ? `
            <div class="property-strategy">
              <h3>The business plan</h3>
              <p>${escapeHtml(property.strategy)}</p>
            </div>
          `
              : ""
          }
          ${
            property.highlights.length
              ? `
            <div class="property-highlights">
              <h3>Investment highlights</h3>
              <ul>${property.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul>
            </div>
          `
              : ""
          }
        </article>
      </div>
    </section>

    <section class="section property-next" aria-labelledby="property-next-heading">
      <div class="container property-next-inner">
        <div>
          <p class="eyebrow">Start a conversation</p>
          <h2 id="property-next-heading" class="section-title">See an opportunity?<br><span class="serif-accent">Let’s connect.</span></h2>
        </div>
        <a class="button button-primary" href="/contact/">Contact Del Rio Capital</a>
      </div>
      <nav class="container property-navigation" aria-label="Property navigation">
        <a class="text-link" href="/portfolio/">Back to portfolio</a>
        ${
          nextProperty
            ? `<a class="text-link" href="/portfolio/${escapeHtml(nextProperty.slug)}/" aria-label="View property details: ${escapeHtml(nextProperty.address)}, ${escapeHtml(nextProperty.city)}, ${escapeHtml(nextProperty.state)}">Next property: ${escapeHtml(nextProperty.address)}</a>`
            : ""
        }
      </nav>
    </section>
  `;
}

export function renderContact(site) {
  return `
    <section class="page-hero contact-hero">
      <div class="container">
        <p class="eyebrow">Contact Del Rio Capital</p>
        <h1 class="display-title">Contact<br><span class="serif-accent">Del Rio Capital.</span></h1>
        <p class="page-intro">Speak with our team about industrial acquisitions, investment opportunities, and capital partnerships.</p>
      </div>
    </section>

    <section class="section contact-section" aria-labelledby="contact-heading">
      <div class="container contact-layout">
        <div class="contact-intro">
          <p class="eyebrow">Get in touch</p>
          <h2 id="contact-heading" class="section-title">Direct access.<br><span class="serif-accent">Open conversation.</span></h2>
          <p>Connect with Gaelan Kerr-Koppel to discuss industrial acquisitions, investment opportunities, or working with Del Rio Capital.</p>
        </div>
        <div class="contact-links">
          ${renderContactRow("Email", site.email, `mailto:${site.email}`)}
          ${renderContactRow("Phone", site.phone.label, site.phone.href)}
          ${renderContactRow("LinkedIn", "View Del Rio Capital on LinkedIn", site.linkedin)}
        </div>
      </div>
    </section>

    <section class="section contact-audiences" aria-labelledby="contact-audiences-heading">
      <div class="container">
        <h2 id="contact-audiences-heading" class="section-title">Who we work with</h2>
        <div class="audience-directory">
          <article id="acquisitions" class="audience-row" tabindex="-1">
            <h3>Brokers &amp; owners</h3>
            <p>Have an industrial property with potential? Share the location, property details, and opportunity with our team.</p>
            <a class="text-link" href="mailto:${escapeHtml(site.email)}?subject=Industrial%20acquisition%20opportunity">Discuss an acquisition</a>
          </article>
          <article id="partnerships" class="audience-row" tabindex="-1">
            <h3>Investors &amp; capital partners</h3>
            <p>Interested in our platform and investment approach? We welcome a conversation about potential alignment.</p>
            <a class="text-link" href="mailto:${escapeHtml(site.email)}?subject=Capital%20partnership%20inquiry">Discuss a partnership</a>
          </article>
        </div>
      </div>
    </section>
  `;
}

export function renderPartnerCard(partner) {
  return `
    <article class="partner-card">
      <div class="partner-photo" style="--portrait-scale: ${escapeHtml(partner.portrait?.scale ?? 1)}; --portrait-offset-y: ${escapeHtml(partner.portrait?.offsetY ?? 0)}%;">
        <img src="${escapeHtml(partner.image)}" alt="${escapeHtml(partner.name)}, Partner at Del Rio Capital" width="720" height="800" loading="lazy" decoding="async">
      </div>
      <div class="partner-info">
        <div>
          <h3>${escapeHtml(partner.name)}</h3>
          <p class="partner-role">${escapeHtml(partner.role)}</p>
        </div>
        <a class="partner-social" href="${escapeHtml(partner.linkedin)}" aria-label="View ${escapeHtml(partner.name)}’s LinkedIn profile">View LinkedIn profile</a>
      </div>
    </article>
  `;
}

export function renderPropertyCard(property) {
  return `
    <article class="property-card">
      <div class="property-image">
        <img src="${escapeHtml(property.image)}" alt="${escapeHtml(property.address)}, ${escapeHtml(property.city)}, ${escapeHtml(property.state)} industrial property" width="1350" height="900" loading="lazy" decoding="async">
        <span class="property-type">${escapeHtml(property.type)}</span>
      </div>
      <div class="property-card-body">
        <p class="property-location">${escapeHtml(property.city)}, ${escapeHtml(property.state)}</p>
        <h3 class="property-name"><a href="/portfolio/${escapeHtml(property.slug)}/">${escapeHtml(property.address)}</a></h3>
        <p class="property-card-summary">${escapeHtml(property.summary)}</p>
        <dl class="property-stats">
          ${renderFact({ label: "Building area", value: `${formatNumber(property.area)} SF` })}
          ${renderFact({ label: "Purchase price", value: formatCurrency(property.purchasePrice) })}
        </dl>
        <a class="property-card-link text-link" href="/portfolio/${escapeHtml(property.slug)}/" aria-label="View property details: ${escapeHtml(property.address)}, ${escapeHtml(property.type)}">View property details</a>
      </div>
    </article>
  `;
}

function renderContactRow(label, value, href) {
  return `
    <div class="contact-row">
      <span class="contact-label">${escapeHtml(label)}</span>
      <a href="${escapeHtml(href)}">${escapeHtml(value)}</a>
    </div>
  `;
}

function renderFact({ label, value }) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
