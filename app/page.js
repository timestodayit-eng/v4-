import Link from 'next/link';
export default function Home(){
  return <main style={{maxWidth:800,margin:'80px auto',padding:24,textAlign:'center'}}>
    <h1>Landing CMS Pro</h1><p className="muted">Your landing-page management system is running.</p>
    <div className="row" style={{justifyContent:'center',marginTop:20}}><Link className="btn" href="/admin">Open Admin</Link></div>
  </main>;
}
