'use client';
import { useEffect, useRef, useState } from 'react';
type Msg = { role:'user'|'assistant'|'system'; content:string };
type CompanyPublic = { id:string; name:string; botName?:string|null; themePrimary?:string|null; suggested?:string[]|null; logoUrl?:string|null; watermarkEnabled?:boolean|null; watermarkUrl?:string|null; defaultLang?:string|null };

export default function Page(){
  const [companyId, setCompanyId] = useState('');
  const [company, setCompany] = useState<CompanyPublic|null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([{role:'system', content:'You are a helpful assistant.'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const url = new URL(window.location.href);
    const c = url.searchParams.get('c'); if (c) setCompanyId(c);
  },[]);

  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/company/get'+(companyId?('?companyId='+encodeURIComponent(companyId)) : ''));
    if(r.ok){ const data = await r.json(); if(data?.company) setCompany(data.company); }
  })(); },[companyId]);

  useEffect(()=>{ viewRef.current?.scrollTo(0, viewRef.current.scrollHeight); },[msgs]);

  const primary = company?.themePrimary || '#2463eb';
  const botName = company?.botName || 'Assistant';
  const rtl = (company?.defaultLang || 'ar') === 'ar';

  async function send(text?:string){
    const content = (text ?? input).trim();
    if (!content) return;
    const history: Msg[] = [...msgs, { role:'user' as const, content }];
    setMsgs(history); setInput(''); setLoading(true);
    const res = await fetch('/api/chat', { method:'POST', body: JSON.stringify({ messages: history, companyId }) });
    if (!res.ok){ setMsgs(m=>[...m, {role:'assistant', content:'عذرًا، تم تجاوز الحد اليومي أو أن البوت متوقف مؤقتًا. ⚠️'}]); setLoading(false); return; }
    const reader = res.body?.getReader(); const decoder = new TextDecoder(); let acc='';
    setMsgs(m=>[...m,{role:'assistant' as const, content:''}]);
    while(true){ const {value,done}=await reader!.read(); if(done) break;
      const chunk = decoder.decode(value, {stream:true});
      for(const line of chunk.split('\n')){
        const trimmed=line.trim(); if(!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, ''); if(payload==='[DONE]') continue;
        try{ const json = JSON.parse(payload); const delta = json.choices?.[0]?.delta?.content ?? ''; if(delta){ acc+=delta; setMsgs(m=>{ const c=[...m]; const last=c[c.length-1]; if(last&&last.role==='assistant') last.content=acc; return c; }); } }catch{}
      }
    }
    setLoading(false);
  }

  return (
    <main dir={rtl?'rtl':'ltr'}>
      <div style={{display:'grid', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {company?.logoUrl ? <img src={company.logoUrl} alt="logo" style={{width:36, height:36, borderRadius:8}}/> : <div style={{width:36, height:36, borderRadius:8, background:primary}}/>}
          <h2 style={{margin:0}}>{botName}</h2>
        </div>

        {company?.suggested && (company.suggested as string[]).length>0 && (
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
            {(company.suggested as string[]).slice(0,6).map((q,i)=>(
              <button key={i} onClick={()=>send(q)} style={{padding:'8px 12px', borderRadius:999, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff', cursor:'pointer'}}>{q}</button>
            ))}
          </div>
        )}

        <div ref={viewRef} style={{border:'1px solid #1f2a44', borderRadius:16, padding:12, minHeight:300, maxHeight:560, overflow:'auto', background:'linear-gradient(180deg,#0d1630,#0b1220)'}}>
          {msgs.filter(m=>m.role!=='system').map((m,i)=>{
            const isUser = m.role==='user';
            return (
              <div key={i} style={{display:'flex', justifyContent:isUser?'flex-end':'flex-start', margin:'8px 0'}}>
                <div style={{maxWidth:'80%', padding:'12px 14px', borderRadius:16, whiteSpace:'pre-wrap', lineHeight:1.7, background:isUser?primary:'rgba(255,255,255,0.06)', color:isUser?'#051430':'#dbeaff', border:isUser?'none':'1px solid #1f2a44', boxShadow:isUser?'0 6px 18px rgba(36,99,235,.25)':'inset 0 0 0 1px rgba(255,255,255,.03)'}}>
                  {m.content}
                </div>
              </div>
            );
          })}
          {loading && <div style={{opacity:.7}}>يكتب الآن… ⌛</div>}
        </div>

        <div style={{display:'flex', gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder={rtl?'اكتب رسالتك… 🙂':'Type your message… 🙂'} style={{flex:1, padding:14, borderRadius:12, border:'1px solid #1f2a44', background:'#0e1730', color:'#cfe7ff', boxShadow:'0 2px 10px rgba(0,0,0,.2)'}}/>
          <button onClick={()=>send()} style={{padding:'12px 16px', borderRadius:12, background:primary, color:'#041027', border:'none', fontWeight:700}}>Send 🚀</button>
        </div>

        {company?.watermarkEnabled ? (
          <div style={{opacity:.5, fontSize:12, textAlign:'center'}}>Powered by <a href={company.watermarkUrl||'https://miamiglobalgroup.com'} style={{color:'#9fd3ff'}}>MGI</a></div>
        ) : null}
      </div>
    </main>
  );
}
