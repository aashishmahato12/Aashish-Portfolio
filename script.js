const projectDetails = {
  atlas: { category: '01 / WEB EXPERIENCE', title: 'Atlas Studio', description: 'A bold digital home for an independent creative collective. The concept pairs oversized typography with a sharp editorial layout to give the studio a memorable online presence.', type: 'Website concept', year: '2026' },
  forma: { category: '02 / BRAND IDENTITY', title: 'Forma Objects', description: 'A playful yet refined identity for objects made to be lived with. Soft forms, tactile color, and expressive type bring the brand personality into focus.', type: 'Brand concept', year: '2026' },
  pulse: { category: '03 / PRODUCT DESIGN', title: 'Pulse Dashboard', description: 'A focused dashboard concept that helps people find the signal in their day. Clear hierarchy and calm colors make information easier to understand at a glance.', type: 'Product concept', year: '2025' },
  sora: { category: '04 / VISUAL IDENTITY', title: 'Sora Wellness', description: 'A visual language built around balance, warmth, and breathing room. The identity uses simple shapes and an optimistic palette to make mindful living feel welcoming.', type: 'Identity concept', year: '2025' },
  kinetic: { category: '05 / FILM & MOTION', title: 'Kinetic Frames', description: 'A motion concept exploring how image, rhythm, and typography can tell a story together. Built as a placeholder for a future video or motion graphics project.', type: 'Motion concept', year: '2025' },
  lightstudy: { category: '06 / PHOTOGRAPHY', title: 'Light Study', description: 'A photography concept centered on shape, shadow, and quiet observation. Replace this with a real photo series and its story when it is ready.', type: 'Photography concept', year: '2025' }
};

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = selected !== 'all' && card.dataset.category !== selected;
    });
  });
});

const dialog = document.querySelector('#project-dialog');
let lastTrigger = null;
document.querySelectorAll('.project-visual').forEach(button => {
  button.addEventListener('click', () => {
    const details = projectDetails[button.closest('.project-card').dataset.project];
    lastTrigger = button;
    document.querySelector('#dialog-category').textContent = details.category;
    document.querySelector('#dialog-title').textContent = details.title;
    document.querySelector('#dialog-description').textContent = details.description;
    document.querySelector('#dialog-type').textContent = details.type;
    document.querySelector('#dialog-year').textContent = details.year;
    dialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => lastTrigger?.focus());

document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}
