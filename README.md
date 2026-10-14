# Aashish Mahato portfolio

React portfolio built with Vite.

## Run it

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production build, run `npm run build`.

## Search structure

Main navigation links to `/work/`, `/gallery/`, `/about/`, and `/contact/`. The Work page links to seven discipline pages; Contact prepares email enquiries for Gmail, Outlook, and other email apps, with direct email and social links.

`src/seo-data.js` is the source for page titles, descriptions, canonical URLs, social previews, and WebSite/Person structured data. Vite injects this metadata into every HTML entry and the app updates it on navigation. `scripts/render-page-fallbacks.mjs` supplies readable content and ordinary links in the built HTML before JavaScript runs.

The build generates `public/sitemap.xml`, copies `public/robots.txt`, and checks all public pages with `scripts/check-seo.mjs`. Run `npm run check:seo` to check an existing build. Deploy the complete `dist/` directory, including page folders, sitemap, and robots file; verify that each page returns HTTP 200 and the host does not add a `noindex` header. Submit `https://aashish-mahato.com.np/sitemap.xml` in Search Console after deployment. Google chooses whether and when to display sitelinks.

## Media

The homepage hero uses the original full-quality Cloudinary video on desktop and phone, with `public/videos/hero-poster.webp` while it loads. The same original showreel is available on its watch page. The horizontal homepage gallery mixes that reel with films and photographs.

The supplied source assets are in `Aashish - Pro/`. Web-sized copies are organized in `public/media/`:

- `photos/` — photography
- `posters/` — preview frames for films streamed from Cloudinary
- `branding/` — Cosmic Electrical office branding, CIC Nepal, Decora, and Savari mockups
- `design/` — Cosmic Group campaign graphics
- `logos/` — company marks as compact transparent WebP files
- `web/` — desktop and phone website screenshots
- `social/` — optimized page preview images

Original source media stays outside the deployment. Full-length films stream from Cloudinary; unused local video duplicates are removed. Portraits use lossless WebP with identical decoded pixels.

The refreshed company logo originals are saved with descriptive names in `Aashish - Pro/Photo/company logos/updated/`. Their matching web copies are in `public/media/logos/`.

## Personalize it

The homepage previews the Gallery, About, and Work pages. Page content and transitions are in `src/Experience.jsx`; the video hero is in `src/App.jsx`. Project titles, descriptions, image/video paths, and company marks live in `src/portfolio-data.js`. Add or correct client details there as they become available. The Work page displays each project's media, and the Gallery page brings all supplied visuals into one filterable view.

## Agent-readable responses

Deploy this repository through Vercel’s Vite integration (build: `npm run build`, output: `dist`). The root `middleware.js` must be deployed with the project; uploading `dist` alone to a static host does not enable content negotiation. No API key is required for the middleware.

- Public page URLs negotiate HTML or Markdown using `Accept`, with `Vary: Accept`. Markdown responses use `Cache-Control: no-store` to prevent a CDN from mixing variants.
- Unsupported representations return 406; nonexistent public pages return 404 with HTML or Markdown recovery links. Media, compiled assets, and Vercel analytics routes bypass middleware.
- Each page has an explicit `/index.md` variant. `/llms.txt` follows the published H1, summary, and H2 file-list format; `/agent-instructions.md` describes best-fit jobs, official contact routes, and limits.
- `/privacy/` is linked in the footer. Its text reflects the Google Analytics/Tag Manager, Vercel Analytics/Speed Insights, Cloudinary, Google Fonts, and external messaging already present in the code. Review the Google Tag Manager dashboard and provider retention settings before making additional privacy promises or deciding on a consent policy.

Run `npm run build` then `npm run test:agents` for HTTP integration and content checks. After deployment, run `npm run verify:agents` (or append a deployment URL) to check every public HTML/Markdown page, explicit Markdown file, 404 response, sitemap, robots file, and instruction file. Request a fresh Is Agentic audit after deployment; a stored report can remain stale for six hours.

Protocols: [Markdown negotiation](https://acceptmarkdown.com/guides/accept-parsing), [llms.txt](https://llmstxt.org/), [Vercel Routing Middleware](https://vercel.com/docs/routing-middleware/api).

## Video search

Each film and motion video has a dedicated `/watch/` page with a visible player in its initial HTML, a stable thumbnail, unique page metadata, and an entry in the video sitemap extension of `/sitemap.xml`. Existing project titles link to their watch pages. Original publication dates have not been confirmed, so they are not invented for structured data. Google decides whether to index a video and show it in video results.

## Loading and accessibility

Fonts are hosted locally as WOFF2. Google tracking initializes on interaction or idle after initial rendering. The footer shader loads near the viewport. Hero text is visible immediately; its entrance moves without hiding it. Decorative silent previews are hidden from assistive technology; watch-page players remain accessible. Image variants provide smaller fallback thumbnails and avatars.

The homepage is prerendered from its actual React components and hydrated on load. Below-the-fold motion setup waits until sections approach the viewport. Responsive image variants preserve original files and reduce phone downloads.
