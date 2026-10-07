# Aashish Mahato portfolio

React portfolio built with Vite.

## Run it

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production build, run `npm run build`.

## Search structure

Main navigation links to `/work/`, `/gallery/`, `/about/`, and `/contact/`. The Work page links to seven discipline pages; Contact uses the confirmed Instagram and LinkedIn profiles.

`src/seo-data.js` is the source for page titles, descriptions, canonical URLs, social previews, and WebSite/Person structured data. Vite injects this metadata into every HTML entry and the app updates it on navigation. `scripts/render-page-fallbacks.mjs` supplies readable content and ordinary links in the built HTML before JavaScript runs.

The build generates `public/sitemap.xml`, copies `public/robots.txt`, and checks all 12 pages with `scripts/check-seo.mjs`. Run `npm run check:seo` to check an existing build. Deploy the complete `dist/` directory, including page folders, sitemap, and robots file; verify that each page returns HTTP 200 and the host does not add a `noindex` header. Submit `https://aashish-mahato.com.np/sitemap.xml` in Search Console after deployment. Google chooses whether and when to display sitelinks.

## Media

The homepage hero keeps the Cloudinary reel configured in `src/portfolio-data.js`; `public/videos/hero-poster.jpg` appears while it loads. The horizontal homepage gallery mixes that reel with films and photographs.

The supplied source assets are in `Aashish - Pro/`. Web-sized copies are organized in `public/media/`:

- `photos/` — photography
- `videos/` and `posters/` — full travel and motion films, plus preview frames
- `branding/` — CIC Nepal and Decora mockups
- `design/` — Cosmic Group campaign graphics
- `logos/` — 12 company marks as compact transparent WebP files

The original media is untouched. The three supplied full-length films are converted to 720p H.264 MP4 for playback; they are still roughly 24–42 MB each. The `Video/Cosmic Promo/` source folder is empty, so no film from that folder is shown.

The refreshed company logo originals are saved with descriptive names in `Aashish - Pro/Photo/company logos/updated/`. Their matching web copies are in `public/media/logos/`.

## Personalize it

The homepage previews the Gallery, About, and Work pages. Page content and transitions are in `src/Experience.jsx`; the video hero is in `src/App.jsx`. Project titles, descriptions, image/video paths, and company marks live in `src/portfolio-data.js`. Add or correct client details there as they become available. The Work page displays each project's media, and the Gallery page brings all supplied visuals into one filterable view.
