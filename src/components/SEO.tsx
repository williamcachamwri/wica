import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  pathname?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
}

const SITE = {
  name: 'Lê Vĩnh Khang',
  title: 'wica — minimalist developer portfolio',
  description: 'A personal portfolio by Lê Vĩnh Khang. Notes on design, code, and slow living.',
  url: 'https://williamcachamwri.github.io/wica',
  twitter: '@williamcachamwri',
}

export function SEO({
  title,
  description = SITE.description,
  pathname = '',
  image = '/og-image.png',
  type = 'website',
  publishedTime,
}: SEOProps) {
  const fullTitle = title ? `${title} · wica` : SITE.title
  const url = `${SITE.url}${pathname}`
  const ogImage = image.startsWith('http') ? image : `${SITE.url}${image}`

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
