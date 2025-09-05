'use client';
import { useState } from 'react';
export default function AdminLogin(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  async function go(){ const r=await fetch('/api/admin/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})}); if(r.ok) window.location.href='/admin'; else alert('Invalid admin credentials'); }
  return (<main style={{maxWidth:420, margin:'0 auto'}}><h2>Admin Login</h2>
    <div style={{display:'grid', gap:8}}>
      <input placeholder="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
      <input type="password" placeholder="Admin Password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
      <button onClick={go} style={{padding:'10px 14px', borderRadius:12, background:'#2463eb', color:'#041027', border:'none', fontWeight:700}}>Sign in</button>
    </div></main>);
}