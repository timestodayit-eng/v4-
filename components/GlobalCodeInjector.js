'use client';
import { useEffect } from 'react';

function injectHtml(target, html, position='beforeend'){
  if(!html || !target) return [];
  const template=document.createElement('template');
  template.innerHTML=html;
  const added=[];
  [...template.content.childNodes].forEach((node)=>{
    let copy;
    if(node.nodeName==='SCRIPT'){
      copy=document.createElement('script');
      [...node.attributes].forEach(a=>copy.setAttribute(a.name,a.value));
      copy.text=node.textContent||'';
    }else{ copy=node.cloneNode(true); }
    if(position==='afterbegin') target.insertBefore(copy,target.firstChild); else target.appendChild(copy);
    added.push(copy);
  });
  return added;
}

export default function GlobalCodeInjector({headCode='',bodyStartCode='',bodyEndCode='',pageHeadCode='',pageBodyEndCode=''}){
  useEffect(()=>{
    const nodes=[
      ...injectHtml(document.head, headCode),
      ...injectHtml(document.head, pageHeadCode),
      ...injectHtml(document.body, bodyStartCode, 'afterbegin'),
      ...injectHtml(document.body, bodyEndCode),
      ...injectHtml(document.body, pageBodyEndCode),
    ];
    return ()=>nodes.forEach(n=>{try{n.remove()}catch{}});
  },[headCode,bodyStartCode,bodyEndCode,pageHeadCode,pageBodyEndCode]);
  return null;
}
