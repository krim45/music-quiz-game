import { fetchPlaylistsServer } from '@/services/playlists/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const now = new Date();

  // 1. 고정된 정적 페이지
  const staticRoutesConfig = [
    { path: '', freq: 'daily' as const, pr: 1 },
    { path: '/room/join', freq: 'daily' as const, pr: 0.8 },
    { path: '/room/new', freq: 'daily' as const, pr: 0.8 },
    { path: '/playlists', freq: 'daily' as const, pr: 0.9 },
    { path: '/playlists/new', freq: 'monthly' as const, pr: 0.7 },
    { path: '/about', freq: 'monthly' as const, pr: 0.4 },
    { path: '/privacy', freq: 'monthly' as const, pr: 0.2 },
    { path: '/terms', freq: 'monthly' as const, pr: 0.2 },
    { path: '/licenses', freq: 'monthly' as const, pr: 0.2 },
  ];

  const staticSitemap: MetadataRoute.Sitemap = staticRoutesConfig.map(({ path, freq, pr }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: pr,
  }));

  // 2. 동적 플레이리스트 페이지
  let dynamicSitemap: MetadataRoute.Sitemap = [];

  try {
    // 한 번에 가져올 개수 설정 너무 많으면 페이징 로직 필요하지만 일단 최신 1000개면 충분
    const { playlists } = await fetchPlaylistsServer({ limit: 1000 });

    dynamicSitemap = playlists.map((playlist) => ({
      url: `${siteUrl}/playlists/${playlist.id}`,
      lastModified: new Date(playlist.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap 생성 중 플레이리스트 로드 실패:', error);
  }

  return [...staticSitemap, ...dynamicSitemap];
}
