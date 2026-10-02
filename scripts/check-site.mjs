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

for (const [filePath, html] of pageDocuments) {
  checkMetadata(filePath, html);
  await checkReferences(filePath, html);
}

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
    `Verified ${pages.length} generated pages, local links and assets, page metadata, and JavaScript syntax.`,
  );
}

function checkMetadata(filePath, html) {
  const label = path.relative(root, filePath);
  const required = [
    [/<html\b[^>]*\blang=["']en["']/i, "English document language"],
    [/<title>[^<]+<\/title>/i, "page title"],
    [
      /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i,
      "page description",
    ],
    [
      /<link\b[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["']/i,
      "canonical URL",
    ],
    [/<main\b[^>]*id=["']main["']/i, "main landmark"],
  ];

  for (const [pattern, name] of required) {
    if (!pattern.test(html)) {
      errors.push(`${label}: missing ${name}.`);
    }
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

// Resolve internal links as a browser would, including links to another page's IDs.
async function checkReferences(filePath, html) {
  const pagePath = pages.find((page) => page.outputPath === filePath).path;
  const base = new URL(pagePath, domain);
  const references = [
    ...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi),
  ].map((match) => match[1]);

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
