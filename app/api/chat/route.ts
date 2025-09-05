
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfUTCday } from '@/lib/date';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, model = 'deepseek-chat', temperature = 0.3, companyId, companyName='Default Company' } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, temperature, stream: true, messages }),
  });
  if (!dsRes.ok || !dsRes.body) {
    const txt = await dsRes.text();
    return new Response(JSON.stringify({ error: 'DeepSeek failed', detail: txt }), { status: 500 });
  }

  incrementUsage(companyId, companyName).catch(()=>{});

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

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function incrementUsage(companyId?: string, companyName?: string) {
  if (!process.env.DATABASE_URL) return;
  if (!companyId) return;

  const day = startOfUTCday();
  await prisma.company.upsert({
    where: { id: companyId },
    update: { name: companyName || 'Company' },
    create: { id: companyId, name: companyName || 'Company' },
  });

  const existing = await prisma.usage.findUnique({ where: { companyId_day: { companyId, day } } });
  if (existing) {
    await prisma.usage.update({ where: { companyId_day: { companyId, day } }, data: { count: { increment: 1 } } });
  } else {
    await prisma.usage.create({ data: { companyId, day, count: 1 } });
  }
}
