import Link from 'next/link';
import { CATEGORIES } from '../../lib/categories';
export default function AdminHome(){return <div><div className="topbar"><div><h1>Dashboard</h1><p className="muted">Create unlimited landing pages under fixed category templates.</p></div></div><div className="grid two">{CATEGORIES.map(c=><Link className="card" key={c.key} href={`/admin/pages/${c.key}`}><h3>{c.name}</h3><p className="muted">{c.description}</p><span className="badge">Open category</span></Link>)}</div></div>}
