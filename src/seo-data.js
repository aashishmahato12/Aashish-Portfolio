import { creativeServices } from './services-data.js';
export const siteUrl = 'https://aashish-mahato.com.np';
export const creativeBio = 'Aashish Mahato is a filmmaker, photographer, designer, and web developer based in Kathmandu, Nepal. His portfolio brings together travel films, photography, motion graphics, branding, graphic design, and websites.';
export const officialProfiles = [
  { label: 'Instagram', url: 'https://www.instagram.com/aashishmahato12/' },
  { label: 'GitHub', url: 'https://github.com/aashishmahato12' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aashish-mahato-nepal' },
  { label: 'Facebook', url: 'https://www.facebook.com/aashish.mahato.363525' },
  { label: 'YouTube', url: 'https://www.youtube.com/@AashishMahato12' },
];

export const searchMeta = {
  home: ['Aashish Mahato | Film, Photography & Design in Kathmandu', 'Explore filmmaking, photography, motion graphics, branding, graphic design, and web development by Aashish Mahato, based in Kathmandu, Nepal.', '/'],
  work: ['Work | Film, Photography, Design & Websites by Aashish Mahato', 'Explore Aashish Mahato’s selected projects in filmmaking, photography, motion graphics, branding, graphic design, digital design, and web development.', '/work/'],
  contact: ['Contact Aashish Mahato | Creative Projects in Kathmandu', 'Contact Aashish Mahato in Kathmandu, Nepal to discuss film, photography, branding, design, and website projects through his official profiles.', '/contact/'],
  about: ['About Aashish Mahato | Creative in Kathmandu, Nepal', 'Meet Aashish Mahato, a Kathmandu-based filmmaker, photographer, designer, and web developer in Nepal. Explore his work and official profiles.', '/about/'],
  gallery: ['Gallery | Films, Photography & Design by Aashish Mahato', 'Browse Aashish Mahato’s visual archive of films, photography, branding, and graphic design projects.', '/gallery/'],
  'skill-film': ['Filmmaker & Videographer in Kathmandu | Aashish Mahato', 'Explore travel films, videography, editing, and visual storytelling by Aashish Mahato, a filmmaker based in Kathmandu, Nepal.', '/work/film/'],
  'skill-photography': ['Photographer in Kathmandu, Nepal | Aashish Mahato', 'Explore portrait, street, nature, and landscape photography by Aashish Mahato, a photographer based in Kathmandu, Nepal.', '/work/photography/'],
  'skill-motion': ['Motion Graphics Designer in Kathmandu | Aashish Mahato', 'Explore animated visuals and product presentations by Aashish Mahato, a motion graphics designer based in Kathmandu, Nepal.', '/work/motion/'],
  'skill-branding': ['Brand Identity Designer in Kathmandu | Aashish Mahato', 'Explore visual identity, business card, and brand presentation projects by Aashish Mahato, a designer based in Kathmandu, Nepal.', '/work/branding/'],
  'skill-graphic': ['Graphic Designer in Kathmandu, Nepal | Aashish Mahato', 'Explore campaign artwork, social graphics, and visual communication by Aashish Mahato, a graphic designer based in Kathmandu, Nepal.', '/work/graphic/'],
  'skill-digital': ['Interface Designer in Kathmandu | Aashish Mahato', 'Explore website, dashboard, and mobile interface concepts by Aashish Mahato, a designer based in Kathmandu, Nepal.', '/work/digital/'],
  'skill-web': ['Web Developer in Kathmandu, Nepal | Aashish Mahato', 'Explore responsive websites and React interfaces by Aashish Mahato, a web developer based in Kathmandu, Nepal.', '/work/web/'],
};
export const searchImages = {
  home: '/media/social/aashish-mahato-preview.jpg',
  work: '/media/social/aashish-mahato-preview.jpg',
  contact: '/media/social/aashish-mahato-preview.jpg',
  about: '/media/social/aashish-mahato-preview.jpg',
  gallery: '/media/social/aashish-mahato-preview.jpg',
  'skill-film': '/media/posters/mustang.jpg',
  'skill-photography': '/media/photos/tree-final-27.webp',
  'skill-motion': '/media/posters/product-motion.jpg',
  'skill-branding': '/media/branding/document.webp',
  'skill-graphic': '/media/design/162.webp',
  'skill-digital': '/media/branding/mockup5.webp',
  'skill-web': '/media/logos/cosmic-electrical.webp',
};


export function structuredData(route) {
  const [name, description, path] = searchMeta[route];
  const personId = `${siteUrl}/about/#aashish`;
  const websiteId = `${siteUrl}/#website`;
  const person = {
    '@type': 'Person', '@id': personId, name: 'Aashish Mahato',
    url: `${siteUrl}/about/`, image: `${siteUrl}/media/photos/tree-final-18.webp`,
    description: creativeBio,
    jobTitle: ['Filmmaker', 'Photographer', 'Designer', 'Web Developer'],
    knowsAbout: creativeServices.map((service) => service.name),
    homeLocation: { '@type': 'City', name: 'Kathmandu', containedInPlace: { '@type': 'Country', name: 'Nepal' } },
    sameAs: officialProfiles.map((profile) => profile.url),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
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
        name, description, primaryImageOfPage: `${siteUrl}${searchImages[route]}`, inLanguage: 'en', isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        ...(route === 'about' || route === 'contact' ? { mainEntity: { '@id': personId } } : {}),
        ...(route !== 'home' ? { breadcrumb: { '@id': `${siteUrl}${path}#breadcrumb` } } : {}),
      },
    ],
  };
}
