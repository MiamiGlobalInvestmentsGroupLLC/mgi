'use client';
import { useState } from 'react';
export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [phase,setPhase]=useState<'creds'|'otp'>('creds');
  const [otp,setOtp]=useState('');
  async function start(){ const r=await fetch('/api/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})}); const j=await r.json(); if(!r.ok){ alert(j?.error||'Login failed'); return; } if(j.otp){ setPhase('otp'); } else { window.location.href='/dashboard'; } }
  async function verify(){ const r=await fetch('/api/login/verify',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, otp})}); if(r.ok) window.location.href='/dashboard'; else alert('Invalid OTP'); }
  return (<main style={{maxWidth:420, margin:'0 auto'}}>
    <h2>Company Login</h2>
    {phase==='creds' ? (<div style={{display:'grid', gap:8}}>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
      <button onClick={start} style={{padding:'10px 14px', borderRadius:12, background:'#12b886', color:'#04210f', border:'none', fontWeight:700}}>Continue</button>
    </div>) : (
    <div style={{display:'grid', gap:8}}>
      <div>We sent a verification code to your email.</div>
      <input placeholder="OTP Code" value={otp} onChange={e=>setOtp(e.target.value)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
      <button onClick={verify} style={{padding:'10px 14px', borderRadius:12, background:'#12b886', color:'#04210f', border:'none', fontWeight:700}}>Verify</button>
    </div>)}
  </main>);
}