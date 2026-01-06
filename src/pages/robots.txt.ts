import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL, siteURL: URL) => `# Evolution YGO Robots.txt
# https://evolutionygo.com

# Allow all search engine crawlers
User-agent: *
Allow: /

# Block access to authentication pages (not useful for search)
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Block API endpoints if any are exposed
Disallow: /api/

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Google specific - allow Google to crawl everything public
User-agent: Googlebot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Bing specific
User-agent: Bingbot
Allow: /
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Crawl-delay: 1

# Google Images
User-agent: Googlebot-Image
Allow: /banners/
Allow: /icons/
Allow: /img/
Allow: /logo.svg

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

# Sitemap location
Sitemap: ${sitemapURL.href}

# Host
Host: ${siteURL.host}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  const siteURL = new URL(site || 'https://evolutionygo.com');
  return new Response(getRobotsTxt(sitemapURL, siteURL), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};