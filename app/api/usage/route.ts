
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'No DATABASE_URL set' }), { headers: { 'Content-Type': 'application/json' } });
  }
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || undefined;
  const usages = await prisma.usage.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { day: 'desc' },
    take: 500,
  });
  const companies = await prisma.company.findMany();
  return new Response(JSON.stringify({ usages, companies }), { headers: { 'Content-Type': 'application/json' } });
}
