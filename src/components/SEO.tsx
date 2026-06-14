import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  pathname?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://wica.info'
}

const SITE = {
  name: 'Lê Vĩnh Khang',
  title: 'wica — minimalist developer portfolio',
  description: 'A personal portfolio by Lê Vĩnh Khang. Notes on design, code, and slow living.',
  url: getBaseUrl(),
  twitter: '@williamcachamwri',
}

function getOgImage(pathname: string, title?: string) {
  if (!pathname || pathname === '/') return '/og-image.png'
  if (pathname === '/blog') return '/og/blog.png'
  if (pathname === '/universe') return '/og/universe.png'
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '')
    return `/og/${slug}.png`
  }
  return '/og-image.png'
}

export function SEO({
  title,
  description = SITE.description,
  pathname = '',
  image,
  type = 'website',
  publishedTime,
}: SEOProps) {
  const fullTitle = title ? `${title} · wica` : SITE.title
  const url = `${SITE.url}${pathname}`
  const ogImage = image ? (image.startsWith('http') ? image : `${SITE.url}${image}`) : `${SITE.url}${getOgImage(pathname, title)}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={SITE.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
    </Helmet>
  )
}
