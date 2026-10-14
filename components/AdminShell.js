import Link from 'next/link';
import { CATEGORIES } from '../lib/categories';
import LogoutButton from './LogoutButton';
export default function AdminShell({children}){
  return <div className="shell"><aside className="sidebar"><div className="brand">Landing CMS Pro v4 Complete</div><nav className="nav">
    <Link href="/admin">Dashboard</Link>
    <Link href="/admin/analytics">Analytics</Link>
    <div className="nav-label">Page categories</div>
    {CATEGORIES.map(c=><Link key={c.key} href={`/admin/pages/${c.key}`}>{c.name}</Link>)}
    <div className="nav-label">Master templates</div>
    {CATEGORIES.map(c=><Link key={c.key} href={`/admin/templates/${c.key}`}>{c.name}</Link>)}
    <div className="nav-label">System</div><Link href="/admin/settings">Header / Footer / Tracking</Link><Link href="/admin/forms">Form Submissions</Link><LogoutButton />
  </nav></aside><main className="admin-main">{children}</main></div>;
}
