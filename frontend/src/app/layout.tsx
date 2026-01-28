import type { Metadata } from 'next';
import Script from 'next/script';

import ToastProvider from '@/components/feedback/ToastProvider';
import Provider from '@/lib/TanstackQueryProvider';
import '@/styles/global.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID!;
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
      <head>
        <meta name='version' content='1.0.0'></meta>
        {/* GTM - head */}
        <Script id='gtm' strategy='afterInteractive'>
          {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
        </Script>
      </head>
      <body className='antialiased'>
        {/* GTM - noscript body 바로 아래 권장 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Provider>
          <main className='h-full w-full'>{children}</main>
        </Provider>

        <ToastProvider />
      </body>
    </html>
  );
}
