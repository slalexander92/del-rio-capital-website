import {
  mkdir,
  readFile,
  rename,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteContent } from "../data/site-content.mjs";
import { renderLayout } from "./templates/layout.mjs";
import { renderHome } from "./templates/home.mjs";
import {
  renderAbout,
  renderPortfolio,
  renderProperty,
  renderContact,
} from "./templates/pages.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, ".generated-pages.json");

// Generate crawlable pages from shared content and templates for any static host.
export async function buildSite() {
  const domain = new URL(siteContent.domain).origin;
  const pages = createPages();

  if (new Set(pages.map((page) => page.path)).size !== pages.length) {
    throw new Error(
      "Each property needs a unique slug so its detail page has a unique URL.",
    );
  }

  for (const page of pages) {
    page.outputPath = path.join(root, page.path, "index.html");
    await mkdir(path.dirname(page.outputPath), { recursive: true });
    await writeFile(page.outputPath, renderLayout(page), "utf8");
  }

  await writeFile(
    path.join(root, "sitemap.xml"),
    renderSitemap(domain, pages),
    "utf8",
  );
  await writeFile(
    path.join(root, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`,
    "utf8",
  );
  await syncGeneratedPages(pages);

  return { domain, pages };
}

function createPages() {
  return [
    {
      title: "Del Rio Capital | Southwest Industrial Real Estate Investment",
      description: siteContent.description,
      path: "/",
      activeNav: "home",
      bodyClass: "home-page",
      content: renderHome(siteContent),
    },
    {
      title: "About | Del Rio Capital",
      description:
        "Meet the partners and learn about Del Rio Capital’s approach to industrial investment across the Southwest U.S.",
      path: "/about/",
      activeNav: "about",
      content: renderAbout(siteContent),
    },
    {
      title: "Portfolio | Del Rio Capital",
      description:
        "Explore Del Rio Capital’s industrial real estate investments across the Southwest U.S. and the business plans behind each acquisition.",
      path: "/portfolio/",
      activeNav: "portfolio",
      content: renderPortfolio(siteContent),
    },
    ...siteContent.properties.map(createPropertyPage),
    {
      title: "Contact | Del Rio Capital",
      description:
        "Contact Del Rio Capital directly to discuss industrial acquisition opportunities and investment partnerships across the Southwest U.S.",
      path: "/contact/",
      activeNav: "contact",
      content: renderContact(siteContent),
    },
  ];
}

function createPropertyPage(property) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(property.slug)) {
    throw new Error(
      `Property slugs must contain lowercase letters, numbers, and hyphens: ${property.slug}`,
    );
  }

  return {
    title: `${property.address}, ${property.city}, ${property.state} | Del Rio Capital`,
    description: property.summary,
    path: `/portfolio/${property.slug}/`,
    activeNav: "portfolio",
    image: property.image,
    imageAlt: `${property.address}, ${property.city}, ${property.state}`,
    content: renderProperty(property, siteContent),
  };
}

function renderSitemap(domain, pages) {
  const locations = pages.map(
    (page) => `  <url><loc>${escapeXml(`${domain}${page.path}`)}</loc></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations.join("\n")}\n</urlset>\n`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Remove only recorded property HTML when data changes; preserve other files.
async function syncGeneratedPages(pages) {
  const currentFiles = pages.map((page) =>
    path.relative(root, page.outputPath).split(path.sep).join("/"),
  );
  const previousFiles = await readGeneratedPages();

  for (const file of previousFiles) {
    if (
      currentFiles.includes(file) ||
      !/^portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*\/index\.html$/.test(file)
    ) {
      continue;
    }

    const filePath = path.join(root, file);

    try {
      await unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    try {
      await rmdir(path.dirname(filePath));
    } catch (error) {
      if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) {
        throw error;
      }
    }
  }

  const temporaryManifest = `${manifestPath}.${process.pid}.tmp`;
  await writeFile(
    temporaryManifest,
    `${JSON.stringify(currentFiles, null, 2)}\n`,
    "utf8",
  );
  await rename(temporaryManifest, manifestPath);
}

async function readGeneratedPages() {
  try {
    const files = JSON.parse(await readFile(manifestPath, "utf8"));

    if (
      !Array.isArray(files) ||
      files.some((file) => typeof file !== "string")
    ) {
      throw new Error(
        "The generated-page manifest must contain an array of file paths.",
      );
    }

    return files;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { pages } = await buildSite();
  console.log(`Built ${pages.length} static pages.`);
}
