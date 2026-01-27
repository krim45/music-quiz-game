import ToastProvider from '@/components/feedback/ToastProvider';
import Provider from '@/lib/TanstackQueryProvider';
import '@/styles/global.css';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const title = '노래 맞추기 게임';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description:
    '노래를 듣고 제한 시간 안에 제목을 맞춰 점수를 얻는 실시간 멀티플레이 노래 퀴즈 게임. 친구들과 방에서 경쟁해보세요.',
  keywords: [
    '노래 맞추기',
    '노래 맞추기 게임',
    '음악 퀴즈',
    '음악 맞추기',
    '노래 제목 맞추기',
    '온라인 음악 게임',
    '실시간 노래 퀴즈',
    'Song Guesser',
    'Music Quiz Online',
    'K-POP 퀴즈',
    '아이돌 노래 맞추기',
    '7080 노래',
    '90년대 히트곡',
    '2000년대 추억의 노래',
    '최신가요 퀴즈',
    '연도별 노래 맞추기',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title,
    description: '노래를 듣고 제한 시간 안에 제목을 맞춰 점수를 얻는 실시간 멀티플레이 노래 퀴즈 게임.',
    siteName: 'Play Music Quiz',
    locale: 'ko_KR',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Play Music Quiz - 노래 맞추기 게임',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: '노래를 듣고 제한 시간 안에 제목을 맞춰 점수를 얻는 실시간 멀티플레이 노래 퀴즈 게임.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        <Provider>
          <main className='h-full w-full'>{children}</main>
        </Provider>

        <ToastProvider />
      </body>
    </html>
  );
}
