import { creativeServices } from './services-data.js';
import { featuredProjects, filmProjects, galleryMedia, webProjects } from './portfolio-data.js';
import { contactEmail } from './contact-enquiry.js';
export const siteUrl = 'https://aashish-mahato.com.np';
export const creativeBio = 'Aashish Mahato is the Creative Head at Cosmic Group and a filmmaker, photographer, designer, and web developer based in Kathmandu, Nepal. His portfolio includes travel films, photography, motion graphics, branding, graphic design, and websites.';
export const officialProfiles = [
  { label: 'Instagram', url: 'https://www.instagram.com/aashishmahato12/' },
  { label: 'GitHub', url: 'https://github.com/aashishmahato12' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aashish-mahato-nepal' },
  { label: 'Facebook', url: 'https://www.facebook.com/aashish.mahato.363525' },
  { label: 'YouTube', url: 'https://www.youtube.com/@AashishMahato12' },
];

export const searchMeta = {
  privacy: ['Privacy | Aashish Mahato', 'How Aashish Mahato’s portfolio uses analytics, hosting services, external media, and project enquiry information.', '/privacy/'],
  home: ['Aashish Mahato | Film, Photography & Design in Kathmandu', 'Explore filmmaking, photography, motion graphics, branding, graphic design, and web development by Aashish Mahato, based in Kathmandu, Nepal.', '/'],
  work: ['Selected Work | Film, Design & Web by Aashish Mahato', 'Explore Aashish Mahato’s selected projects in filmmaking, photography, motion graphics, branding, graphic design, UI/UX design, and web development.', '/work/'],
  contact: ['Contact Aashish Mahato | Creative Projects in Kathmandu', 'Start a film, photography, design, or website project with Aashish Mahato in Kathmandu. Prepare an email enquiry or contact him directly.', '/contact/'],
  about: ['About Aashish Mahato | Creative Head at Cosmic Group', 'Meet Aashish Mahato, Creative Head at Cosmic Group and a filmmaker, photographer, designer, and web developer based in Kathmandu, Nepal.', '/about/'],
  gallery: ['Photo, Film & Design Gallery | Aashish Mahato', 'Browse Aashish Mahato’s visual archive of films, photography, branding, and graphic design projects.', '/gallery/'],
  'skill-film': ['Filmmaker & Videographer in Kathmandu | Aashish Mahato', 'Explore travel films, videography, editing, and visual storytelling by Aashish Mahato, a filmmaker based in Kathmandu, Nepal.', '/work/film/'],
  'skill-photography': ['Photographer in Kathmandu, Nepal | Aashish Mahato', 'Explore portrait, street, nature, and landscape photography by Aashish Mahato, a photographer based in Kathmandu, Nepal.', '/work/photography/'],
  'skill-motion': ['Motion Graphics Designer in Kathmandu | Aashish Mahato', 'Watch Savari’s product animation and explore motion graphics by Aashish Mahato in Kathmandu, Nepal. Discuss animation and product video projects.', '/work/motion/'],
  'skill-branding': ['Brand Identity Designer in Kathmandu | Aashish Mahato', 'Explore workplace signage, business cards, and brand presentations for Cosmic Electrical, CIC Nepal, and Decora by Aashish Mahato in Kathmandu.', '/work/branding/'],
  'skill-graphic': ['Graphic Designer in Kathmandu, Nepal | Aashish Mahato', 'Explore campaign artwork, social graphics, and visual communication by Aashish Mahato, a graphic designer based in Kathmandu, Nepal.', '/work/graphic/'],
  'skill-digital': ['UI/UX Designer in Kathmandu | Aashish Mahato', 'Explore Savari dashboard and digital driving licence concepts, plus mobile interface mockups by Aashish Mahato, a UI/UX designer in Kathmandu.', '/work/digital/'],
  'skill-web': ['Web Developer in Kathmandu, Nepal | Aashish Mahato', 'Explore Cosmic Electrical, UniSync, and portfolio websites by Aashish Mahato in Kathmandu. View responsive React projects and discuss your website.', '/work/web/'],
};
export const searchImages = {
  privacy: '/media/social/aashish-mahato-preview.jpg',
  home: '/media/photos/tree-final-18.webp',
  work: '/media/social/aashish-mahato-preview.jpg',
  contact: '/media/social/aashish-mahato-preview.jpg',
  about: '/media/photos/tree-final-18.webp',
  gallery: '/media/social/aashish-mahato-preview.jpg',
  'skill-film': '/media/posters/mustang.jpg',
  'skill-photography': '/media/photos/tree-final-27.webp',
  'skill-motion': '/media/posters/product-motion.jpg',
  'skill-branding': '/media/branding/cosmic-values-wall.webp',
  'skill-graphic': '/media/design/162.webp',
  'skill-digital': '/media/branding/macbook-mockup-3.webp',
  'skill-web': '/media/web/cosmic-homepage.webp',
};

export function searchProjects(route) {
  const skill = route.replace('skill-', '');
  if (skill === 'film') return filmProjects;
  if (skill === 'web') return webProjects;
  if (skill === 'photography') return galleryMedia.filter(item => item.category === 'Photography');
  if (['branding', 'digital'].includes(skill)) {
    const category = skill === 'branding' ? 'Branding' : 'Digital';
    return featuredProjects.map(project => ({ ...project, media: project.media.filter(item => item.category === category) }))
      .filter(project => project.media.length)
      .map(project => ({ ...project, cover: project.media[0].src }));
  }
  return featuredProjects.filter(project => project.category === (skill === 'motion' ? 'Motion Graphics' : 'Graphic Design'));
}

export function structuredData(route) {
  const [name, description, path] = searchMeta[route];
  const personId = `${siteUrl}/about/#aashish`;
  const websiteId = `${siteUrl}/#website`;
  const person = {
    '@type': 'Person', '@id': personId, name: 'Aashish Mahato',
    url: `${siteUrl}/about/`, image: `${siteUrl}/media/photos/tree-final-18.webp`,
    description: creativeBio,
    worksFor: { '@type': 'Organization', name: 'Cosmic Group' },
    jobTitle: ['Creative Head', 'Filmmaker', 'Photographer', 'Designer', 'Web Developer'],
    knowsAbout: creativeServices.map((service) => service.name),
    homeLocation: { '@type': 'City', name: 'Kathmandu', containedInPlace: { '@type': 'Country', name: 'Nepal' } },
    sameAs: officialProfiles.map((profile) => profile.url),
    email: contactEmail,
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      { '@type': 'ImageObject', '@id': `${siteUrl}${path}#primaryimage`, url: `${siteUrl}${searchImages[route]}`, contentUrl: `${siteUrl}${searchImages[route]}`, caption: name },
      ...(route.startsWith('skill-') ? [{ '@type': 'ItemList', '@id': `${siteUrl}${path}#projects`, name: `Selected ${creativeServices.find(service => route === `skill-${service.id}`).name} projects`, itemListElement: searchProjects(route).map((project, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'CreativeWork', name: project.title, description: project.description || project.category, url: `${siteUrl}${path}#${project.id}`, image: new URL(project.cover || project.src, siteUrl).href, creator: { '@id': personId }, ...(project.liveUrl ? { sameAs: project.liveUrl } : {}) } })) }] : []),
      ...(route !== 'home' ? [{ '@type': 'BreadcrumbList', '@id': `${siteUrl}${path}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        ...(route.startsWith('skill-') ? [{ '@type': 'ListItem', position: 2, name: 'Work', item: `${siteUrl}/work/` }] : []),
        { '@type': 'ListItem', position: route.startsWith('skill-') ? 3 : 2, name: route.startsWith('skill-') ? creativeServices.find(service => route === `skill-${service.id}`).name : route[0].toUpperCase() + route.slice(1), item: `${siteUrl}${path}` },
      ] }] : []),
      ...(route.startsWith('skill-') ? [{
        '@type': 'Service', '@id': `${siteUrl}${path}#service`,
        name: creativeServices.find((service) => route === `skill-${service.id}`).name,
        description: creativeServices.find((service) => route === `skill-${service.id}`).description,
        url: `${siteUrl}${path}`, provider: { '@id': personId },
        areaServed: { '@type': 'Country', name: 'Nepal' },
      }] : []),
      { '@type': 'WebSite', '@id': websiteId, name: 'Aashish Mahato',
        url: `${siteUrl}/`, description: creativeBio, inLanguage: 'en',
        publisher: { '@id': personId } },
      { '@type': route === 'about' ? 'ProfilePage' : route === 'contact' ? 'ContactPage' : ['work', 'gallery'].includes(route) ? 'CollectionPage' : 'WebPage',
        '@id': `${siteUrl}${path}#webpage`, url: `${siteUrl}${path}`,
        name, description, primaryImageOfPage: { '@id': `${siteUrl}${path}#primaryimage` }, inLanguage: 'en', isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        ...(['home', 'about', 'contact'].includes(route) ? { mainEntity: { '@id': personId } } : {}),
        ...(route.startsWith('skill-') ? { mainEntity: { '@id': `${siteUrl}${path}#projects` } } : {}),
        ...(route !== 'home' ? { breadcrumb: { '@id': `${siteUrl}${path}#breadcrumb` } } : {}),
      },
    ],
  };
}
