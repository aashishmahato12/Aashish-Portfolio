import { filmProjects, featuredProjects } from './portfolio-data.js';

// Sitemap video dates are optional. Do not invent original publication dates.
export const videoPages = [...filmProjects, ...featuredProjects.filter(project => project.category === 'Motion Graphics')].map(project => {
  const media = project.media.find(item => ['video', 'youtube'].includes(item.type));
  return {
    id: project.id,
    route: `video-${project.id}`,
    path: `/watch/${project.id}/`,
    title: project.title === 'Product Motion' ? 'Savari product animation' : project.title,
    description: `Watch ${project.title === 'Product Motion' ? 'Savari’s product animation' : project.title}. ${project.description}`,
    thumbnail: media.poster || project.cover,
    category: project.category,
    collection: project.category === 'Motion Graphics' ? '/work/motion/' : '/work/film/',
    media,
    playerUrl: media.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${media.youtubeId}` : undefined,
  };
});
export const videoPageForMedia = item => videoPages.find(page => item.youtubeId ? page.media.youtubeId === item.youtubeId : page.media.src === item.src);
