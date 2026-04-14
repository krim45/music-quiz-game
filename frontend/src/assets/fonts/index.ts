import localFont from 'next/font/local';

export const dgm = localFont({
  src: [{ path: './neodgm.woff2', weight: '400' }],
  variable: '--font-dgm',
  display: 'swap',
});
