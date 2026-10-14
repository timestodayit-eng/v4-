import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
export async function POST(req){
  try{
    const fd=await req.formData();
    const data={}; let formName='Lead Form'; let success='Thank you';
    for(const [k,v] of fd.entries()){
      if(k==='_form_name') formName=String(v||'Lead Form');
      else if(k==='_success_message') success=String(v||'Thank you');
      else data[k]=String(v);
    }
    const db=getDb();
    await db.query('INSERT INTO form_submissions(form_name,data_json) VALUES(?,?)',[formName,JSON.stringify(data)]);
    return new NextResponse(`<html><body style="font-family:Arial;padding:40px;text-align:center"><h2>${escapeHtml(success)}</h2><button onclick="history.back()">Back</button></body></html>`,{headers:{'content-type':'text/html; charset=utf-8'}});
  }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
