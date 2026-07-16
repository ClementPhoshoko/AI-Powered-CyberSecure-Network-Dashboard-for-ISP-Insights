import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AkovoLabs';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://akovolabs.co.za';

function Seo({ title, description, path, image }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${BASE_URL}${path || ''}`;
  const ogImage = image || '/favicon.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'AI-powered network dashboard for ISP insights and speed testing.'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || ''} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

export default Seo;
