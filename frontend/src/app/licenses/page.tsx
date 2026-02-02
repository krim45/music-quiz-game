import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import GoBack from '@/components/nav/GoBack';

export const metadata: Metadata = {
  title: '오픈소스 / 글꼴 라이선스',
  description: 'Play Music Quiz에서 사용 중인 글꼴 및 오픈소스 라이선스 전문.',
  alternates: { canonical: '/licenses' },
};

type LicenseItem = {
  id: string;
  name: string;
  desc?: string;
  filePath: string; // project root 기준
  sourceUrl?: string;
};

const LICENSES: LicenseItem[] = [
  {
    id: 'neodgm',
    name: 'Neo둥근모',
    desc: 'Neo둥근모 글꼴 라이선스 전문',
    filePath: '/public/licenses/fonts/NeoDunggeunmo-LICENSE.txt',
    sourceUrl: 'https://github.com/neodgm/neodgm/blob/main/LICENSE.txt',
  },
];

function readLicenseText(filePathFromRoot: string) {
  const fullPath = path.join(process.cwd(), filePathFromRoot);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return `라이선스 파일을 읽을 수 없습니다: ${filePathFromRoot}\n(경로/파일명을 확인해주세요)`;
  }
}

export default function LicensesPage() {
  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-sm' href='/'>
          홈으로
        </GoBack>
      </nav>

      <div className='mx-auto max-w-3xl px-5 py-10'>
        <header className='text-center'>
          <p className='text-xs tracking-[0.35em] text-white/60'>OPEN SOURCE & FONTS</p>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>오픈소스 / 글꼴 라이선스</h1>
          <p className='mt-3 text-sm leading-6 text-white/75'>
            본 서비스에서 사용 중인 글꼴 및 오픈소스 라이선스 전문을 제공합니다.
          </p>
        </header>

        <section className='mt-12'>
          {LICENSES.map((item) => {
            const text = readLicenseText(item.filePath);

            return (
              <details key={item.id} className='rounded-2xl border border-white/10 bg-white/5 p-5 open:bg-white/6'>
                <summary className='cursor-pointer list-none'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='text-base font-semibold'>{item.name}</div>
                      <span className='text-xs text-white/60'>펼치기</span>
                    </div>

                    {item.desc ? <div className='text-sm text-white/70'>{item.desc}</div> : null}

                    {item.sourceUrl ? (
                      <div className='text-sm'>
                        <a
                          href={item.sourceUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-white/70 underline-offset-4 hover:text-white hover:underline'
                        >
                          원본 링크 (GitHub)
                        </a>
                      </div>
                    ) : null}
                  </div>
                </summary>

                <div className='mt-4'>
                  <pre className='rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed whitespace-pre-wrap text-white/85'>
                    {text}
                  </pre>
                </div>
              </details>
            );
          })}
        </section>
      </div>
    </div>
  );
}
