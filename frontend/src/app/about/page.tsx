import GoBack from '@/components/nav/GoBack';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '소개',
  description: '노래를 듣고 제한 시간 안에 노래 제목만 맞히는 실시간 멀티플레이 음악 퀴즈 게임. 정답이면 1점!',
  alternates: { canonical: '/about' },
};

const steps = [
  {
    title: '1) 게임 참가(방 찾기)',
    desc: '‘게임 참가’에서 방 목록을 보고 들어가거나, 검색으로 방을 찾을 수 있어요.',
  },
  {
    title: '2) 게임 생성(방 만들기)',
    desc: '방 제목을 입력하고 공개/비공개를 고른 다음 플레이리스트를 선택해 방을 만들어요.',
  },
  {
    title: '3) 닉네임 입력 후 입장',
    desc: '닉네임을 입력하고 입장하면, 방 안에서 플레이어 목록을 확인할 수 있어요.',
  },
];

const rules = [
  { k: '정답', v: '노래 제목을 맞히면 정답이에요. 띄어쓰기, 대소문자 구분 없이 인정' },
  { k: '점수', v: '정답이면 1점. 오답은 점수 없음(감점 없음).' },
  { k: '라운드 흐름', v: '카운트다운 → 노래 재생 → 제목 입력/제출 → 정답 공개 → 다음 곡' },
  { k: '힌트', v: '라운드 중간에 가수 이름이 힌트로 제공될 수 있어요.' },
  { k: '스킵', v: '현재 인원의 과반수 동의 시 다음 곡으로 넘어가요.' },
];

const faq = [
  {
    q: '노래가 너무 어려우면요?',
    a: '스킵 투표로 다수결로 넘어갈 수 있어요.',
  },
];

export default function AboutPage() {
  const CTAgroup = (
    <div className='mt-7 flex items-center justify-center gap-3'>
      <Link
        href='/room/join'
        className='rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold hover:bg-white/15'
      >
        게임 참가
      </Link>
      <Link
        href='/room/create'
        className='rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-500'
      >
        게임 생성
      </Link>
    </div>
  );

  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <div className='pt-4 pl-6'>
        <GoBack className='text-sm' href='/'>
          <span>홈으로</span>
        </GoBack>
      </div>

      <div className='mx-auto max-w-3xl px-5 py-10'>
        <header className='text-center'>
          <p className='text-xs tracking-[0.35em] text-white/60'>MUSIC QUIZ ARCADE</p>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>
            노래 맞추기 게임 <span className='text-white/60'>소개</span>
          </h1>
          <p className='mt-4 leading-7 text-white/80'>
            들리는 노래를 듣고 <b>제한 시간 안에 ‘노래 제목’만</b> 맞히면 점수를 얻어요.
            <br />방 안의 사람들과 <b>실시간으로 경쟁</b>하는 멀티플레이 음악 퀴즈 게임입니다.
          </p>

          <div className='mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80'>
            <span className='inline-block h-2 w-2 rounded-full bg-green-400' />
            룰은 단순하게: <b>정답이면 +1점</b>
          </div>

          <div className='mt-7 flex items-center justify-center gap-3'>
            <Link
              href='https://open.kakao.com/o/gIXXVHdi'
              target='_blank'
              className='border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold hover:bg-white/15'
            >
              개발자 문의
            </Link>
          </div>
        </header>

        {/* Section: What is this */}
        <section className='mt-12 rounded-2xl border border-white/10 bg-white/5 p-6'>
          <ul className='mt-4 grid gap-3 text-white/85'>
            <li className='rounded-xl border border-white/10 bg-black/30 p-4'>
              <b className='text-white'>실시간 멀티플레이</b>
              <div className='mt-1 text-sm text-white/70'>같은 방에서 같은 노래를 듣고 바로 승부해요.</div>
            </li>
            <li className='rounded-xl border border-white/10 bg-black/30 p-4'>
              <b className='text-white'>노래 제목을 맞히면 OK</b>
              <div className='mt-1 text-sm text-white/70'>노래를 듣고 제목을 맞히면 점수 획득!</div>
            </li>
            <li className='rounded-xl border border-white/10 bg-black/30 p-4'>
              <b className='text-white'>플레이리스트 기반</b>
              <div className='mt-1 text-sm text-white/70'>테마별 플레이리스트가 무작위 순서로 라운드가 진행돼요.</div>
            </li>
            <li className='rounded-xl border border-white/10 bg-black/30 p-4'>
              <b className='text-white'>스킵 투표</b>
              <div className='mt-1 text-sm text-white/70'>다수결로 다음 곡으로 넘어갈 수 있어요.</div>
            </li>
          </ul>
        </section>

        {/* How to play */}
        <section className='mt-10'>
          <h2 className='text-xl font-bold'>게임 방법</h2>
          <div className='mt-4 grid gap-3'>
            {steps.map((s) => (
              <div key={s.title} className='rounded-2xl border border-white/10 bg-white/5 p-5'>
                <div className='font-semibold'>{s.title}</div>
                <p className='mt-2 text-sm leading-6 text-white/75'>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-6'>
            <h3 className='font-semibold'>라운드 진행</h3>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-sm text-white/75'>
              <li>라운드 시작 전 카운트다운이 진행돼요.</li>
              <li>노래가 재생되면 제한 시간이 시작돼요.</li>
              <li>입력창에 노래 제목을 입력하고 제출하세요.</li>
              <li>정답이 맞혀지거나 시간이 끝나면 정답이 공개되고 다음 곡으로 넘어가요.</li>
            </ol>
          </div>
        </section>

        {/* Rules */}
        <section className='mt-10'>
          <h2 className='text-xl font-bold'>규칙</h2>
          <div className='mt-4 overflow-hidden rounded-2xl border border-white/10'>
            <div className='divide-y divide-white/10 bg-white/5'>
              {rules.map((r) => (
                <div key={r.k} className='flex items-start gap-4 px-5 py-4'>
                  <div className='w-22 shrink-0 text-sm font-semibold text-white/90'>{r.k}</div>
                  <div className='text-sm leading-6 text-white/75'>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/75'>
            <b className='text-white/90'>스킵 예시</b>
            <div className='mt-2'>4명 방이면 3표 필요, 5명 방이면 3표 필요(과반수 + 1 기준).</div>
          </div>
        </section>

        {/* FAQ */}
        <section className='mt-10'>
          <h2 className='text-xl font-bold'>FAQ</h2>
          <div className='mt-4 grid gap-3'>
            {faq.map((item) => (
              <details key={item.q} className='rounded-2xl border border-white/10 bg-white/5 p-5'>
                <summary className='cursor-pointer font-semibold text-white/90'>{item.q}</summary>
                <p className='mt-3 text-sm leading-6 text-white/75'>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className='mt-12 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 text-center'>
          <h2 className='text-lg font-bold'>준비됐으면, 바로 시작!</h2>
          <p className='mt-2 text-sm text-white/75'>방에 들어가서 친구들과 승부해보세요.</p>

          {CTAgroup}
        </section>
      </div>
    </div>
  );
}
