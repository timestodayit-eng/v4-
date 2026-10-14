export const CATEGORIES = [
  { key: 'pro', name: 'Pro Landing Page', description: 'Long-form, premium conversion landing pages.' },
  { key: 'call', name: 'Call Landing Page', description: 'Focused pages designed to generate phone calls.' },
  { key: 'trust', name: 'Trust Gain Landing Page', description: 'Authority, proof, video and testimonial focused pages.' },
  { key: 'fomo', name: 'FOMO Landing Page', description: 'Urgency and deadline-led campaign pages.' },
  { key: 'review', name: 'Review Landing Page', description: 'Review, testimonial and social proof focused pages.' },
];

export function getCategory(key) {
  return CATEGORIES.find((item) => item.key === key);
}
