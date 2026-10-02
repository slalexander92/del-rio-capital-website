import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSite } from "./build-site.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4173", 10);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

await buildSite();

// Serve the generated site without caching so local revisions appear immediately.
const server = createServer(async (request, response) => {
  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(request.url || "/", "http://localhost").pathname,
    );

    if (pathname.includes("\0")) {
      throw new Error("Invalid path");
    }
  } catch {
    sendError(response, 400, "Bad request");
    return;
  }

  const filePath = await resolveFilePath(pathname);

  if (!filePath) {
    sendError(response, 404, "Not found");
    return;
  }

  try {
    const contents = await readFile(filePath);
    response.statusCode = 200;
    response.setHeader(
      "Content-Type",
      mimeTypes[path.extname(filePath).toLowerCase()] ||
        "application/octet-stream",
    );
    response.setHeader("Cache-Control", "no-store");
    response.end(contents);
  } catch {
    sendError(response, 404, "Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Del Rio Capital local site: http://${host}:${port}`);
});

async function resolveFilePath(pathname) {
  let filePath = path.resolve(root, `.${pathname}`);

  if (!isInsideRoot(filePath)) {
    return null;
  }

  try {
    const fileStats = await stat(filePath);

    if (fileStats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    return filePath;
  } catch {
    return null;
  }
}

function isInsideRoot(filePath) {
  const relativePath = path.relative(root, filePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function sendError(response, status, message) {
  response.statusCode = status;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(message);
}
