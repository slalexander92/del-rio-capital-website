import { readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "./build-site.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { domain, pages } = await buildSite();
const errors = [];
const pageDocuments = new Map();

for (const page of pages) {
  pageDocuments.set(page.outputPath, await readFile(page.outputPath, "utf8"));
}

for (const page of pages) {
  const html = pageDocuments.get(page.outputPath);
  checkMetadata(page, html);
  await checkReferences(page.outputPath, html);
}

await checkDiscoveryFiles();

for (const directory of ["scripts", "data", "assets"]) {
  for (const filePath of await findJavaScriptFiles(
    path.join(root, directory),
  )) {
    const result = spawnSync(process.execPath, ["--check", filePath], {
      encoding: "utf8",
    });

    if (result.status !== 0) {
      errors.push(
        `${path.relative(root, filePath)}: ${result.stderr.trim() || result.error?.message || "JavaScript syntax check failed"}`,
      );
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${pages.length} generated pages, local links and assets, page metadata, sitemap and robots directives, and JavaScript syntax.`,
  );
}

function checkMetadata(page, html) {
  const label = path.relative(root, page.outputPath);
  const required = [
    [/<html\b[^>]*\blang=["']en["']/i, "English document language"],
    [/<title>[^<]+<\/title>/i, "page title"],
    [
      /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i,
      "page description",
    ],
    [/<main\b[^>]*id=["']main["']/i, "main landmark"],
  ];

  for (const [pattern, name] of required) {
    if (!pattern.test(html)) {
      errors.push(`${label}: missing ${name}.`);
    }
  }

  // Canonical and share URLs must identify this page on the production domain.
  const expectedUrl = new URL(page.path, domain).href;

  for (const [pattern, name] of [
    [
      /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/gi,
      "canonical URL",
    ],
    [
      /<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/gi,
      "Open Graph URL",
    ],
  ]) {
    const urls = [...html.matchAll(pattern)].map((match) =>
      decodeHtmlAttribute(match[1]),
    );

    if (urls.length !== 1 || urls[0] !== expectedUrl) {
      errors.push(`${label}: expected one ${name} equal to ${expectedUrl}.`);
    }
  }

  if (
    /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
  ) {
    errors.push(`${label}: production pages must allow indexing.`);
  }

  if ((html.match(/<h1\b/gi) || []).length !== 1) {
    errors.push(`${label}: expected one page heading.`);
  }

  if (/<form\b/i.test(html)) {
    errors.push(`${label}: contact forms should be removed.`);
  }

  if (
    /example@example\.com|phone number pending|LinkedIn URL pending|lorem ipsum/i.test(
      html,
    )
  ) {
    errors.push(`${label}: contains placeholder content.`);
  }
}

// Search engines must discover each canonical page and a crawlable sitemap.
async function checkDiscoveryFiles() {
  const [sitemap, robots] = await Promise.all([
    readFile(path.join(root, "sitemap.xml"), "utf8"),
    readFile(path.join(root, "robots.txt"), "utf8"),
  ]);
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeHtmlAttribute(match[1]),
  );
  const expectedLocations = pages.map((page) => new URL(page.path, domain).href);

  if (
    locations.length !== expectedLocations.length ||
    new Set(locations).size !== locations.length ||
    expectedLocations.some((location) => !locations.includes(location))
  ) {
    errors.push("sitemap.xml: expected every canonical page exactly once.");
  }

  if (
    !/^User-agent:[ \t]*\*[ \t]*$/im.test(robots) ||
    !/^Allow:[ \t]*\/[ \t]*$/im.test(robots) ||
    /^Disallow:[ \t]*\/[ \t]*$/im.test(robots)
  ) {
    errors.push("robots.txt: production pages must allow crawling.");
  }

  const sitemapDirectives = [
    ...robots.matchAll(/^Sitemap:[ \t]*(\S+)[ \t]*$/gim),
  ];

  if (
    sitemapDirectives.length !== 1 ||
    sitemapDirectives[0][1] !== `${domain}/sitemap.xml`
  ) {
    errors.push("robots.txt: expected one sitemap URL on the production domain.");
  }
}

// Resolve internal links as a browser would, including links to another page's IDs.
async function checkReferences(filePath, html) {
  const pagePath = pages.find((page) => page.outputPath === filePath).path;
  const base = new URL(pagePath, domain);
  const references = [
    ...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi),
  ].map((match) => match[1]);
  references.push(
    ...[...html.matchAll(/\b(?:srcset|imagesrcset)\s*=\s*["']([^"']+)["']/gi)]
      .flatMap((match) => match[1].split(","))
      .map((candidate) => candidate.trim().split(/\s+/)[0]),
  );

  for (const reference of references) {
    let url;

    try {
      url = new URL(decodeHtmlAttribute(reference), base);
    } catch {
      errors.push(
        `${path.relative(root, filePath)}: invalid URL ${reference}.`,
      );
      continue;
    }

    if (url.origin !== base.origin) {
      continue;
    }

    let destination;

    try {
      destination = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
      const relativePath = path.relative(root, destination);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error("URL points outside the website");
      }

      const fileStats = await stat(destination);

      if (fileStats.isDirectory()) {
        destination = path.join(destination, "index.html");
        await stat(destination);
      }
    } catch {
      errors.push(
        `${path.relative(root, filePath)}: missing local target ${reference}.`,
      );
      continue;
    }

    if (url.hash && destination.endsWith(".html")) {
      const destinationHtml =
        pageDocuments.get(destination) || (await readFile(destination, "utf8"));
      const ids = [
        ...destinationHtml.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi),
      ].map((match) => match[1]);
      const anchor = decodeURIComponent(url.hash.slice(1));

      if (!ids.includes(anchor)) {
        errors.push(
          `${path.relative(root, filePath)}: missing anchor ${reference}.`,
        );
      }
    }
  }
}

async function findJavaScriptFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findJavaScriptFiles(filePath)));
    } else if (/\.(?:mjs|js)$/.test(entry.name)) {
      files.push(filePath);
    }
  }

  return files;
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
