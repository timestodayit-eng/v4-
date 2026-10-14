'use client';
import { useState } from 'react';
export default function LoginPage(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
 async function submit(e){e.preventDefault();setError('');setLoading(true);try{const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const data=await res.json();if(!res.ok){setError(data.error||'Login failed');setLoading(false);return}location.href='/admin'}catch{setError('Unable to sign in');setLoading(false)}}
 return <main className="login-page"><form className="login-box" onSubmit={submit}><h1>Admin Login</h1><p className="muted">Only the admin credentials configured in Hostinger can sign in.</p><label className="label">Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label className="label">Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p className="danger-text">{error}</p>}<button className="btn" style={{width:'100%',marginTop:14}} disabled={loading}>{loading?'Signing in...':'Login'}</button></form></main>;
}
