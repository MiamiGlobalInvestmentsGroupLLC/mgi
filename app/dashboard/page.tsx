
'use client';
import { useEffect, useState } from 'react';
type Company = { id: string; name: string };
type Usage = { companyId: string; day: string; count: number };

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usages, setUsages] = useState<Usage[]>([]);

  useEffect(() => {
    fetch('/api/usage').then(r=>r.json()).then(data=>{
      if (data.error) { setCompanies([]); setUsages([]); }
      else { setCompanies(data.companies || []); setUsages(data.usages || []); }
    });
  }, []);

  const totals = companies.map(c => ({
    company: c,
    total: usages.filter(u=>u.companyId===c.id).reduce((a,b)=>a+(b.count||0),0)
  })).sort((a,b)=>b.total-a.total);

  return (
    <main>
      <h2>لوحة التحكّم – عدّاد الرسائل</h2>
      {!companies.length ? (
        <div style={{padding:12, background:'#271b00', border:'1px solid #3a2a00', borderRadius:8}}>
          لم يتم إعداد قاعدة البيانات بعد. أضف متغيّر <code>DATABASE_URL</code> في Vercel.
        </div>
      ) : (
        <div style={{display:'grid', gap:12}}>
          {totals.map(({company, total})=>(
            <div key={company.id} style={{display:'flex', justifyContent:'space-between', padding:12, border:'1px solid #1f2a44', borderRadius:10, background:'#0e1730'}}>
              <div>
                <div style={{fontWeight:700}}>{company.name}</div>
                <div style={{opacity:.7, fontSize:12}}>{company.id}</div>
              </div>
              <div style={{fontSize:24, fontWeight:800}}>{total}</div>
            </div>
          ))}
          {!totals.length && <div>لا توجد بيانات بعد.</div>}
        </div>
      )}
    </main>
  );
}
