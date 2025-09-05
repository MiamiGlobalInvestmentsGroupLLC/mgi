'use client';
import { useSearchParams } from 'next/navigation';
import Page from '@/app/page'; // reuse chat UI
export default function EmbedFrame(){
  const sp = useSearchParams(); const cid = sp.get('c')||'';
  // Chat page already reads ?c=... so just render it
  return (<div style={{padding:10}}><Page/></div>);
}
