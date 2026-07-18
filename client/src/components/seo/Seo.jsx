import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AkovoLabs Speedtest';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://speedtest.akovolabs.co.za';
const DEFAULT_DESCRIPTION = 'AI-powered internet speed test and network analytics dashboard. Measure download, upload, latency, and jitter with detailed ISP insights.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`;

function Seo({ title, description, path, image, type = 'website' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageUrl = `${SITE_URL}${path || ''}`;
  const ogImage = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_OG_IMAGE;
  const desc = description || DEFAULT_DESCRIPTION;

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AkovoLabs',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    sameAs: []
  };

  const webpageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description: desc,
    url: pageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'AkovoLabs',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE
      }
    }
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webpageJsonLd)}
      </script>
    </Helmet>
  );
}

export default Seo;
