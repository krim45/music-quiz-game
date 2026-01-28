import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const now = new Date();

  const routes = [
    { path: '', freq: 'daily' as const, pr: 1 },
    { path: '/room/join', freq: 'daily' as const, pr: 0.7 },
    { path: '/room/create', freq: 'daily' as const, pr: 0.7 },
    { path: '/about', freq: 'daily' as const, pr: 0.7 },
  ];

  return routes.map(({ path, freq, pr }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: pr,
  }));
}
