export const runtime='nodejs';
export async function GET(req:Request){
  const { searchParams, origin } = new URL(req.url);
  const companyId = searchParams.get('companyId')||'';
  const base = origin; // Use app origin to load iframe from our deployment
  const js = `(function(){ var s=document.createElement('style'); s.textContent='@keyframes mgiPop{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}} .mgi-btn{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:28px;background:#2463eb;color:#041027;font-weight:700;box-shadow:0 12px 30px rgba(36,99,235,.35);border:none;cursor:pointer;z-index:999999} .mgi-frame{position:fixed;bottom:88px;right:20px;width:400px;height:560px;border:1px solid #1f2a44;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.4);animation:mgiPop .2s ease-out; background:#0b1220; z-index:999999} @media(max-width:640px){ .mgi-frame{width:95vw;height:80vh;right:2.5vw} }'; document.head.appendChild(s); var btn=document.createElement('button'); btn.className='mgi-btn'; btn.innerHTML='💬'; document.body.appendChild(btn); var frame=null; btn.onclick=function(){ if(frame){ document.body.removeChild(frame); frame=null; return; } frame=document.createElement('iframe'); frame.className='mgi-frame'; frame.src='${base}/embed/frame?c='+encodeURIComponent('${companyId}'); document.body.appendChild(frame); }; })();`;
  return new Response(js, { headers: { 'Content-Type':'application/javascript', 'Cache-Control':'public, max-age=300' } });
}
