'use client';
import { useEffect } from 'react';

function params(){
  const p=new URLSearchParams(location.search);
  return {source:p.get('utm_source')||'',medium:p.get('utm_medium')||'',campaign:p.get('utm_campaign')||'',content:p.get('utm_content')||'',term:p.get('utm_term')||''};
}

async function send(payload){
  try{ await fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}); }catch{}
}

function marketingEvent(name, phone=''){
  try{ if(window.dataLayer) window.dataLayer.push({event:name,phone_number:phone}); }catch{}
  try{ if(window.fbq) window.fbq('trackCustom', name, {phone_number:phone}); }catch{}
  try{ if(window.gtag) window.gtag('event', name, {phone_number:phone}); }catch{}
}

export default function LandingTracker({pageId,slug}){
  useEffect(()=>{
    const base={page_id:pageId,slug,referrer:document.referrer||'',...params()};
    send({...base,event_name:'page_view'});
    marketingEvent('landing_page_view');

    const click=(e)=>{
      const a=e.target?.closest?.('a[href^="tel:"]');
      if(!a)return;
      const phone=(a.getAttribute('href')||'').replace('tel:','');
      send({...base,event_name:'call_click',phone});
      marketingEvent('call_click',phone);
    };
    const message=(e)=>{
      if(e.data?.type!=='landing:event')return;
      const eventName=e.data.event_name==='call_click'?'call_click':'custom_event';
      const phone=String(e.data.phone||'').slice(0,80);
      send({...base,event_name:eventName,phone});
      marketingEvent(eventName,phone);
    };
    document.addEventListener('click',click,true);
    window.addEventListener('message',message);
    return ()=>{document.removeEventListener('click',click,true);window.removeEventListener('message',message)};
  },[pageId,slug]);
  return null;
}
