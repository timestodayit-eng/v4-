import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

const allowed=new Set(['page_view','call_click','custom_event']);
const cut=(v,n)=>String(v||'').slice(0,n);
export async function POST(req){
  try{
    const b=await req.json();
    const event=allowed.has(b.event_name)?b.event_name:'custom_event';
    const db=getDb();
    await db.query(`INSERT INTO events(page_id,slug,event_name,phone,source,medium,campaign,content,term,referrer) VALUES(?,?,?,?,?,?,?,?,?,?)`,[
      Number(b.page_id)||null,cut(b.slug,255),event,cut(b.phone,80),cut(b.source,255),cut(b.medium,255),cut(b.campaign,255),cut(b.content,255),cut(b.term,255),cut(b.referrer,2000)
    ]);
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false},{status:200})}
}
