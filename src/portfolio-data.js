// Web-sized copies of the supplied source work in Aashish - Pro/.
// Originals remain untouched. Add verified client/project details as they arrive.
const video = '/media/videos';
const poster = '/media/posters';
const photo = '/media/photos';
const brand = '/media/branding';
const design = '/media/design';
const logo = '/media/logos';

export const heroReel = {
  id: 'showreel',
  type: 'video',
  title: 'Current showreel',
  category: 'Film',
  src: 'https://res.cloudinary.com/ghmgpvvn/video/upload/q_auto:best/f_auto/v1790583244/reel_3.mp4',
  poster: '/videos/hero-poster.jpg',
};

export const featuredProjects = [
  {
    id: 'mustang-film', title: 'Mustang', category: 'Travel Film',
    description: 'A travel film through the landscapes of Mustang, Nepal.',
    cover: `${poster}/mustang.jpg`,
    media: [{ id: 'mustang-video', type: 'video', title: 'Mustang travel film', category: 'Film', src: `${video}/mustang.mp4`, poster: `${poster}/mustang.jpg` }],
  },
  {
    id: 'manang-film', title: 'Manang', category: 'Travel Film',
    description: 'Moving images of Manang and its Himalayan landscape.',
    cover: `${poster}/manang.jpg`,
    media: [{ id: 'manang-video', type: 'video', title: 'Manang travel film', category: 'Film', src: `${video}/manang.mp4`, poster: `${poster}/manang.jpg` }],
  },
  {
    id: 'product-motion', title: 'Product Motion', category: 'Motion Graphics',
    description: 'An animated presentation of a digital licence experience.',
    cover: `${poster}/product-motion.jpg`,
    media: [{ id: 'product-motion-video', type: 'video', title: 'Product motion film', category: 'Motion Graphics', src: `${video}/product-motion.mp4`, poster: `${poster}/product-motion.jpg` }],
  },
  {
    id: 'cic-nepal', title: 'CIC Nepal', category: 'Brand & Digital', company: 'Cosmic Innovation Center',
    description: 'Brand and website mockups for Cosmic Innovation Center.',
    cover: `${brand}/document.webp`,
    media: [
      { type: 'photo', title: 'CIC brand presentation', category: 'Branding', src: `${brand}/document.webp` },
      { type: 'photo', title: 'CIC service booklet', category: 'Branding', src: `${brand}/document2.webp` },
      { type: 'photo', title: 'CIC website mockup', category: 'Digital', src: `${brand}/macbook-mockup-3.webp` },
      { type: 'photo', title: 'CIC dashboard mockup', category: 'Digital', src: `${brand}/macbook-mockup-10.webp` },
    ],
  },
  {
    id: 'decora', title: 'Decora', category: 'Brand & Digital', company: 'Decora',
    description: 'Visual identity and digital product mockups for Decora.',
    cover: `${brand}/mockup5.webp`,
    media: [
      { type: 'photo', title: 'Decora mobile experience', category: 'Digital', src: `${brand}/mockup5.webp` },
      { type: 'photo', title: 'Decora identity card', category: 'Branding', src: `${brand}/mockup23.webp` },
      { type: 'photo', title: 'Decora card detail', category: 'Branding', src: `${brand}/mockup4-medium.webp` },
      { type: 'photo', title: 'Decora product screen', category: 'Digital', src: `${brand}/document0.webp` },
    ],
  },
  {
    id: 'cosmic-design', title: 'Cosmic Group', category: 'Graphic Design', company: 'Cosmic Group',
    description: 'A collection of campaign and social graphics for Cosmic Group.',
    cover: `${design}/162.webp`,
    media: [
      ['162', 'Anniversary graphic'], ['158', 'Cricket congratulations'],
      ['17', 'Motivational graphic'], ['tihar', 'Tihar greeting'],
      ['25', 'New year graphic'], ['79', 'Hiring graphic'],
      ['92', 'Tihar campaign'], ['146', 'CIC opening graphic'],
    ].map(([file, title]) => ({ type: 'photo', title, category: 'Graphic Design', src: `${design}/${file}.webp` })),
  },
];

export const galleryMedia = [
  heroReel,
  { id: 'prayer-flags', type: 'photo', title: 'Prayer flags', category: 'Photography', src: `${photo}/tree-final-27.webp` },
  featuredProjects[0].media[0],
  { id: 'evening-sky', type: 'photo', title: 'Evening sky', category: 'Photography', src: `${photo}/sun-set-21.webp` },
  featuredProjects[1].media[0],
  { id: 'boudhanath', type: 'photo', title: 'Boudhanath', category: 'Photography', src: `${photo}/tree-final-26.webp` },
  featuredProjects[2].media[0],
  { id: 'under-the-canopy', type: 'photo', title: 'Under the canopy', category: 'Photography', src: `${photo}/6934.webp` },
  { id: 'street-portrait', type: 'photo', title: 'Street portrait', category: 'Photography', src: `${photo}/sun-set-3.webp` },
  { id: 'floral-study', type: 'photo', title: 'Floral study', category: 'Photography', src: `${photo}/tree-final-16.webp` },
  { id: 'portrait-study', type: 'photo', title: 'Portrait study', category: 'Photography', src: `${photo}/tree-final-18.webp` },
  { id: 'friends-outdoors', type: 'photo', title: 'Friends outdoors', category: 'Photography', src: `${photo}/tree-final-117.webp` },
  { id: 'birds-above-the-city', type: 'photo', title: 'Birds above the city', category: 'Photography', src: `${photo}/tree-final-28.webp` },
  { id: 'small-bird', type: 'photo', title: 'Small bird', category: 'Photography', src: `${photo}/tree-final-5.webp` },
];

export const collaborators = [
  { name: 'Fintasy', logo: `${logo}/fintasy.webp`, color: '#e87060', ink: '#161915' },
  { name: 'Cosmic Innovation Center', logo: `${logo}/cic.webp`, color: '#0868b8' },
  { name: 'Decora', logo: `${logo}/decora.webp`, color: '#167a2b' },
  { name: 'Kyros', logo: `${logo}/kyros.webp`, color: '#171717' },
  { name: "Herman's Bakes", logo: `${logo}/hermans-bakes.webp`, color: '#8b2226' },
  { name: 'Cosmic Capital', logo: `${logo}/cosmic-capital.webp`, color: '#1b5b9a' },
  { name: 'Savari', logo: `${logo}/savari.webp`, color: '#1348dd' },
  { name: 'OGKICKS', logo: `${logo}/ogkicks.webp`, color: '#171717' },
  { name: 'Cosmic Group', logo: `${logo}/cosmic-group.webp`, color: '#cf1b2a' },
  { name: 'Cosmic Electrical', logo: `${logo}/cosmic-electrical.webp`, color: '#cf1b2a' },
  { name: 'Cosmic Foundation', logo: `${logo}/cosmic-foundation.webp`, color: '#075120' },
  { name: 'Cosmic Infra', logo: `${logo}/cosmic-infra.webp`, color: '#cf1b2a' },
];
