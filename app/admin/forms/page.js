import { getDb } from '../../../lib/db';
export const dynamic='force-dynamic';
export default async function Forms(){
  const db=getDb(); const [rows]=await db.query('SELECT id,form_name,data_json,created_at FROM form_submissions ORDER BY id DESC LIMIT 200');
  return <div><div className="topbar"><div><h1>Form Submissions</h1><p className="muted">Create forms directly from the visual builder using the Form element.</p></div></div><div className="grid">{rows.length===0&&<div className="card">No submissions yet.</div>}{rows.map(r=><div className="card" key={r.id}><div className="row"><strong>{r.form_name}</strong><span className="badge">#{r.id}</span></div><div className="muted small">{String(r.created_at)}</div><pre style={{whiteSpace:'pre-wrap',marginBottom:0}}>{JSON.stringify(JSON.parse(r.data_json||'{}'),null,2)}</pre></div>)}</div></div>;
}
