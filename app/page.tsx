
'use client';
import { useState } from 'react';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

export default function Page() {
  const [companyId, setCompanyId] = useState('mgi-demo');
  const [companyName, setCompanyName] = useState('MGI Demo');
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [input, setInput] = useState('مرحبا!');

  async function send() {
    if (!input.trim()) return;

    const history: Msg[] = [...msgs, { role: 'user' as const, content: input }];
    setMsgs(history);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: history, companyId, companyName }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let acc = '';

    setMsgs(m => [...m, { role: 'assistant' as const, content: '' }]);

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      for (const line of chunk.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            acc += delta;
            setMsgs(m => {
              const c = [...m];
              const last = c[c.length - 1];
              if (last && last.role === 'assistant') last.content = acc;
              return c;
            });
          }
        } catch {}
      }
    }
  }

  return (
    <main>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="companyId"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #1f2a44', background: '#0e1730', color: '#cfe7ff' }}
          />
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="company name"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #1f2a44', background: '#0e1730', color: '#cfe7ff', flex: 1 }}
          />
        </div>
        <div style={{ border: '1px solid #1f2a44', borderRadius: 12, padding: 12, minHeight: 260, background: '#0e1730' }}>
          {msgs.filter((m) => m.role !== 'system').map((m, i) => (
            <div key={i} style={{ margin: '8px 0' }}>
              <b style={{ color: '#9fd3ff' }}>{m.role === 'user' ? 'You' : 'Bot'}:</b> {m.content}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك…"
            style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #1f2a44', background: '#0e1730', color: '#cfe7ff' }}
          />
          <button
            onClick={send}
            style={{ padding: '12px 16px', borderRadius: 10, background: '#12b886', color: '#04210f', border: 'none', fontWeight: 700 }}
          >
            إرسال
          </button>
        </div>
        <p style={{ opacity: .7, fontSize: 12 }}>
          ملاحظة: عدّاد الرسائل يتطلّب ضبط <code>DATABASE_URL</code>.
        </p>
      </div>
    </main>
  );
}
