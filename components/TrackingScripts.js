import Gtm,{GtmNoScript} from './Gtm';

export default function TrackingScripts({gtmId='',metaPixelId='',ga4Id=''}){
  return <>
    <Gtm id={gtmId}/>
    {metaPixelId ? <script dangerouslySetInnerHTML={{__html:`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${String(metaPixelId).replace(/[^0-9]/g,'')}');fbq('track','PageView');`}}/> : null}
    {ga4Id ? <><script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`}/><script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${String(ga4Id).replace(/[^A-Za-z0-9_-]/g,'')}');`}}/></> : null}
  </>;
}

export function TrackingNoScript({gtmId=''}){ return <GtmNoScript id={gtmId}/>; }
