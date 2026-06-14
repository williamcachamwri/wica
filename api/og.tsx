import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const SITE = {
  name: 'Lê Vĩnh Khang',
  url: 'https://williamcachamwri.github.io/wica',
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'wica'
  const description = searchParams.get('description') || 'A personal portfolio by Lê Vĩnh Khang'
  const subtitle = searchParams.get('subtitle') || 'built with patience · styled with restraint'
  const isHome = searchParams.get('home') === 'true'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#07070a',
          color: '#f4f4f5',
          padding: '64px',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            lvk
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#f4f4f5' }}>wica</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
          <div
            style={{
              fontSize: isHome ? '72px' : '56px',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
              color: '#f4f4f5',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '26px',
              lineHeight: 1.45,
              color: '#a1a1aa',
            }}
          >
            {description}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: '32px',
                fontSize: '18px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#2563eb',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '18px',
            color: '#71717a',
            borderTop: '1px solid #27272a',
            paddingTop: '32px',
          }}
        >
          <span>{SITE.name}</span>
          <span>{SITE.url.replace('https://', '')}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.woff2'
          ).then((res) => res.arrayBuffer()),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: await fetch(
            'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.woff2'
          ).then((res) => res.arrayBuffer()),
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}
