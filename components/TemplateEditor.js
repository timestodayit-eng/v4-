'use client';
import { useState } from 'react';
import Builder from './Builder';
export default function TemplateEditor({category,name,initialBlocks}){
  const [blocks,setBlocks]=useState(initialBlocks); const [saving,setSaving]=useState(false);
  async function save(){setSaving(true);const res=await fetch(`/api/templates/${category}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,blocks})});const data=await res.json();setSaving(false);if(!res.ok)return alert(data.error||'Save failed');alert('Master template saved')}
  return <div><div className="topbar"><div><h1>{name} Master Template</h1><p className="muted">Every new page in this category starts from this template.</p></div><button className="btn" onClick={save} disabled={saving}>{saving?'Saving...':'Save Master Template'}</button></div><Builder initialBlocks={blocks} onChange={setBlocks}/></div>;
}
