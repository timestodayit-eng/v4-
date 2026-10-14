'use client';
import { useState } from 'react';
export default function SettingsForm({initial={}}){
  const [form,setForm]=useState(initial); const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(x=>({...x,[k]:v}));
  async function save(){setSaving(true);const res=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const data=await res.json();setSaving(false);if(!res.ok)return alert(data.error||'Save failed');alert('Saved');}
  return <div className="grid two">
    <div className="card"><h2>Global Header Editor</h2><p className="muted">Shown on every published landing page. No forced padding.</p>
      <label className="label"><input type="checkbox" checked={String(form.header_enabled||'1')==='1'} onChange={e=>set('header_enabled',e.target.checked?'1':'0')}/> Enable header</label>
      <label className="label">Header HTML</label><textarea className="textarea codearea" value={form.header_html||''} onChange={e=>set('header_html',e.target.value)} placeholder="<div class='site-head'>...</div>"/>
      <label className="label">Header CSS</label><textarea className="textarea codearea" value={form.header_css||''} onChange={e=>set('header_css',e.target.value)} placeholder=".site-head{width:100%;padding:0}"/>
    </div>
    <div className="card"><h2>Global Footer Editor</h2><p className="muted">Edit or disable footer. Sticky footer is optional.</p>
      <label className="label"><input type="checkbox" checked={String(form.footer_enabled||'1')==='1'} onChange={e=>set('footer_enabled',e.target.checked?'1':'0')}/> Enable footer</label>
      <label className="label"><input type="checkbox" checked={String(form.footer_sticky||'0')==='1'} onChange={e=>set('footer_sticky',e.target.checked?'1':'0')}/> Sticky footer</label>
      <label className="label">Footer HTML</label><textarea className="textarea codearea" value={form.footer_html||''} onChange={e=>set('footer_html',e.target.value)} placeholder="<div class='site-foot'>...</div>"/>
      <label className="label">Footer CSS</label><textarea className="textarea codearea" value={form.footer_css||''} onChange={e=>set('footer_css',e.target.value)} placeholder=".site-foot{width:100%;padding:0}"/>
    </div>
    <div className="card"><h2>Analytics IDs</h2><p className="muted">Loaded on every published landing page, never on the admin dashboard.</p>
      <label className="label">Google Tag Manager code or ID</label><textarea className="textarea codearea" value={form.gtm_input||''} onChange={e=>set('gtm_input',e.target.value)} placeholder="GTM-XXXXXXX or full GTM snippet"/>
      <label className="label">Meta Pixel ID</label><input className="input" value={form.meta_pixel_id||''} onChange={e=>set('meta_pixel_id',e.target.value)} placeholder="123456789012345"/>
      <label className="label">GA4 Measurement ID</label><input className="input" value={form.ga4_id||''} onChange={e=>set('ga4_id',e.target.value)} placeholder="G-XXXXXXXXXX"/>
    </div>
    <div className="card"><h2>Invisible Global Custom Code</h2><p className="muted">Use for trusted scripts, verification tags or chat widgets.</p>
      <label className="label">HEAD code</label><textarea className="textarea codearea" value={form.global_head_code||''} onChange={e=>set('global_head_code',e.target.value)}/>
      <label className="label">BODY start code</label><textarea className="textarea codearea" value={form.global_body_start_code||''} onChange={e=>set('global_body_start_code',e.target.value)}/>
      <label className="label">BODY end code</label><textarea className="textarea codearea" value={form.global_body_end_code||''} onChange={e=>set('global_body_end_code',e.target.value)}/>
    </div>
    <div><button className="btn" onClick={save} disabled={saving}>{saving?'Saving...':'Save Global Settings'}</button></div>
  </div>;
}
