# Del Rio Capital Website

A responsive, dependency-free website for Del Rio Capital. Shared templates generate complete HTML pages, so the site works on a static host and its content remains accessible without JavaScript.

## Local development

Use Node.js 24, then run:

```sh
npm run dev
```

The server builds the site and prints its local URL, normally `http://127.0.0.1:4173`. `npm start` runs the same command. Set `PORT` or `HOST` to change the server address.

After editing content or templates, run `npm run build` and refresh the browser. CSS edits appear on refresh. The development server disables caching.

## Editing and extending

- `data/site-content.mjs` owns company details, contact links, partners, and property content. Add a property to the `properties` array with a unique lowercase, hyphen-separated `slug`; the build creates its portfolio detail page and sitemap entry automatically.
- `scripts/templates/layout.mjs` owns shared navigation, footer, and page metadata.
- `scripts/templates/home.mjs` and `scripts/templates/pages.mjs` define the page layouts.
- `assets/styles.css` owns the visual system and responsive styles. Navigation and contact use native links and work without browser JavaScript.
- `assets/` contains the supplied logo, portraits, property photographs, and local fonts.

Photographs include compressed originals and smaller WebP exports named
`name-320.webp`, `name-640.webp`, `name-960.webp`, and `name-1280.webp` where those
widths are smaller than the original. Templates automatically include available
exports in responsive image sources; a new image still works with its original
alone. Keep each image's width and height in `data/site-content.mjs` consistent
with the original. Export variants from the best available source and review
their quality before replacing them. The website build needs no image-processing
dependency. When replacing an original, replace or remove its matching variants
so all widths show the same photograph. The first Portfolio photo loads eagerly;
homepage cards stay lazy.

Contact is through direct email, telephone, and LinkedIn links. There is no contact form or backend email service.

## Build and verify

```sh
npm run build
npm run check
```

The build writes the home, about, portfolio, property detail, and contact pages into their public directories, plus `sitemap.xml` and `robots.txt`. The check rebuilds them and verifies local links, referenced assets (including responsive image candidates), in-page anchors, page-specific canonical and Open Graph URLs, sitemap coverage, crawl directives, removed placeholders and forms, and JavaScript syntax.

Generated HTML is kept alongside its source to support simple static deployment. Edit the source content or templates instead of generated HTML.

The tracked `.generated-pages.json` manifest records the files owned by the build. Removing a property or changing its slug removes its old generated HTML on the next build. Cleanup preserves other files in those directories and leaves files not recorded in the manifest untouched. Keep the manifest with the source when moving the project.

## Static deployment

### Automatic deployment from GitHub

The source repository is [slalexander92/del-rio-capital-website](https://github.com/slalexander92/del-rio-capital-website). The production website is [delriocapital.com](https://delriocapital.com/), hosted by the existing Cloudflare Pages project named `del-rio-capital-preview`. Its [pages.dev address](https://del-rio-capital-preview.pages.dev/) remains available for inspection.

[`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml) validates pull requests targeting `main`. Every update to `main`, including a merged pull request, runs those checks and deploys to Cloudflare's production environment. Failed checks stop deployment. Pull requests run checks without Cloudflare credentials. Production deployments are serialized. You can also run the workflow manually from [GitHub Actions](https://github.com/slalexander92/del-rio-capital-website/actions); only runs on `main` can deploy.

The workflow uses Node.js 24 and Wrangler 4.144.0. It deploys the clean `dist/` output produced by `npm run preview:build`, including the public pages, assets, and a 404 page. The historical `preview:build`, `preview:deploy`, and project names now serve the production website as well. Source files and the original ZIP are excluded.

Canonical URLs, social metadata, and the sitemap use `https://delriocapital.com`. The deployed `robots.txt` allows crawling and points to that domain's sitemap. Host-scoped rules in the generated `_headers` file apply `X-Robots-Tag: noindex, nofollow` only to the project's `pages.dev` address and its deployment or branch subdomains. Crawlers can fetch those pages to see the header; the custom domain remains indexable. The `www` redirect is configured separately in Cloudflare because Pages `_redirects` files do not support domain-level redirects.

#### One-time credentials

Create a custom [Cloudflare API token](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/#generate-an-api-token) with **Account → Cloudflare Pages → Edit** permission. Limit its account resources to the account containing `del-rio-capital-preview`. Add these [repository Actions secrets](https://github.com/slalexander92/del-rio-capital-website/settings/secrets/actions):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | `ad1035dd2914b1ea14c6f98424619acf` |
| `CLOUDFLARE_API_TOKEN` | The custom Cloudflare token |

The workflow uses GitHub's automatically supplied `GITHUB_TOKEN` to record deployment status. Keep the Cloudflare project's production branch set to `main`. This existing Direct Upload project uses GitHub Actions because Cloudflare [does not allow converting it to native Git integration](https://developers.cloudflare.com/pages/get-started/direct-upload/).

#### Deploy from your computer

With Wrangler signed in to the intended Cloudflare account, run `npm run preview:deploy` to verify, package, and upload the latest site to the same project. Wrangler prints the public deployment URL.

### Other static hosting

Upload `index.html`, `about/`, `portfolio/`, `contact/`, `assets/`, `robots.txt`, and `sitemap.xml` to a static hosting provider. The Node development server is not needed in production. Keep source files and the original ZIP archive out of the public deployment.

The production domain is `https://delriocapital.com`. Update `domain` in `data/site-content.mjs` if it changes; a rebuild updates canonical URLs, social metadata, and the sitemap. Configure any hostname redirects and preview indexing restrictions with the new hosting provider.
