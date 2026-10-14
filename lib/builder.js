export function uid(prefix='item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultElement(type='text') {
  const common = {
    id: uid(type),
    type,
    settings: {
      align: 'center',
      color: '#162033',
      backgroundColor: 'transparent',
      fontSize: type === 'heading' ? 42 : 17,
      fontWeight: type === 'heading' ? 800 : 400,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 18,
      marginLeft: 0,
      borderRadius: 0,
      animation: 'none',
      animationDelay: 0,
    }
  };

  if (type === 'heading') return {...common, content: 'Your headline'};
  if (type === 'text') return {...common, content: 'Add your supporting text here.', settings:{...common.settings,color:'#667085'}};
  if (type === 'button') return {...common, text:'Call Now', url:'tel:+8801000000000', settings:{...common.settings,color:'#ffffff',backgroundColor:'#2563eb',fontSize:18,fontWeight:800,paddingTop:14,paddingRight:24,paddingBottom:14,paddingLeft:24,borderRadius:12,marginBottom:0}};
  if (type === 'image') return {...common, src:'', alt:'', settings:{...common.settings,maxWidth:420,borderRadius:16}};
  if (type === 'video') return {...common, videoUrl:'', settings:{...common.settings,maxWidth:860,borderRadius:16}};
  if (type === 'divider') return {...common, settings:{...common.settings,color:'#e4e7ec',marginTop:12,marginBottom:12}};
  if (type === 'spacer') return {...common, height:40};
  if (type === 'form') return {...common, formName:'Lead Form', submitText:'Submit', successMessage:'Thank you. We received your submission.', fields:[{label:'Name',name:'name',type:'text',required:true},{label:'Phone',name:'phone',type:'tel',required:true}], settings:{...common.settings,marginBottom:0}};
  if (type === 'html') return {...common, html:'<div class="custom-box">Custom HTML</div>', css:'.custom-box{padding:24px;text-align:center;background:#f8fafc;border-radius:12px}', js:'', height:220};
  if (type === 'innersection') return {
    id: uid('innersection'),
    type: 'innersection',
    settings: {gap:0,backgroundColor:'transparent',paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0,borderRadius:0,animation:'none'},
    columns: [defaultColumn(50), defaultColumn(50)]
  };
  return common;
}

export function defaultColumn(width=100) {
  return { id: uid('col'), width, settings:{backgroundColor:'transparent',padding:0,borderRadius:0,verticalAlign:'center'}, elements:[] };
}

export function defaultSection(columns=1) {
  const width = Math.round(100 / columns * 100) / 100;
  return {
    id: uid('section'),
    type:'section',
    title:'Section',
    settings:{
      contentWidth:1920,
      gap:0,
      backgroundColor:'#ffffff',
      paddingTop:0,
      paddingRight:0,
      paddingBottom:0,
      paddingLeft:0,
      marginTop:0,
      marginBottom:0,
      borderRadius:0,
      animation:'none',
      customClass:''
    },
    columns:Array.from({length:columns},()=>defaultColumn(width))
  };
}

export function heroSection() {
  const section = defaultSection(1);
  section.title='Hero';
  section.settings.backgroundColor='#ffffff';
  section.columns[0].elements = [
    {...defaultElement('heading'), content:'Your campaign headline'},
    {...defaultElement('text'), content:'Use a clear promise and one primary action.'},
    {...defaultElement('button'), text:'Call Now'}
  ];
  return section;
}

function legacyToElement(block) {
  if (!block) return null;
  if (block.type === 'custom') return {...defaultElement('html'), html:block.html||'', css:block.css||'', js:block.js||'', height:block.height||500};
  if (block.type === 'video') {
    const section = defaultSection(1);
    section.title='Video';
    section.columns[0].elements=[
      {...defaultElement('heading'),content:block.heading||'Video'},
      {...defaultElement('text'),content:block.text||''},
      {...defaultElement('video'),videoUrl:block.videoUrl||''}
    ];
    return {__section:section};
  }
  const section = defaultSection(1);
  section.title = block.title || block.type || 'Section';
  const els=[];
  if (block.heading) els.push({...defaultElement('heading'), content:block.heading});
  if (block.text) els.push({...defaultElement('text'), content:block.text});
  if ((block.type==='hero'||block.type==='cta') && block.buttonText) els.push({...defaultElement('button'), text:block.buttonText, url:block.buttonUrl||'#'});
  section.columns[0].elements=els;
  return {__section:section};
}

export function normalizeBuilderData(blocks=[]) {
  if (!Array.isArray(blocks)) return [];
  if (blocks.every(x=>x && x.type==='section')) return blocks;
  const sections=[];
  for (const block of blocks) {
    if (block?.type==='section') sections.push(block);
    else {
      const converted=legacyToElement(block);
      if (converted?.__section) sections.push(converted.__section);
    }
  }
  return sections;
}

export const ANIMATIONS = ['none','fade-in','fade-up','fade-down','slide-left','slide-right','zoom-in','bounce-in','pulse'];
export const ELEMENT_TYPES = [
  ['heading','Heading'],['text','Text'],['button','Button'],['image','Image'],['video','Video'],['divider','Divider'],['spacer','Spacer'],['form','Form'],['innersection','Inner Section'],['html','Raw HTML/CSS/JS']
];
