
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // prisma needs node runtime

export async function GET(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'No DATABASE_URL set' }), { status: 200 });
  }
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || undefined;
  const range = Number(searchParams.get('days') || 30);

  const whereCompany = companyId ? { companyId } : {};
  const usages = await prisma.usage.findMany({
    where: whereCompany,
    orderBy: { day: 'desc' },
    take: 500
  });
  const companies = await prisma.company.findMany();

  return new Response(JSON.stringify({ usages, companies }), { headers: { 'Content-Type': 'application/json' } });
}
