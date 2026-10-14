'use client';
import { useMemo, useState } from 'react';
import BlockRenderer from './BlockRenderer';
import { ANIMATIONS, ELEMENT_TYPES, defaultColumn, defaultElement, defaultSection, normalizeBuilderData, uid } from '../lib/builder';

function clone(v){return JSON.parse(JSON.stringify(v))}
function byId(arr,id){return (arr||[]).find(x=>x.id===id)}

export default function Builder({initialBlocks=[],onChange}){
  const initial=useMemo(()=>normalizeBuilderData(initialBlocks),[]);
  const [sections,setSections]=useState(initial);
  const [selected,setSelected]=useState({kind:'section',sectionId:initial[0]?.id||null});
  const [tab,setTab]=useState('visual');
  const [drag,setDrag]=useState(null);
  const [device,setDevice]=useState('desktop');

  function commit(next){setSections(next);onChange?.(next)}
  function mutate(fn){const next=clone(sections);fn(next);commit(next)}

  function findColumn(sectionId,columnId){const s=byId(sections,sectionId);return s?byId(s.columns,columnId):null}
  function findElement(sectionId,columnId,elementId){return byId(findColumn(sectionId,columnId)?.elements,elementId)}

  function addSection(cols=1){const s=defaultSection(cols);commit([...sections,s]);setSelected({kind:'section',sectionId:s.id})}
  function removeSection(sectionId){commit(sections.filter(s=>s.id!==sectionId));setSelected({kind:'none'})}
  function duplicateSection(sectionId){const s=clone(byId(sections,sectionId));if(!s)return;s.id=uid('section');s.title=`${s.title||'Section'} Copy`;commit([...sections,s])}

  function addElement(sectionId,columnId,type){mutate(next=>{const s=byId(next,sectionId),c=byId(s.columns,columnId);const el=defaultElement(type);c.elements.push(el);setSelected({kind:'element',sectionId,columnId,elementId:el.id})})}
  function removeElement(sectionId,columnId,elementId){mutate(next=>{const c=byId(byId(next,sectionId).columns,columnId);c.elements=c.elements.filter(e=>e.id!==elementId)});setSelected({kind:'none'})}
  function duplicateElement(sectionId,columnId,elementId){mutate(next=>{const c=byId(byId(next,sectionId).columns,columnId);const el=clone(byId(c.elements,elementId));el.id=uid(el.type);c.elements.push(el)})}

  function setSection(sectionId,key,val){mutate(next=>{const s=byId(next,sectionId);if(key==='title')s.title=val;else{s.settings=s.settings||{};s.settings[key]=val}})}
  function setColumn(sectionId,columnId,key,val){mutate(next=>{const c=byId(byId(next,sectionId).columns,columnId);if(key==='width')c.width=Number(val);else{c.settings=c.settings||{};c.settings[key]=val}})}
  function setElement(sectionId,columnId,elementId,key,val,nested='root'){mutate(next=>{const e=byId(byId(byId(next,sectionId).columns,columnId).elements,elementId);if(nested==='settings'){e.settings=e.settings||{};e.settings[key]=val}else e[key]=val})}

  function getInner(next, sectionId, columnId, parentElementId){
    const section=byId(next,sectionId); const column=section&&byId(section.columns,columnId);
    return column&&byId(column.elements,parentElementId);
  }
  function addInnerElement(sectionId,columnId,parentElementId,innerColumnId,type){mutate(next=>{const inner=getInner(next,sectionId,columnId,parentElementId);const col=inner&&byId(inner.columns,innerColumnId);if(!col)return;const el=defaultElement(type);col.elements.push(el);setSelected({kind:'inner-element',sectionId,columnId,parentElementId,innerColumnId,elementId:el.id})})}
  function removeInnerElement(sectionId,columnId,parentElementId,innerColumnId,elementId){mutate(next=>{const inner=getInner(next,sectionId,columnId,parentElementId);const col=inner&&byId(inner.columns,innerColumnId);if(col)col.elements=col.elements.filter(e=>e.id!==elementId)});setSelected({kind:'element',sectionId,columnId,elementId:parentElementId})}
  function duplicateInnerElement(sectionId,columnId,parentElementId,innerColumnId,elementId){mutate(next=>{const inner=getInner(next,sectionId,columnId,parentElementId);const col=inner&&byId(inner.columns,innerColumnId);const source=col&&byId(col.elements,elementId);if(!source)return;const el=clone(source);el.id=uid(el.type);col.elements.push(el)})}
  function setInnerElement(sectionId,columnId,parentElementId,innerColumnId,elementId,key,val,nested='root'){mutate(next=>{const inner=getInner(next,sectionId,columnId,parentElementId);const col=inner&&byId(inner.columns,innerColumnId);const e=col&&byId(col.elements,elementId);if(!e)return;if(nested==='settings'){e.settings=e.settings||{};e.settings[key]=val}else e[key]=val})}
  function setInnerColumns(sectionId,columnId,parentElementId,count){mutate(next=>{const inner=getInner(next,sectionId,columnId,parentElementId);if(!inner)return;const old=inner.columns||[];const width=100/count;inner.columns=Array.from({length:count},(_,i)=>{const c=old[i]||defaultColumn(width);c.width=width;return c})})}

  function setColumns(sectionId,count){mutate(next=>{const s=byId(next,sectionId);const old=s.columns||[];const width=100/count;const cols=[];for(let i=0;i<count;i++){const c=old[i]||defaultColumn(width);c.width=width;cols.push(c)}s.columns=cols})}

  function reorderSections(from,to){if(from===to)return;mutate(next=>{const [item]=next.splice(from,1);next.splice(to,0,item)})}

  function resolveList(next, loc){
    const section=byId(next,loc.sectionId); const column=section&&byId(section.columns,loc.columnId);
    if(!section||!column)return null;
    if(loc.level==='inner'){const inner=byId(column.elements,loc.parentElementId);const innerCol=inner&&byId(inner.columns,loc.innerColumnId);return innerCol?innerCol.elements:null}
    return column.elements;
  }
  function moveElement(from,to){if(!from||!to)return;mutate(next=>{
    const sourceList=resolveList(next,from), targetList=resolveList(next,to);if(!sourceList||!targetList)return;
    const idx=sourceList.findIndex(e=>e.id===from.elementId);if(idx<0)return;const [item]=sourceList.splice(idx,1);
    let at=typeof to.index==='number'?to.index:targetList.length;if(sourceList===targetList&&idx<at)at--;targetList.splice(Math.max(0,at),0,item)
  })}

  function importJson(value){try{const parsed=JSON.parse(value);if(!Array.isArray(parsed))throw new Error();commit(normalizeBuilderData(parsed))}catch{alert('Invalid JSON blocks')}}

  const selSection=selected.sectionId?byId(sections,selected.sectionId):null;
  const selColumn=selSection&&selected.columnId?byId(selSection.columns,selected.columnId):null;
  const selElement=selColumn&&selected.elementId?byId(selColumn.elements,selected.elementId):null;
  const selInnerParent=selColumn&&selected.parentElementId?byId(selColumn.elements,selected.parentElementId):null;
  const selInnerColumn=selInnerParent&&selected.innerColumnId?byId(selInnerParent.columns,selected.innerColumnId):null;
  const selInnerElement=selInnerColumn&&selected.elementId?byId(selInnerColumn.elements,selected.elementId):null;

  return <div className="elementor-builder">
    <div className="builder-toolbar">
      <div className="tabs"><button className={`tab ${tab==='visual'?'active':''}`} onClick={()=>setTab('visual')}>Visual Builder</button><button className={`tab ${tab==='json'?'active':''}`} onClick={()=>setTab('json')}>Raw Blocks JSON</button></div>
      <div className="device-switch"><button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')}>Desktop</button><button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')}>Mobile</button></div>
    </div>

    {tab==='json'?<div className="card"><div className="notice">Advanced: you can move the entire design as JSON. Raw HTML/CSS/JS is also available as an element.</div><textarea className="textarea codearea" defaultValue={JSON.stringify(sections,null,2)} onBlur={e=>importJson(e.target.value)}/></div>:
    <div className="elementor-layout">
      <aside className="widget-panel">
        <h3>Elements</h3><p className="muted small">Drag into any column or click to add to the selected column.</p>
        <div className="widget-grid">{ELEMENT_TYPES.map(([type,label])=><button key={type} className="widget" draggable onDragStart={()=>setDrag({kind:'new-element',type})} onClick={()=>{if((selected.kind==='inner-element'||selected.kind==='inner-column')&&selSection&&selColumn&&selInnerParent&&selInnerColumn)addInnerElement(selSection.id,selColumn.id,selInnerParent.id,selInnerColumn.id,type);else if(selSection&&selColumn)addElement(selSection.id,selColumn.id,type)}}><span className="widget-icon">{icon(type)}</span><span>{label}</span></button>)}</div>
        <h3 style={{marginTop:18}}>Sections</h3><div className="section-presets"><button onClick={()=>addSection(1)}>+ 1 Column</button><button onClick={()=>addSection(2)}>+ 2 Columns</button><button onClick={()=>addSection(3)}>+ 3 Columns</button></div>
      </aside>

      <main className={`builder-canvas ${device}`}>
        {sections.length===0&&<div className="empty-canvas"><h3>Start your page</h3><button className="btn" onClick={()=>addSection(1)}>Add Section</button></div>}
        {sections.map((section,si)=><div key={section.id} className={`canvas-section ${selected.sectionId===section.id?'selected':''}`} draggable onDragStart={e=>{if(e.target.closest('.canvas-element'))return;setDrag({kind:'section',index:si})}} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(drag?.kind==='section')reorderSections(drag.index,si)}} onClick={()=>setSelected({kind:'section',sectionId:section.id})}>
          <div className="section-toolbar"><span>☰ {section.title||'Section'}</span><div><button onClick={e=>{e.stopPropagation();duplicateSection(section.id)}}>⧉</button><button onClick={e=>{e.stopPropagation();removeSection(section.id)}}>×</button></div></div>
          <div className="canvas-columns" style={{gap:`${section.settings?.gap||0}px`,background:section.settings?.backgroundColor||'#fff',padding:`${Number(section.settings?.paddingTop??0)}px ${Number(section.settings?.paddingRight??0)}px ${Number(section.settings?.paddingBottom??0)}px ${Number(section.settings?.paddingLeft??0)}px`}}>
            {(section.columns||[]).map(column=><div key={column.id} className={`canvas-column ${selected.columnId===column.id?'selected':''}`} style={{flex:`0 0 calc(${column.width||100}% - 10px)`}} onClick={e=>{e.stopPropagation();setSelected({kind:'column',sectionId:section.id,columnId:column.id})}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();if(drag?.kind==='new-element')addElement(section.id,column.id,drag.type);if(drag?.kind==='element')moveElement(drag,{sectionId:section.id,columnId:column.id,index:column.elements.length});setDrag(null)}}>
              {(column.elements||[]).map((el,ei)=><div key={el.id} className={`canvas-element ${selected.kind==='element'&&selected.elementId===el.id?'selected':''}`} draggable onDragStart={e=>{e.stopPropagation();setDrag({kind:'element',level:'outer',sectionId:section.id,columnId:column.id,elementId:el.id})}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();if(drag?.kind==='element')moveElement(drag,{level:'outer',sectionId:section.id,columnId:column.id,index:ei});if(drag?.kind==='new-element'){mutate(next=>{const c=byId(byId(next,section.id).columns,column.id);c.elements.splice(ei,0,defaultElement(drag.type))})}setDrag(null)}} onClick={e=>{e.stopPropagation();setSelected({kind:'element',sectionId:section.id,columnId:column.id,elementId:el.id})}}>
                <div className="element-toolbar"><span>⠿ {labelFor(el.type)}</span><div><button onClick={e=>{e.stopPropagation();duplicateElement(section.id,column.id,el.id)}}>⧉</button><button onClick={e=>{e.stopPropagation();removeElement(section.id,column.id,el.id)}}>×</button></div></div>
                {el.type==='innersection'?<div className="inner-canvas" onClick={e=>{e.stopPropagation();setSelected({kind:'element',sectionId:section.id,columnId:column.id,elementId:el.id})}}>
                  <div className="inner-toolbar"><span>Inner Section</span><span>{(el.columns||[]).length} columns</span></div>
                  <div className="inner-columns" style={{gap:`${el.settings?.gap||8}px`}}>
                    {(el.columns||[]).map(innerCol=><div key={innerCol.id} className="inner-column" style={{flex:`0 0 calc(${innerCol.width||50}% - 4px)`}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();if(drag?.kind==='new-element')addInnerElement(section.id,column.id,el.id,innerCol.id,drag.type);if(drag?.kind==='element')moveElement(drag,{level:'inner',sectionId:section.id,columnId:column.id,parentElementId:el.id,innerColumnId:innerCol.id,index:(innerCol.elements||[]).length});setDrag(null)}}>
                      {(innerCol.elements||[]).map((innerEl,ii)=><div key={innerEl.id} className={`inner-element ${selected.kind==='inner-element'&&selected.elementId===innerEl.id?'selected':''}`} draggable onDragStart={e=>{e.stopPropagation();setDrag({kind:'element',level:'inner',sectionId:section.id,columnId:column.id,parentElementId:el.id,innerColumnId:innerCol.id,elementId:innerEl.id})}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.stopPropagation();if(drag?.kind==='element')moveElement(drag,{level:'inner',sectionId:section.id,columnId:column.id,parentElementId:el.id,innerColumnId:innerCol.id,index:ii});if(drag?.kind==='new-element'){mutate(next=>{const inner=getInner(next,section.id,column.id,el.id);const c=byId(inner.columns,innerCol.id);c.elements.splice(ii,0,defaultElement(drag.type))})}setDrag(null)}} onClick={e=>{e.stopPropagation();setSelected({kind:'inner-element',sectionId:section.id,columnId:column.id,parentElementId:el.id,innerColumnId:innerCol.id,elementId:innerEl.id})}}>
                        <div className="inner-element-tools"><button onClick={e=>{e.stopPropagation();duplicateInnerElement(section.id,column.id,el.id,innerCol.id,innerEl.id)}}>⧉</button><button onClick={e=>{e.stopPropagation();removeInnerElement(section.id,column.id,el.id,innerCol.id,innerEl.id)}}>×</button></div>
                        <BlockRenderer block={{type:'section',settings:{paddingTop:2,paddingRight:2,paddingBottom:2,paddingLeft:2,contentWidth:1000,gap:0,backgroundColor:'transparent'},columns:[{id:'nested-preview',width:100,settings:{padding:0},elements:[innerEl]}]}} preview/>
                      </div>)}
                      <button className="nested-add" onClick={e=>{e.stopPropagation();setSelected({kind:'inner-column',sectionId:section.id,columnId:column.id,parentElementId:el.id,innerColumnId:innerCol.id})}}>+ Drop element here</button>
                    </div>)}
                  </div>
                </div>:<BlockRenderer block={{type:'section',settings:{paddingTop:8,paddingRight:8,paddingBottom:8,paddingLeft:8,contentWidth:1000,gap:0,backgroundColor:'transparent'},columns:[{id:'preview',width:100,settings:{padding:0},elements:[el]}]}} preview/>}
              </div>)}
              <button className="add-element-inline" onClick={e=>{e.stopPropagation();setSelected({kind:'column',sectionId:section.id,columnId:column.id})}}>+ Drop / Add element</button>
            </div>)}
          </div>
        </div>)}
      </main>

      <aside className="settings-panel">
        <h3>Settings</h3>
        {selected.kind==='none'&&<p className="muted">Select a section, column or element.</p>}
        {selected.kind==='section'&&selSection&&<SectionSettings section={selSection} setValue={(k,v)=>setSection(selSection.id,k,v)} setColumns={c=>setColumns(selSection.id,c)}/>} 
        {selected.kind==='column'&&selSection&&selColumn&&<ColumnSettings column={selColumn} setValue={(k,v)=>setColumn(selSection.id,selColumn.id,k,v)}/>} 
        {selected.kind==='element'&&selElement&&<ElementSettings element={selElement} setValue={(k,v,n)=>setElement(selSection.id,selColumn.id,selElement.id,k,v,n)} setInnerColumns={selElement.type==='innersection'?(c=>setInnerColumns(selSection.id,selColumn.id,selElement.id,c)):undefined}/>} 
        {selected.kind==='inner-column'&&selInnerColumn&&<><div className="badge">Inner Column</div><p className="muted small">Drag an element from the left panel into this inner column.</p></>}
        {selected.kind==='inner-element'&&selInnerElement&&<ElementSettings element={selInnerElement} setValue={(k,v,n)=>setInnerElement(selSection.id,selColumn.id,selInnerParent.id,selInnerColumn.id,selInnerElement.id,k,v,n)}/>} 
      </aside>
    </div>}

    <div style={{marginTop:28}}><h3>Full Page Preview</h3><div className={`preview ${device==='mobile'?'mobile-preview':''}`}>{sections.map((s,i)=><BlockRenderer key={s.id||i} block={s} preview/>)}</div></div>
  </div>
}

function SectionSettings({section,setValue,setColumns}){const s=section.settings||{};return <>
  <label className="label">Section name</label><input className="input" value={section.title||''} onChange={e=>setValue('title',e.target.value)}/>
  <label className="label">Columns</label><div className="segmented">{[1,2,3,4].map(n=><button key={n} onClick={()=>setColumns(n)}>{n}</button>)}</div>
  <Color label="Background" value={s.backgroundColor||'#ffffff'} onChange={v=>setValue('backgroundColor',v)}/>
  <Range label="Content width" value={s.contentWidth||1920} min="320" max="1600" onChange={v=>setValue('contentWidth',v)}/>
  <Range label="Column gap" value={s.gap||20} min="0" max="80" onChange={v=>setValue('gap',v)}/>
  <BoxControls settings={s} setValue={setValue}/>
  <Animation value={s.animation||'none'} onChange={v=>setValue('animation',v)}/>
  <label className="label">Custom CSS class</label><input className="input" value={s.customClass||''} onChange={e=>setValue('customClass',e.target.value)}/>
</>}

function ColumnSettings({column,setValue}){const s=column.settings||{};return <>
  <Range label="Column width %" value={column.width||100} min="10" max="100" onChange={v=>setValue('width',v)}/>
  <Color label="Background" value={s.backgroundColor||'#ffffff'} onChange={v=>setValue('backgroundColor',v)}/>
  <Range label="Inner padding" value={s.padding??12} min="0" max="80" onChange={v=>setValue('padding',v)}/>
  <Range label="Border radius" value={s.borderRadius||0} min="0" max="60" onChange={v=>setValue('borderRadius',v)}/>
  <label className="label">Vertical align</label><select className="select" value={s.verticalAlign||'center'} onChange={e=>setValue('verticalAlign',e.target.value)}><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select>
</>}

function ElementSettings({element,setValue,setInnerColumns}){const s=element.settings||{};return <>
  <div className="badge">{labelFor(element.type)}</div>
  {element.type==='heading'&&<><label className="label">Heading text</label><textarea className="textarea" value={element.content||''} onChange={e=>setValue('content',e.target.value)}/></>}
  {element.type==='text'&&<><label className="label">Text</label><textarea className="textarea" value={element.content||''} onChange={e=>setValue('content',e.target.value)}/></>}
  {element.type==='button'&&<><label className="label">Button text</label><input className="input" value={element.text||''} onChange={e=>setValue('text',e.target.value)}/><label className="label">Button URL</label><input className="input" value={element.url||''} onChange={e=>setValue('url',e.target.value)}/></>}
  {element.type==='image'&&<><label className="label">Image URL</label><input className="input" value={element.src||''} onChange={e=>setValue('src',e.target.value)}/><label className="label">Alt text</label><input className="input" value={element.alt||''} onChange={e=>setValue('alt',e.target.value)}/><Range label="Max width" value={s.maxWidth||420} min="80" max="1400" onChange={v=>setValue('maxWidth',v,'settings')}/></>}
  {element.type==='video'&&<><label className="label">YouTube URL</label><input className="input" value={element.videoUrl||''} onChange={e=>setValue('videoUrl',e.target.value)}/><Range label="Max width" value={s.maxWidth||860} min="240" max="1400" onChange={v=>setValue('maxWidth',v,'settings')}/></>}
  {element.type==='spacer'&&<Range label="Spacer height" value={element.height||40} min="0" max="400" onChange={v=>setValue('height',v)}/>} 
  {element.type==='form'&&<><label className="label">Form name</label><input className="input" value={element.formName||''} onChange={e=>setValue('formName',e.target.value)}/><label className="label">Submit button text</label><input className="input" value={element.submitText||'Submit'} onChange={e=>setValue('submitText',e.target.value)}/><label className="label">Success message</label><input className="input" value={element.successMessage||'Thank you'} onChange={e=>setValue('successMessage',e.target.value)}/><label className="label">Fields JSON</label><textarea className="textarea codearea" value={JSON.stringify(element.fields||[],null,2)} onChange={e=>{try{setValue('fields',JSON.parse(e.target.value))}catch{}}}/><div className="notice">Field example: {`[{"label":"Name","name":"name","type":"text","required":true}]`}</div></>} 
  {element.type==='html'&&<><label className="label">HTML</label><textarea className="textarea codearea" value={element.html||''} onChange={e=>setValue('html',e.target.value)}/><label className="label">CSS</label><textarea className="textarea codearea" value={element.css||''} onChange={e=>setValue('css',e.target.value)}/><label className="label">JavaScript</label><textarea className="textarea codearea" value={element.js||''} onChange={e=>setValue('js',e.target.value)}/><Range label="Frame height" value={element.height||300} min="100" max="1400" onChange={v=>setValue('height',v)}/><div className="notice">JavaScript runs in a sandboxed iframe.</div></>}
  {element.type==='innersection'&&<InnerSectionSettings element={element} setValue={setValue} setColumns={setInnerColumns}/>} 
  {!['html','spacer','innersection','divider','form'].includes(element.type)&&<><label className="label">Alignment</label><select className="select" value={s.align||'center'} onChange={e=>setValue('align',e.target.value,'settings')}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select><Color label="Text color" value={s.color||'#162033'} onChange={v=>setValue('color',v,'settings')}/><Color label={element.type==='button'?'Button color':'Background'} value={s.backgroundColor||'#ffffff'} onChange={v=>setValue('backgroundColor',v,'settings')}/><Range label="Font size" value={s.fontSize||17} min="10" max="90" onChange={v=>setValue('fontSize',v,'settings')}/><Range label="Font weight" value={s.fontWeight||400} min="100" max="900" step="100" onChange={v=>setValue('fontWeight',v,'settings')}/></>}
  {!['html','innersection'].includes(element.type)&&<><BoxControls settings={s} setValue={(k,v)=>setValue(k,v,'settings')}/><Animation value={s.animation||'none'} onChange={v=>setValue('animation',v,'settings')}/><Range label="Animation delay ms" value={s.animationDelay||0} min="0" max="2000" step="50" onChange={v=>setValue('animationDelay',v,'settings')}/></>}
</>}

function InnerSectionSettings({element,setValue,setColumns}){const s=element.settings||{};return <><p className="muted small">Nested row: drag elements from the left panel directly into its columns.</p><label className="label">Inner columns</label><div className="segmented">{[1,2,3,4].map(n=><button key={n} onClick={()=>setColumns?.(n)}>{n}</button>)}</div><Range label="Gap" value={s.gap||16} min="0" max="80" onChange={v=>setValue('gap',v,'settings')}/><Color label="Background" value={s.backgroundColor||'#ffffff'} onChange={v=>setValue('backgroundColor',v,'settings')}/><BoxControls settings={s} setValue={(k,v)=>setValue(k,v,'settings')}/><Animation value={s.animation||'none'} onChange={v=>setValue('animation',v,'settings')}/></>}

function BoxControls({settings,setValue}){return <details className="settings-details"><summary>Spacing & Radius</summary><div className="grid two compact"><Range label="Padding top" value={settings.paddingTop||0} min="0" max="160" onChange={v=>setValue('paddingTop',v)}/><Range label="Padding bottom" value={settings.paddingBottom||0} min="0" max="160" onChange={v=>setValue('paddingBottom',v)}/><Range label="Padding left" value={settings.paddingLeft||0} min="0" max="160" onChange={v=>setValue('paddingLeft',v)}/><Range label="Padding right" value={settings.paddingRight||0} min="0" max="160" onChange={v=>setValue('paddingRight',v)}/><Range label="Margin top" value={settings.marginTop||0} min="0" max="160" onChange={v=>setValue('marginTop',v)}/><Range label="Margin bottom" value={settings.marginBottom||0} min="0" max="160" onChange={v=>setValue('marginBottom',v)}/><Range label="Radius" value={settings.borderRadius||0} min="0" max="80" onChange={v=>setValue('borderRadius',v)}/></div></details>}
function Color({label,value,onChange}){return <div><label className="label">{label}</label><div className="color-row"><input type="color" value={validColor(value)} onChange={e=>onChange(e.target.value)}/><input className="input" value={value||''} onChange={e=>onChange(e.target.value)}/></div></div>}
function Range({label,value,min,max,step=1,onChange}){return <div><label className="label">{label}: <span className="muted">{value}</span></label><input className="range" type="range" value={Number(value)||0} min={min} max={max} step={step} onChange={e=>onChange(Number(e.target.value))}/></div>}
function Animation({value,onChange}){return <><label className="label">Animation</label><select className="select" value={value||'none'} onChange={e=>onChange(e.target.value)}>{ANIMATIONS.map(a=><option key={a} value={a}>{a}</option>)}</select></>}
function validColor(v){return /^#[0-9A-F]{6}$/i.test(v||'')?v:'#ffffff'}
function labelFor(type){return ELEMENT_TYPES.find(x=>x[0]===type)?.[1]||type}
function icon(type){return {heading:'H',text:'T',button:'▣',image:'▧',video:'▶',divider:'—',spacer:'↕',innersection:'▥',form:'▤',html:'</>'}[type]||'+'}
