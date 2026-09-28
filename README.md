# Aashish Mahato portfolio

React portfolio built with Vite.

## Run it

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production build, run `npm run build`.

## Hero video

The home page and Projects page play the Cloudinary reel in `src/portfolio-data.js`. `public/videos/hero-poster.jpg` appears while it loads. The hero video autoplays muted and loops; the gallery player has controls.

## Personalize it

Edit the headline, introduction, services, and six concept cards in `src/App.jsx`. Add real featured projects, gallery media, and collaborators in `src/portfolio-data.js`. Project cards can have a `cover` and a `media` array of video or photo items. Collaborators can have a `logo` path and optional website `href`. The Projects page is at `/projects/`; empty project and company lists show clearly labeled placeholders. Both pages share one React app, with animated transitions handled by `src/SiteRouter.jsx`. Styles are in `src/style.css`, `src/redesign.css`, `src/projects.css`, and `src/projects-theme.css`.
