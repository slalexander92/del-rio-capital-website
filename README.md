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

Contact is through direct email, telephone, and LinkedIn links. There is no contact form or backend email service.

## Build and verify

```sh
npm run build
npm run check
```

The build writes the home, about, portfolio, property detail, and contact pages into their public directories, plus `sitemap.xml` and `robots.txt`. The check rebuilds them and verifies local links, referenced assets, in-page anchors, basic metadata, removed placeholders and forms, and JavaScript syntax.

Generated HTML is kept alongside its source to support simple static deployment. Edit the source content or templates instead of generated HTML.

The tracked `.generated-pages.json` manifest records the files owned by the build. Removing a property or changing its slug removes its old generated HTML on the next build. Cleanup preserves other files in those directories and leaves files not recorded in the manifest untouched. Keep the manifest with the source when moving the project.

## Static deployment

### Automatic deployment from GitHub

The source repository is [slalexander92/del-rio-capital-website](https://github.com/slalexander92/del-rio-capital-website). The website is hosted by the existing Cloudflare Pages project at [del-rio-capital-preview.pages.dev](https://del-rio-capital-preview.pages.dev/).

[`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml) validates pull requests targeting `main`. Every update to `main`, including a merged pull request, runs those checks and deploys to Cloudflare's production environment. Failed checks stop deployment. Pull requests run checks without Cloudflare credentials. Production deployments are serialized. You can also run the workflow manually from [GitHub Actions](https://github.com/slalexander92/del-rio-capital-website/actions); only runs on `main` can deploy.

The workflow uses Node.js 24 and Wrangler 4.144.0. It deploys the clean `dist/` output produced by `npm run preview:build`, including the public pages, assets, and a 404 page. Source files and the original ZIP are excluded. The current `pages.dev` target remains excluded from search engines through `robots.txt` and `X-Robots-Tag` headers. This site's canonical URLs still refer to `https://www.delriocapital.com`; publishing that domain as an indexable site is a separate hosting change.

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

The production domain is currently assumed to be `https://www.delriocapital.com`. Verify that host before publishing and update `domain` in `data/site-content.mjs` if necessary; a rebuild updates canonical URLs, social metadata, and the sitemap.
