'use client';
export default function LogoutButton(){
  async function logout(){await fetch('/api/admin/logout',{method:'POST'});location.href='/login';}
  return <button onClick={logout} style={{border:0,textAlign:'left',background:'transparent',color:'#d0d5dd',padding:'11px 13px',cursor:'pointer'}}>Logout</button>;
}
