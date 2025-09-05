// app/embed/frame/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Search = { c?: string };

export default function EmbedFramePage({ searchParams }: { searchParams: Search }) {
  const companyId = searchParams?.c ?? '';

  return (
    <html lang="ar" dir="auto">
      <body
        style={{
          margin: 0,
          background: '#0b1220',
          color: '#cfe7ff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", "Helvetica Neue", Arial'
        }}
      >
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100vh' }}>
          <header style={{ padding: '10px 14px', borderBottom: '1px solid #1f2a44' }}>
            <strong style={{ color: '#9fd3ff' }}>MGI Assistant</strong>
            <span style={{ opacity: 0.7, marginInlineStart: 8 }}>
              Company: {companyId || '—'}
            </span>
          </header>

          <main style={{ padding: 12 }}>
            <iframe
              title="chat"
              src={`/${''}?companyId=${encodeURIComponent(companyId)}`}
              style={{
                width: '100%',
                height: '70vh',
                border: '1px solid #1f2a44',
                borderRadius: 12,
                background: '#0e1730'
              }}
            />
          </main>
        </div>
      </body>
    </html>
  );
}
