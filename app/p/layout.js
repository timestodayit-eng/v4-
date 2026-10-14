import { getDb } from '../../lib/db';
import TrackingScripts,{TrackingNoScript} from '../../components/TrackingScripts';
import GlobalCodeInjector from '../../components/GlobalCodeInjector';
import GlobalChrome from '../../components/GlobalChrome';
export const dynamic='force-dynamic';
export default async function PublicLayout({children}){
  const settings={};
  try{
    const db=getDb();
    const [rows]=await db.query("SELECT setting_key,setting_value FROM settings WHERE setting_key IN ('gtm_id','meta_pixel_id','ga4_id','global_head_code','global_body_start_code','global_body_end_code','header_enabled','header_html','header_css','footer_enabled','footer_sticky','footer_html','footer_css')");
    for(const r of rows)settings[r.setting_key]=r.setting_value||'';
  }catch(e){console.error('Public settings load failed',e.message)}
  return <><TrackingScripts gtmId={settings.gtm_id} metaPixelId={settings.meta_pixel_id} ga4Id={settings.ga4_id}/><TrackingNoScript gtmId={settings.gtm_id}/><GlobalCodeInjector headCode={settings.global_head_code} bodyStartCode={settings.global_body_start_code} bodyEndCode={settings.global_body_end_code}/><GlobalChrome settings={settings}>{children}</GlobalChrome></>;
}
