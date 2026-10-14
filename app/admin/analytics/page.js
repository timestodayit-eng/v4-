import { getDb } from '../../../lib/db';
export const dynamic='force-dynamic';
export default async function Analytics(){
  const db=getDb();
  const [summary]=await db.query(`SELECT event_name,COUNT(*) total FROM events WHERE created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY event_name`);
  const [pages]=await db.query(`SELECT slug,SUM(event_name='page_view') views,SUM(event_name='call_click') calls FROM events WHERE created_at>=DATE_SUB(NOW(),INTERVAL 30 DAY) GROUP BY slug ORDER BY calls DESC,views DESC LIMIT 100`);
  const map=Object.fromEntries(summary.map(x=>[x.event_name,Number(x.total)]));
  const views=map.page_view||0,calls=map.call_click||0,rate=views?((calls/views)*100).toFixed(2):'0.00';
  return <div><div className="topbar"><div><h1>Analytics</h1><p className="muted">Last 30 days. First-party page views and call clicks.</p></div></div>
  <div className="grid three" style={{marginBottom:18}}><div className="card"><div className="muted">Page Views</div><h2>{views}</h2></div><div className="card"><div className="muted">Call Clicks</div><h2>{calls}</h2></div><div className="card"><div className="muted">Call CTR</div><h2>{rate}%</h2></div></div>
  <div className="card"><h2>Page performance</h2><div className="table-wrap"><table className="table"><thead><tr><th>Page</th><th>Views</th><th>Call Clicks</th><th>Call CTR</th></tr></thead><tbody>{pages.map((p,i)=>{const v=Number(p.views)||0,c=Number(p.calls)||0;return <tr key={i}><td>/p/{p.slug||'-'}</td><td>{v}</td><td>{c}</td><td>{v?((c/v)*100).toFixed(2):'0.00'}%</td></tr>})}</tbody></table></div></div></div>;
}
