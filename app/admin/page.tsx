'use client';
import { useEffect, useState } from 'react';
type Company = { id:string; name:string; email?:string; botName?:string; themePrimary?:string; logoUrl?:string; systemPrompt?:string; defaultLang?:string; isPaused?:boolean; dailyLimit?:number|null; monthlyLimit?:number|null; watermarkEnabled?:boolean; watermarkUrl?:string|null; plan?:string|null };
export default function Admin(){
  const [list,setList]=useState<Company[]>([]);
  const [creating,setCreating]=useState(false);
  const [newC,setNewC]=useState({id:'',name:'',email:'',password:''});
  async function load(){ const r=await fetch('/api/admin/companies'); if(r.ok){ const j=await r.json(); setList(j.items||[]); } else { alert('Not authorized'); window.location.href='/admin/login'; } }
  useEffect(()=>{ load(); },[]);
  async function togglePause(id:string){ const r=await fetch('/api/admin/companies',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, action:'togglePause' })}); if(r.ok) load(); }
  async function setLimits(id:string,daily:number,monthly:number){ const r=await fetch('/api/admin/companies',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, action:'limits', daily, monthly })}); if(r.ok) load(); }
  async function setWatermark(id:string,enabled:boolean){ const r=await fetch('/api/admin/companies',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, action:'watermark', enabled })}); if(r.ok) load(); }
  async function create(){ setCreating(true); const r=await fetch('/api/admin/create-company',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newC)}); setCreating(false); if(r.ok) { load(); alert('Created ✅'); } else alert('Failed'); }
  return (<main>
    <h2>Admin – Companies</h2>
    <section style={{padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
      <h3>Create Company</h3>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <input placeholder="companyId" value={newC.id} onChange={e=>setNewC({...newC,id:e.target.value})} style={{padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <input placeholder="name" value={newC.name} onChange={e=>setNewC({...newC,name:e.target.value})} style={{padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <input placeholder="email" value={newC.email} onChange={e=>setNewC({...newC,email:e.target.value})} style={{padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <input placeholder="password" value={newC.password} onChange={e=>setNewC({...newC,password:e.target.value})} style={{padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <button disabled={creating} onClick={create} style={{padding:'8px 12px', borderRadius:10, background:'#2463eb', color:'#041027', border:'none'}}>{creating?'Creating…':'Create'}</button>
      </div>
    </section>
    <div style={{height:16}}/>
    <section style={{display:'grid', gap:12}}>
      {list.map(c=>(<div key={c.id} style={{padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:22, height:22, background:c.themePrimary||'#2463eb', borderRadius:5}}/>
            <div><b>{c.name}</b> <span style={{opacity:.7}}>({c.id})</span></div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <span>Status: <b>{c.isPaused?'Paused':'Active'}</b></span>
            <button onClick={()=>togglePause(c.id)} style={{padding:'6px 10px', borderRadius:8, border:'1px solid #1f2a44', background:'#14213a', color:'#cfe7ff'}}>{c.isPaused?'Resume':'Pause'}</button>
            <span>Daily:</span><input id={'d'+c.id} defaultValue={String(c.dailyLimit||0)} style={{width:80, padding:6, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
            <span>Monthly:</span><input id={'m'+c.id} defaultValue={String(c.monthlyLimit||0)} style={{width:80, padding:6, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
            <button onClick={()=>setLimits(c.id, Number((document.getElementById('d'+c.id) as HTMLInputElement).value), Number((document.getElementById('m'+c.id) as HTMLInputElement).value))} style={{padding:'6px 10px', borderRadius:8, background:'#2463eb', color:'#041027', border:'none'}}>Save limits</button>
            <label style={{display:'flex', gap:6, alignItems:'center'}}>
              <input type="checkbox" defaultChecked={!!c.watermarkEnabled} onChange={(e)=>setWatermark(c.id, e.target.checked)} /> Watermark
            </label>
          </div>
        </div>
      </div>))}
      {!list.length && <div>No companies yet.</div>}
    </section>
  </main>);
}