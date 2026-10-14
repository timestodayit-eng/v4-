'use client';
export default function CustomCodeFrame({html='',css='',js='',height=500,title='Custom code preview'}){
  const tracker = `
    document.addEventListener('click', function(e){
      var a=e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if(!a) return;
      try { parent.postMessage({type:'landing:event',event_name:'call_click',phone:(a.getAttribute('href')||'').replace('tel:','')}, '*'); } catch(err) {}
    }, true);
  `;
  const srcDoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;}*{box-sizing:border-box;} ${css}</style></head><body>${html}<script>${tracker}${js}<\/script></body></html>`;
  return <iframe title={title} className="code-frame" style={{height:Number(height)||500}} sandbox="allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation" srcDoc={srcDoc} />;
}
