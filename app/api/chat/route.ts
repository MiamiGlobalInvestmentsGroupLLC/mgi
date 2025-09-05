import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfUTCday } from '@/lib/date';
import { extractKeywords } from '@/lib/text';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, model = 'deepseek-chat', temperature = 0.4 } = body || {};
  let { companyId } = body || {};

  const cookieCompanyId = req.cookies.get('companyId')?.value;
  if (!companyId && cookieCompanyId) companyId = cookieCompanyId;
  if (!companyId) return new Response(JSON.stringify({ error:'NO_COMPANY' }), { status: 400 });

  const comp = await prisma.company.findUnique({ where: { id: companyId } });
  if (!comp) return new Response(JSON.stringify({ error:'NO_COMPANY' }), { status: 404 });
  if (comp.isPaused) return new Response(JSON.stringify({ error:'PAUSED' }), { status: 429 });

  // Usage enforcement
  const today = startOfUTCday();
  const todayUsage = await prisma.usage.findUnique({ where: { companyId_day: { companyId, day: today } } });
  if (comp.dailyLimit && (todayUsage?.count || 0) >= comp.dailyLimit) {
    return new Response(JSON.stringify({ error:'DAILY_LIMIT' }), { status: 429 });
  }
  // monthly limit (sum of last 31 days)
  if (comp.monthlyLimit) {
    const monthAgo = new Date(Date.now() - 31*24*3600*1000);
    const monthly = await prisma.usage.findMany({ where: { companyId, day: { gte: monthAgo } } });
    const total = monthly.reduce((s,u)=> s + (u.count||0), 0);
    if (total >= comp.monthlyLimit) return new Response(JSON.stringify({ error:'MONTHLY_LIMIT' }), { status: 429 });
  }

  // Compose system prompt
  let sysMsg = comp.systemPrompt || 'You are the company assistant. Be concise and friendly. Use tasteful emojis when helpful. Do not mention the model provider.';

  // Retrieve contextual docs (naive keyword match)
  let context = '';
  if (Array.isArray(messages) && messages.length) {
    const last = messages.filter((m:any)=>m.role==='user').slice(-1)[0]?.content || '';
    const keys = extractKeywords(last);
    if (keys.length) {
      const docs = await prisma.document.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 60 });
      const scored = docs.map(d=>({ d, score: keys.reduce((s,k)=> s + (d.text.toLowerCase().includes(k)?1:0), 0) }))
                         .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
      if (scored.length) context = scored.map(x=>`- ${x.d.title}: ${x.d.text.slice(0,700)}`).join('\n');
    }
  }

  const userMsgs = Array.isArray(messages) ? messages.filter((m:any)=>m.role!=='system') : [];
  const finalMessages:any[] = [{ role:'system', content: sysMsg }];
  if (context) finalMessages.push({ role:'system', content: 'Reference info:\n'+context });
  finalMessages.push(...userMsgs);

  const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature, stream: true, messages: finalMessages }),
  });
  if (!dsRes.ok || !dsRes.body) {
    const txt = await dsRes.text();
    return new Response(JSON.stringify({ error: 'LLM failed', detail: txt }), { status: 500 });
  }

  // increment usage
  await incrementUsage(companyId);

  const readable = new ReadableStream({
    async start(controller) {
      const reader = dsRes.body!.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new Response(readable, { headers: {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  }});
}

async function incrementUsage(companyId: string) {
  if (!process.env.DATABASE_URL) return;
  const day = startOfUTCday();
  const existing = await prisma.usage.findUnique({ where: { companyId_day: { companyId, day } } });
  if (existing) await prisma.usage.update({ where: { companyId_day: { companyId, day } }, data: { count: { increment: 1 } } });
  else await prisma.usage.create({ data: { companyId, day, count: 1 } });
}
