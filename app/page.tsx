async function send() {
  if (!input.trim()) return;

  // جهّز التاريخ محليًا وبعدين حدّث الحالة
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
