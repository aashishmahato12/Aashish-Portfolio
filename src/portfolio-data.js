// Add verified work here. Each project can have a cover and any number of video or photo items.
// Example: { id: 'project-slug', title: 'Project title', category: 'Film', year: '2026',
//   company: 'Client name', description: 'Short description', cover: '/projects/cover.jpg',
//   media: [{ type: 'video', src: 'https://...', poster: '/projects/poster.jpg' }] }
export const featuredProjects = [];

// Add real collaborators as { name: 'Company', logo: '/logos/company.svg', href: 'https://...' }.
// The website labels its temporary company marks as placeholders until this list is filled.
export const collaborators = [];

export const heroReel = {
  id: 'showreel',
  type: 'video',
  title: 'Current showreel',
  category: 'Motion',
  src: 'https://res.cloudinary.com/ghmgpvvn/video/upload/q_auto:best/f_auto/v1790583244/reel_3.mp4',
  poster: '/videos/hero-poster.jpg',
};

export const galleryMedia = [
  heroReel,
  {
    id: 'showreel-poster',
    type: 'photo',
    title: 'Showreel poster',
    category: 'Still',
    src: '/videos/hero-poster.jpg',
  },
];

export const previewCompanies = Array.from({ length: 10 }, (_, index) => ({
  name: `COMPANY ${String(index + 1).padStart(2, '0')}`,
  placeholder: true,
}));
