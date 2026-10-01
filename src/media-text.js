// Describe the subject shown, rather than repeating search keywords.
const descriptions = {
  '/media/photos/tree-final-27.webp': 'Colorful prayer flags above a temple roof against a blue sky',
  '/media/photos/sun-set-21.webp': 'Orange sunset clouds above a silhouetted hillside and buildings',
  '/media/photos/tree-final-26.webp': 'Boudhanath stupa with painted Buddha eyes and strings of prayer flags',
  '/media/photos/6934.webp': 'Looking up a moss-covered tree trunk into a sunlit green canopy',
  '/media/photos/sun-set-3.webp': 'Black-and-white street fashion photograph of three men in matching black T-shirts outside a brick building',
  '/media/photos/tree-final-16.webp': 'Pink flowering spikes and green leaves photographed with a softly blurred background',
  '/media/photos/tree-final-18.webp': 'Black-and-white portrait of Aashish Mahato wearing round glasses',
  '/media/photos/tree-final-117.webp': 'Two friends sitting outdoors among green trees',
  '/media/photos/tree-final-28.webp': 'Birds perched on rooftop structures against a muted sky',
  '/media/photos/tree-final-5.webp': 'Small bird perched on a leafy branch with a warm blurred background',
  '/media/branding/document.webp': 'Blue CIC Nepal service booklet on a white surface framed by palm leaves',
  '/media/branding/document2.webp': 'Open CIC Nepal service brochure with blue and red panels framed by palm leaves',
  '/media/branding/macbook-mockup-3.webp': 'Savari digital driving licence interface displayed on a laptop above stone blocks',
  '/media/branding/macbook-mockup-10.webp': 'Savari dashboard interface displayed on a laptop resting on a wooden chair',
  '/media/branding/mockup5.webp': 'Two smartphone mockups showing a shopping interface against a dark background',
  '/media/branding/mockup23.webp': 'Green-and-white Decora business card on a wooden bench',
  '/media/branding/mockup4-medium.webp': 'Detail of the green-and-white Decora identity card',
  '/media/branding/document0.webp': 'Smartphone mockup showing a product page on a perforated metal surface',
  '/media/design/162.webp': 'Red-and-white Cosmic Electrical anniversary poster celebrating 25 years',
  '/media/design/158.webp': 'Blue congratulations poster featuring the Nepal cricket team',
  '/media/design/17.webp': 'Cosmic Electrical graphic with the message Work Hard, Spend Smart, Build Strong',
  '/media/design/tihar.webp': 'Tihar greeting design with festive food, lamps, and Nepali lettering',
  '/media/design/25.webp': 'Red Nepali New Year greeting with a calendar and festive lettering',
  '/media/design/79.webp': 'Red-and-white recruitment poster advertising an Account Officer position',
  '/media/design/92.webp': 'Cosmic Group Tihar campaign graphic featuring a colorful kite',
  '/media/design/146.webp': 'CIC Nepal opening announcement with a building photograph and workspace booking details',
  '/media/posters/mustang.jpg': 'Mountain landscape thumbnail for the Mustang travel film',
  '/media/posters/manang.jpg': 'Himalayan landscape thumbnail for the Manang travel film',
  '/media/posters/product-motion.jpg': 'Digital licence interface thumbnail for the Product Motion film',
  '/videos/hero-poster.jpg': 'Himalayan mountain landscape used as the portfolio showreel cover',
};

const videoDescriptions = {
  'showreel': 'Aashish Mahato’s creative showreel presenting his film and visual work.',
  'mustang-video': 'A travel film through the landscapes of Mustang, Nepal.',
  'manang-video': 'A travel film featuring Manang and its Himalayan landscape in Nepal.',
  'product-motion-video': 'A motion graphics presentation of a digital driving licence interface.',
};

export function mediaAlt(item) {
  const src = item.type === 'video' ? item.poster : item.src || item.cover;
  return item.alt || descriptions[src] || item.title || '';
}

export function mediaDescription(item) {
  return item.description || (item.type === 'video' ? videoDescriptions[item.id] || item.title : mediaAlt(item));
}
