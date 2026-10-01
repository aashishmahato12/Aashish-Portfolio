export const siteUrl = 'https://aashish-mahato.com.np';
export const creativeBio = 'Aashish Mahato is a filmmaker, photographer, designer, and web developer based in Nepal. His portfolio brings together travel films, photography, motion graphics, branding, graphic design, and websites.';
export const officialProfiles = [
  { label: 'Instagram', url: 'https://www.instagram.com/aashishmahato12/' },
  { label: 'GitHub', url: 'https://github.com/aashishmahato12' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aashish-mahato-nepal' },
  { label: 'Facebook', url: 'https://www.facebook.com/aashish.mahato.363525' },
  { label: 'YouTube', url: 'https://www.youtube.com/@AashishMahato12' },
];

export const searchMeta = {
  home: ['Aashish Mahato — Film, Photography & Design', 'Explore the films, photography, motion graphics, branding, graphic design, and websites of Aashish Mahato, a multidisciplinary creative based in Nepal.', '/'],
  about: ['About Aashish Mahato | Film, Design & Code', 'Meet Aashish Mahato, a Nepal-based creative working across film, photography, design, motion, and web development.', '/about/'],
  gallery: ['Gallery | Films, Photography & Design by Aashish Mahato', 'Browse Aashish Mahato’s visual archive of films, photography, branding, and graphic design projects.', '/gallery/'],
  'skill-film': ['Film Projects | Aashish Mahato', 'Watch selected films and visual storytelling projects by filmmaker Aashish Mahato.', '/work/film/'],
  'skill-photography': ['Photography Portfolio | Aashish Mahato', 'Explore portraits, places, and moments captured by photographer Aashish Mahato.', '/work/photography/'],
  'skill-motion': ['Motion Graphics | Aashish Mahato', 'See motion graphics, animated visuals, and moving-image projects by Aashish Mahato.', '/work/motion/'],
  'skill-branding': ['Branding Projects | Aashish Mahato', 'Explore logo, identity, and branding projects created by Aashish Mahato.', '/work/branding/'],
  'skill-graphic': ['Graphic Design Projects | Aashish Mahato', 'See graphic design projects, campaign artwork, and visual communication by Aashish Mahato.', '/work/graphic/'],
  'skill-digital': ['Digital Projects | Aashish Mahato', 'Explore digital product and interface design projects by Aashish Mahato.', '/work/digital/'],
  'skill-web': ['Web Development Projects | Aashish Mahato', 'Explore websites and web development projects built by Aashish Mahato.', '/work/web/'],
};
export const searchImages = {
  home: '/videos/hero-poster.jpg',
  about: '/media/photos/tree-final-18.webp',
  gallery: '/media/photos/tree-final-27.webp',
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
    homeLocation: { '@type': 'Country', name: 'Nepal' },
    sameAs: officialProfiles.map((profile) => profile.url),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      { '@type': 'WebSite', '@id': websiteId, name: 'Aashish Mahato',
        url: `${siteUrl}/`, description: creativeBio, inLanguage: 'en',
        publisher: { '@id': personId } },
      { '@type': route === 'about' ? 'ProfilePage' : 'WebPage',
        '@id': `${siteUrl}${path}#webpage`, url: `${siteUrl}${path}`,
        name, description, primaryImageOfPage: `${siteUrl}${searchImages[route]}`, inLanguage: 'en', isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        ...(route === 'about' ? { mainEntity: { '@id': personId } } : {}),
      },
    ],
  };
}
