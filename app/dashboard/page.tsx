'use client';
import { useEffect, useState } from 'react';
type Company = { id:string; name:string; email?:string; botName?:string; themePrimary?:string; logoUrl?:string; systemPrompt?:string; suggested?:string[]; defaultLang?:string; dailyLimit?:number|null; monthlyLimit?:number|null; isPaused?:boolean|null; watermarkEnabled?:boolean|null; watermarkUrl?:string|null };
type Usage = { companyId: string; day: string; count: number };
type Doc = { id:string; title:string; source:string; url?:string };

export default function Dashboard(){
  const [company, setCompany] = useState<Company|null>(null);
  const [tab, setTab] = useState<'overview'|'appearance'|'content'|'suggested'|'usage'|'security'>('overview');
  const [usages, setUsages] = useState<Usage[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async()=>{
    const me = await fetch('/api/me').then(r=>r.json()).catch(()=>({company:null}));
    if (!me.company) return; setCompany(me.company);
    await refreshUsage(); await refreshDocs();
  })(); },[]);

  async function refreshUsage(){ const data = await fetch('/api/usage').then(r=>r.json()).catch(()=>({usages:[]})); if (!data.error) setUsages(data.usages||[]); }
  async function refreshDocs(){ const data = await fetch('/api/content/list').then(r=>r.json()).catch(()=>({docs:[]})); if (!data.error) setDocs(data.docs||[]); }

  async function saveAppearance(e:any){ e.preventDefault(); if(!company) return; setSaving(true);
    const f=new FormData(e.currentTarget);
    const res= await fetch('/api/company/update',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      botName:String(f.get('botName')||''), themePrimary:String(f.get('themePrimary')||''), logoUrl:String(f.get('logoUrl')||''), systemPrompt:String(f.get('systemPrompt')||''), defaultLang:String(f.get('defaultLang')||'ar')
    })}); setSaving(false); alert(res.ok?'تم الحفظ ✅':'فشل الحفظ');
  }
  async function saveSuggested(e:any){ e.preventDefault(); const f=new FormData(e.currentTarget); const arr:string[]=[]; for(let i=1;i<=6;i++){ const v=String(f.get('q'+i)||'').trim(); if(v) arr.push(v);} const r=await fetch('/api/suggested/update',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ suggested: arr })}); alert(r.ok?'تم الحفظ ✅':'فشل'); }

  async function uploadFiles(e:any){ e.preventDefault(); const f=new FormData(e.currentTarget); const r=await fetch('/api/content/upload',{method:'POST', body:f}); if(r.ok){ alert('تم الرفع ✅'); refreshDocs(); } else alert('فشل الرفع'); }
  async function addUrl(e:any){ e.preventDefault(); const f=new FormData(e.currentTarget); const r= await fetch('/api/content/add-url',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url:String(f.get('url')||'') })}); if(r.ok){ alert('تمت الإضافة ✅'); refreshDocs(); } else alert('تعذر جلب الرابط'); }
  async function delDoc(id:string){ if(!confirm('حذف هذا المحتوى؟')) return; const r= await fetch('/api/content/delete',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id })}); if(r.ok) refreshDocs(); }

  async function togglePause(){ const r=await fetch('/api/company/toggle-pause',{method:'POST'}); if(r.ok){ const j=await r.json(); setCompany((c)=>({...c!, isPaused:j.isPaused})); } }
  async function saveLimits(e:any){ e.preventDefault(); const f=new FormData(e.currentTarget); const daily = Number(String(f.get('daily')||'0'))||0; const monthly = Number(String(f.get('monthly')||'0'))||0; const r= await fetch('/api/company/limits',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ daily, monthly })}); alert(r.ok?'تم الحفظ ✅':'فشل'); }

  async function changePassword(e:any){ e.preventDefault(); const f=new FormData(e.currentTarget); const current=String(f.get('current')||''); const next=String(f.get('next')||''); const r= await fetch('/api/company/change-password',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ current, next })}); alert(r.ok?'تم التغيير ✅':'فشل'); }

  const primary = company?.themePrimary || '#2463eb';
  if (!company) return (<main><div style={{padding:12, background:'#271b00', border:'1px solid #3a2a00', borderRadius:8}}>تحتاج لتسجيل الدخول.</div><a href="/login" style={{color:'#9fd3ff'}}>تسجيل الدخول</a></main>);

  return (
    <main>
      <h2>لوحة {company.name}</h2>
      <div style={{display:'flex', gap:8, margin:'12px 0', flexWrap:'wrap'}}>
        {(['overview','appearance','content','suggested','usage','security'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 12px', borderRadius:10, border:'1px solid #1f2a44', background:tab===t?primary:'#0e1730', color:tab===t?'#041027':'#cfe7ff'}}>
            {t==='overview'?'Overview':t==='appearance'?'Appearance':t==='content'?'Content':t==='suggested'?'Suggested':t==='usage'?'Usage':'Security'}
          </button>
        ))}
        <form action="/api/logout" method="post" style={{marginRight:'auto'}}><button style={{padding:'8px 12px', borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}>تسجيل الخروج</button></form>
      </div>

      {tab==='overview' && (<section style={{display:'grid', gap:12}}>
        <div style={{padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>Manage your company bot, content, and limits. 💼🤖</div>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          <div style={{flex:'1 1 280px', padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
            <div>Bot name:</div><div style={{fontWeight:700, fontSize:20}}>{company.botName || 'Assistant'}</div>
          </div>
          <div style={{flex:'1 1 280px', padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
            <div>Primary color:</div><div style={{width:36, height:20, background:primary, borderRadius:4}}/>
          </div>
          <div style={{flex:'1 1 280px', padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
            <div>Status:</div><div style={{fontWeight:700}}>{company.isPaused?'Paused ⏸️':'Active ▶️'}</div>
            <button onClick={togglePause} style={{marginTop:8, padding:'6px 10px', borderRadius:8, border:'1px solid #1f2a44', background:'#14213a', color:'#cfe7ff'}}>{company.isPaused?'Resume':'Pause'}</button>
          </div>
        </div>
      </section>)}

      {tab==='appearance' && (<form onSubmit={saveAppearance} style={{display:'grid', gap:12}}>
        <label>Bot name</label><input name="botName" defaultValue={company.botName||''} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <label>Primary color</label><input name="themePrimary" type="color" defaultValue={company.themePrimary||'#2463eb'}/>
        <label>Logo URL</label><input name="logoUrl" defaultValue={company.logoUrl||''} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
        <label>Default language</label><select name="defaultLang" defaultValue={company.defaultLang||'ar'} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}><option value="ar">العربية</option><option value="en">English</option></select>
        <label>System prompt</label><textarea name="systemPrompt" defaultValue={company.systemPrompt||'You are the company assistant. Be helpful, concise, and friendly. Use emojis lightly.'} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff', minHeight:120}}/>
        <button disabled={saving} style={{padding:'10px 14px', borderRadius:12, background:primary, color:'#041027', border:'none', fontWeight:700}}>{saving?'Saving…':'Save'}</button>
      </form>)}

      {tab==='content' && (<section style={{display:'grid', gap:16}}>
        <form onSubmit={uploadFiles} style={{display:'grid', gap:8}}>
          <label>Upload files (.txt .md .csv .json)</label><input name="files" type="file" multiple />
          <button style={{padding:'8px 12px', borderRadius:10, background:primary, color:'#041027', border:'none'}}>Upload</button>
        </form>
        <form onSubmit={addUrl} style={{display:'grid', gap:8}}>
          <label>Add URL source</label><input name="url" placeholder="https://example.com/article" style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
          <button style={{padding:'8px 12px', borderRadius:10, background:primary, color:'#041027', border:'none'}}>Add</button>
        </form>
        <div><h3>Content</h3><div style={{display:'grid', gap:8}}>
          {docs.map(d=> (<div key={d.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, border:'1px solid #1f2a44', borderRadius:10, background:'#0e1730'}}>
            <div><div style={{fontWeight:700}}>{d.title}</div><div style={{opacity:.7, fontSize:12}}>{d.source}{d.url?(' · '+d.url):''}</div></div>
            <button onClick={()=>delDoc(d.id)} style={{padding:'6px 10px', borderRadius:8, border:'1px solid #432', background:'#2a0e0e', color:'#ffb3b3'}}>Delete</button>
          </div>))}
          {!docs.length && <div>No content yet.</div>}
        </div></div>
        <div style={{marginTop:16, padding:12, border:'1px solid #1f2a44', borderRadius:10, background:'#0e1730'}}>
          <div style={{fontWeight:700, marginBottom:8}}>Embed widget</div>
          <div style={{fontSize:13}}>ضع هذا السكربت في موقعك:</div>
          <pre style={{whiteSpace:'pre-wrap', background:'#0b132a', padding:10, borderRadius:8, border:'1px solid #1f2a44'}}>{`<script src="${location.origin}/embed/widget.js?companyId=${company.id}" async></script>`}</pre>
        </div>
      </section>)}

      {tab==='suggested' && (<form onSubmit={saveSuggested} style={{display:'grid', gap:8}}>
        <div style={{opacity:.8}}>Add up to 6 quick questions:</div>
        {Array.from({length:6}).map((_,i)=> <input key={i} name={'q'+(i+1)} defaultValue={(company.suggested||[])[i]||''} placeholder={'Question '+(i+1)} style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>)}
        <button style={{padding:'8px 12px', borderRadius:10, background:primary, color:'#041027', border:'none'}}>Save</button>
      </form>)}

      {tab==='usage' && (<section><h3>Daily usage</h3>
        <div style={{display:'grid', gap:8}}>
          {usages.map(u=> (<div key={u.day} style={{display:'flex', justifyContent:'space-between', padding:12, border:'1px solid #1f2a44', borderRadius:12, background:'#0e1730'}}>
            <div>{new Date(u.day).toISOString().slice(0,10)}</div><div style={{fontWeight:700}}>{u.count}</div>
          </div>))}
          {!usages.length && <div>No data yet.</div>}
        </div>
        <form onSubmit={saveLimits} style={{marginTop:16, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          <label>Daily limit</label><input name="daily" type="number" defaultValue={company.dailyLimit||500} style={{width:120, padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
          <label>Monthly limit</label><input name="monthly" type="number" defaultValue={company.monthlyLimit||5000} style={{width:120, padding:8, borderRadius:8, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
          <button style={{padding:'8px 12px', borderRadius:10, background:primary, color:'#041027', border:'none'}}>Save limits</button>
        </form>
      </section>)}

      {tab==='security' && (<section style={{display:'grid', gap:12}}>
        <h3>Security</h3>
        <form onSubmit={changePassword} style={{display:'grid', gap:8, maxWidth:420}}>
          <input name="current" type="password" placeholder="Current password" style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
          <input name="next" type="password" placeholder="New password" style={{padding:10, borderRadius:10, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff'}}/>
          <button style={{padding:'8px 12px', borderRadius:10, background:primary, color:'#041027', border:'none'}}>Change password</button>
        </form>
      </section>)}
    </main>
  );
}
