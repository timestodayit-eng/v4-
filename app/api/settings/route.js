import { NextResponse } from 'next/server';
import { getAdminSession } from '../../../lib/admin-auth';
import { getDb } from '../../../lib/db';
import { extractGtmId } from '../../../lib/content';
const keys=['gtm_input','meta_pixel_id','ga4_id','global_head_code','global_body_start_code','global_body_end_code','header_enabled','header_html','header_css','footer_enabled','footer_sticky','footer_html','footer_css'];
export async function PUT(req){
  if(!getAdminSession())return NextResponse.json({error:'Unauthorized'},{status:401});
  try{
    const b=await req.json(); const db=getDb();
    for(const key of keys){const value=String(b[key]||'');await db.query(`INSERT INTO settings(setting_key,setting_value) VALUES(?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,[key,value]);}
    const id=extractGtmId(b.gtm_input||'');
    await db.query(`INSERT INTO settings(setting_key,setting_value) VALUES('gtm_id',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,[id]);
    return NextResponse.json({success:true,gtm_id:id});
  }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
