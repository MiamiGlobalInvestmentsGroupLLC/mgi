export const metadata = { title: 'MGI – Ultra SaaS Bot' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body style={{ fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Cairo, IBM Plex Sans Arabic, Arial', background:'#0b1220', color:'#fff' }}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'24px'}}>
          <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, position:'sticky', top:0, backdropFilter:'saturate(180%) blur(8px)'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:28, height:28, borderRadius:8, background:'#2463eb'}}/>
              <b style={{letterSpacing:.3}}>MGI SaaS Ultra</b>
            </div>
            <nav style={{display:'flex', gap:16}}>
              <a href="/" style={{color:'#a7d4ff'}}>Chat</a>
              <a href="/dashboard" style={{color:'#a7d4ff'}}>Dashboard</a>
              <a href="/login" style={{color:'#a7d4ff'}}>Company</a>
              <a href="/admin/login" style={{color:'#a7d4ff'}}>Admin</a>
            </nav>
          </header>
          {children}
          <footer style={{marginTop:40, opacity:.65, fontSize:12}}>© MGI – Private LLM backend hidden.</footer>
        </div>
      </body>
    </html>
  );
}
