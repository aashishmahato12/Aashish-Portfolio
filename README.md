# Aashish Mahato portfolio

React portfolio built with Vite.

## Run it

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production build, run `npm run build`.

## Media

The homepage plays the Cloudinary reel in `src/portfolio-data.js`. `public/videos/hero-poster.jpg` appears while it loads. The reel is also available with controls on the Work and Gallery pages.

## Personalize it

The homepage previews the Gallery, About, and Work pages. Page content and transitions are in `src/Experience.jsx`; the existing video hero is in `src/App.jsx`. Add real projects, media, and collaborators in `src/portfolio-data.js`. The current reel and its poster are the only live gallery pieces, and any missing media is labeled as a placeholder. Add a `cover` and optional `media` array to each featured project to display it on the homepage, Work page, and Gallery page.
