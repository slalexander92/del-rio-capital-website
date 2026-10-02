import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "./build-site.mjs";
import { renderLayout } from "./templates/layout.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");

// Package only generated pages and public assets; source and archives stay local.
const { pages } = await buildSite();
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const page of pages) {
  const relativePath = path.relative(root, page.outputPath);
  const destination = path.join(output, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(page.outputPath, destination);
}

await cp(path.join(root, "assets"), path.join(output, "assets"), {
  recursive: true,
});
await cp(path.join(root, "sitemap.xml"), path.join(output, "sitemap.xml"));
await writeFile(
  path.join(output, "robots.txt"),
  "User-agent: *\nDisallow: /\n",
);
await writeFile(
  path.join(output, "_headers"),
  "/*\n  X-Robots-Tag: noindex, nofollow\n",
);

// A real 404 prevents the static host from treating unknown paths as app routes.
await writeFile(
  path.join(output, "404.html"),
  renderLayout({
    title: "Page not found | Del Rio Capital",
    description: "Find your way back to Del Rio Capital.",
    path: "/404.html",
    content: `
      <section class="page-hero">
        <div class="container">
          <p class="eyebrow">Page not found</p>
          <h1 class="display-title">Let’s get you back.</h1>
          <p class="page-intro">The page you’re looking for isn’t available.</p>
          <div class="hero-actions">
            <a class="button button-light" href="/">Return home</a>
            <a class="hero-text-link" href="/portfolio/">View our portfolio</a>
          </div>
        </div>
      </section>
    `,
  }),
);

console.log(`Prepared ${pages.length} pages for Cloudflare in ${output}.`);
