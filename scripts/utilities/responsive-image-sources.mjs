import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const variantWidths = [320, 640, 960, 1280];

// Use available smaller exports, falling back to the original for new images.
export function responsiveImageSources(source, originalWidth) {
  const extension = path.posix.extname(source);
  const stem = source.slice(0, -extension.length);
  const variants = variantWidths
    .filter((width) => width < originalWidth)
    .map((width) => ({
      source: `${stem}-${width}${extension}`,
      width,
    }))
    .filter((image) => existsSync(path.join(root, image.source)));

  return [...variants, { source, width: originalWidth }]
    .map((image) => `${image.source} ${image.width}w`)
    .join(", ");
}
