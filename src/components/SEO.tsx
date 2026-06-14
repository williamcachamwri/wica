import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  pathname?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  subtitle?: string
}

const SITE = {
  name: 'Lê Vĩnh Khang',
  title: 'wica — minimalist developer portfolio',
  description: 'A personal portfolio by Lê Vĩnh Khang. Notes on design, code, and slow living.',
  url: 'https://williamcachamwri.github.io/wica',
  twitter: '@williamcachamwri',
}

function buildOgUrl({
  title,
  description,
  subtitle,
  isHome,
}: {
  title: string
  description: string
  subtitle?: string
  isHome?: boolean
}) {
  const params = new URLSearchParams()
  params.set('title', title)
  params.set('description', description)
  if (subtitle) params.set('subtitle', subtitle)
  if (isHome) params.set('home', 'true')
  return `${SITE.url}/api/og?${params.toString()}`
}

export function SEO({
  title,
  description = SITE.description,
  pathname = '',
  image,
  type = 'website',
  publishedTime,
  subtitle,
}: SEOProps) {
  const fullTitle = title ? `${title} · wica` : SITE.title
  const url = `${SITE.url}${pathname}`
  const ogImage =
    image ||
    buildOgUrl({
      title: fullTitle,
      description,
      subtitle,
      isHome: !title,
    })

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
