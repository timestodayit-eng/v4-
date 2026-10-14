import { redirect } from 'next/navigation';
import { getAdminSession } from '../../lib/admin-auth';
import AdminShell from '../../components/AdminShell';
export const dynamic='force-dynamic';
export default function AdminLayout({children}){if(!getAdminSession())redirect('/login');return <AdminShell>{children}</AdminShell>}
