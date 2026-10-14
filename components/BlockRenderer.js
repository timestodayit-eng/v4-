import CustomCodeFrame from './CustomCodeFrame';
import { extractYouTubeId } from '../lib/content';

function px(v){return v===undefined||v===null||v===''?undefined:`${Number(v)||0}px`}
function box(settings={}){
  return {
    background:settings.backgroundColor||undefined,
    color:settings.color||undefined,
    textAlign:settings.align||undefined,
    paddingTop:px(settings.paddingTop),paddingRight:px(settings.paddingRight),paddingBottom:px(settings.paddingBottom),paddingLeft:px(settings.paddingLeft),
    marginTop:px(settings.marginTop),marginRight:px(settings.marginRight),marginBottom:px(settings.marginBottom),marginLeft:px(settings.marginLeft),
    borderRadius:px(settings.borderRadius),
    animationDelay:settings.animationDelay?`${Number(settings.animationDelay)}ms`:undefined
  };
}
function anim(settings={}){return settings.animation&&settings.animation!=='none'?`lc-anim lc-${settings.animation}`:''}

function Element({element,preview=false}){
  const s=element.settings||{};
  const style={...box(s),fontSize:s.fontSize?`${s.fontSize}px`:undefined,fontWeight:s.fontWeight||undefined,maxWidth:s.maxWidth?`${s.maxWidth}px`:undefined};
  const cls=`lc-element lc-${element.type} ${anim(s)}`;
  if(element.type==='heading') return <h2 className={cls} style={style}>{element.content}</h2>;
  if(element.type==='text') return <div className={cls} style={style}>{element.content}</div>;
  if(element.type==='button') return <div className={`lc-button-wrap ${anim(s)}`} style={{textAlign:s.align||'center',marginTop:px(s.marginTop),marginBottom:px(s.marginBottom)}}><a className="lc-button" href={element.url||'#'} style={{background:s.backgroundColor||'#2563eb',color:s.color||'#fff',fontSize:px(s.fontSize),fontWeight:s.fontWeight||800,padding:`${Number(s.paddingTop||14)}px ${Number(s.paddingRight||24)}px ${Number(s.paddingBottom||14)}px ${Number(s.paddingLeft||24)}px`,borderRadius:px(s.borderRadius||12)}}>{element.text||'Button'}</a></div>;
  if(element.type==='image') return element.src?<div className={cls} style={{textAlign:s.align||'center',...box(s)}}><img src={element.src} alt={element.alt||''} style={{width:'100%',maxWidth:s.maxWidth?`${s.maxWidth}px`:'100%',borderRadius:px(s.borderRadius),display:'inline-block'}}/></div>:<div className="lc-placeholder">Add image URL</div>;
  if(element.type==='video') {const yt=extractYouTubeId(element.videoUrl||'');return yt?<div className={cls} style={{maxWidth:s.maxWidth?`${s.maxWidth}px`:'900px',marginLeft:'auto',marginRight:'auto',...box(s)}}><iframe className="yt" style={{borderRadius:px(s.borderRadius)}} src={`https://www.youtube.com/embed/${yt}?rel=0`} allowFullScreen title="Video"/></div>:<div className="lc-placeholder">Add YouTube URL</div>}
  if(element.type==='divider') return <div className={cls} style={box(s)}><hr style={{border:0,borderTop:`1px solid ${s.color||'#e4e7ec'}`}}/></div>;
  if(element.type==='spacer') return <div className="lc-spacer" style={{height:px(element.height||40)}}/>;
  if(element.type==='form') return <form action="/api/form-submit" method="post" className={cls} style={{display:'grid',gap:10,...box(s)}}><input type="hidden" name="_form_name" value={element.formName||'Lead Form'}/><input type="hidden" name="_success_message" value={element.successMessage||'Thank you'}/>{(element.fields||[]).map((f,i)=><div key={i}><label style={{display:'block',fontSize:13,fontWeight:700,marginBottom:4}}>{f.label}</label>{f.type==='textarea'?<textarea name={f.name} required={!!f.required} style={{width:'100%',padding:10}}/>:<input type={f.type||'text'} name={f.name} required={!!f.required} style={{width:'100%',padding:10}}/>}</div>)}<button type="submit" style={{padding:'12px 16px',background:'#2563eb',color:'#fff',border:0,borderRadius:8}}>{element.submitText||'Submit'}</button></form>;
  if(element.type==='html') return <CustomCodeFrame html={element.html||''} css={element.css||''} js={element.js||''} height={element.height||300} title="Custom code"/>;
  if(element.type==='innersection') return <InnerSection element={element} preview={preview}/>;
  return null;
}

function Column({column,preview=false}){
  const s=column.settings||{};
  return <div className="lc-column" style={{flex:`0 0 ${column.width||100}%`,maxWidth:`${column.width||100}%`,background:s.backgroundColor||'transparent',padding:px(s.padding??0),borderRadius:px(s.borderRadius),alignSelf:s.verticalAlign==='top'?'flex-start':s.verticalAlign==='bottom'?'flex-end':'center'}}>
    {(column.elements||[]).map((el,i)=><Element key={el.id||i} element={el} preview={preview}/>) }
  </div>
}

function InnerSection({element,preview=false}){
  const s=element.settings||{};
  return <div className={`lc-innersection ${anim(s)}`} style={{display:'flex',flexWrap:'wrap',gap:px(s.gap||0),background:s.backgroundColor||'transparent',padding:`${Number(s.paddingTop||0)}px ${Number(s.paddingRight||0)}px ${Number(s.paddingBottom||0)}px ${Number(s.paddingLeft||0)}px`,borderRadius:px(s.borderRadius)}}>
    {(element.columns||[]).map((c,i)=><Column key={c.id||i} column={c} preview={preview}/>) }
  </div>
}

function Section({section,preview=false}){
  const s=section.settings||{};
  return <section className={`lc-section ${anim(s)} ${s.customClass||''}`} style={{background:s.backgroundColor||'#fff',padding:`${Number(s.paddingTop??0)}px ${Number(s.paddingRight??0)}px ${Number(s.paddingBottom??0)}px ${Number(s.paddingLeft??0)}px`,marginTop:px(s.marginTop),marginBottom:px(s.marginBottom),borderRadius:px(s.borderRadius)}}>
    <div className="lc-section-inner" style={{maxWidth:s.contentWidth?`${Number(s.contentWidth)}px`:'none',margin:'0 auto',display:'flex',flexWrap:'wrap',gap:px(s.gap||0),alignItems:'stretch'}}>
      {(section.columns||[]).map((column,i)=><Column key={column.id||i} column={column} preview={preview}/>) }
    </div>
  </section>
}

export default function BlockRenderer({block,preview=false}){
  if(block?.type==='section') return <Section section={block} preview={preview}/>;
  // Legacy fallback
  if(block?.type==='custom') return <CustomCodeFrame html={block.html||''} css={block.css||''} js={block.js||''} height={block.height||500}/>;
  return <section className={preview?'preview-section':'public-section'}><div className={preview?'':'public-inner'}>
    {block?.type==='hero'?<h1>{block.heading}</h1>:<h2>{block?.heading}</h2>}
    {block?.text&&<p>{block.text}</p>}
    {(block?.type==='hero'||block?.type==='cta')&&block?.buttonText&&<a className={preview?'btn':'public-cta'} href={block.buttonUrl||'#'}>{block.buttonText}</a>}
  </div></section>
}
