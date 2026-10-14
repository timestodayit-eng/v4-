import { heroSection, defaultSection, defaultElement, normalizeBuilderData } from './builder';

export function safeJson(value, fallback = []) {
  try { return JSON.parse(value || ''); } catch { return fallback; }
}

export function defaultBlocks(category = 'pro') {
  const hero = heroSection();
  const cta = defaultSection(1);
  cta.title='CTA';
  cta.settings.backgroundColor='#f8fafc';
  cta.columns[0].elements=[
    {...defaultElement('heading'),content:'Ready to talk?',settings:{...defaultElement('heading').settings,fontSize:34}},
    {...defaultElement('text'),content:'Speak directly with our team.'},
    {...defaultElement('button'),text:'Call Now'}
  ];

  if(category==='call') return [hero,cta];

  const trust=defaultSection(3);
  trust.title='Trust';
  trust.settings.backgroundColor='#f8fafc';
  trust.columns.forEach((c,i)=>{c.elements=[{...defaultElement('heading'),content:['Licensed','Transparent','Support'][i],settings:{...defaultElement('heading').settings,fontSize:25}},{...defaultElement('text'),content:['Add your real licence or credential.','Explain the process clearly.','Tell visitors how your team helps.'][i]}]});

  if(category==='trust') return [hero,trust,cta];

  if(category==='review') {
    const reviews=defaultSection(3); reviews.title='Reviews'; reviews.columns.forEach((c,i)=>{c.elements=[{...defaultElement('heading'),content:`Review ${i+1}`,settings:{...defaultElement('heading').settings,fontSize:24}},{...defaultElement('text'),content:'Add a genuine customer review here.'}]});
    return [hero,reviews,cta];
  }

  if(category==='fomo') {
    const urgency=defaultSection(1); urgency.title='FOMO'; urgency.settings.backgroundColor='#fff7ed'; urgency.columns[0].elements=[{...defaultElement('heading'),content:'Limited opportunity',settings:{...defaultElement('heading').settings,color:'#9a3412'}},{...defaultElement('text'),content:'Use only a real deadline or real availability statement.'}];
    return [hero,urgency,cta];
  }

  return [hero,trust,cta];
}

export function extractYouTubeId(url='') {
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : '';
}

export function extractGtmId(input='') {
  const match = String(input).match(/GTM-[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : '';
}

export function normalizeMeta(input = {}) {
  return {
    seo_title: String(input.seo_title || '').slice(0, 255),
    seo_description: String(input.seo_description || '').slice(0, 1000),
    og_image: String(input.og_image || '').slice(0, 2000),
    favicon_url: String(input.favicon_url || '').slice(0, 2000),
    canonical_url: String(input.canonical_url || '').slice(0, 2000),
    head_code: String(input.head_code || ''),
    body_end_code: String(input.body_end_code || ''),
  };
}

export { normalizeBuilderData };
