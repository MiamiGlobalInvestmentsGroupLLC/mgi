
export const metadata = { title: 'MGI × DeepSeek Bot' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', background:'#0b1220', color:'#fff' }}>
        <div style={{maxWidth:960, margin:'0 auto', padding:'24px'}}>
          <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
            <h1 style={{margin:0}}>MGI × DeepSeek</h1>
            <nav style={{display:'flex', gap:16}}>
              <a href="/" style={{color:'#9fd3ff'}}>Chat</a>
              <a href="/dashboard" style={{color:'#9fd3ff'}}>Dashboard</a>
            </nav>
          </header>
          {children}
          <footer style={{marginTop:40, opacity:.65, fontSize:12}}>© MGI – DeepSeek-only. No OpenAI/xAI.</footer>
        </div>
      </body>
    </html>
  );
}
