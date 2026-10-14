export default function GlobalChrome({settings={},children}){
  const headerEnabled=String(settings.header_enabled??'1')==='1';
  const footerEnabled=String(settings.footer_enabled??'1')==='1';
  const sticky=String(settings.footer_sticky??'0')==='1';
  return <>
    {headerEnabled&&<><style dangerouslySetInnerHTML={{__html:settings.header_css||''}}/><div className="global-site-header" dangerouslySetInnerHTML={{__html:settings.header_html||''}}/></>}
    {children}
    {footerEnabled&&<><style dangerouslySetInnerHTML={{__html:settings.footer_css||''}}/><div className={`global-site-footer ${sticky?'global-site-footer-sticky':''}`} dangerouslySetInnerHTML={{__html:settings.footer_html||''}}/></>}
  </>;
}
