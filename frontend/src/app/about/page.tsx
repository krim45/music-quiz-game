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
    q: '노래 맞히기 게임은 어떤 게임인가요?',
    a: '노래 맞히기 게임은 별도의 프로그램 설치 없이 웹 브라우저만 있으면 누구나 즐길 수 있는 실시간 멀티플레이 음악 퀴즈 게임입니다. PC, 태블릿, 스마트폰 등 다양한 기기에서 접속하여 친구들과 함께 노래의 전주나 하이라이트 부분을 듣고 제목을 맞추는 방식으로 진행됩니다. K-POP, J-POP, 팝송, 영화 OST 등 다양한 장르의 음악 퀴즈를 제공합니다.',
  },
  {
    q: '게임을 하려면 회원가입이나 로그인이 필요한가요?',
    a: '아니요, 번거로운 회원가입 절차 없이 무료로 이용할 수 있습니다. 사이트에 접속하여 원하는 닉네임만 설정하면 즉시 기존 방에 참여하거나 새로운 방을 만들 수 있습니다. 사용자의 접근성을 최우선으로 고려하여 누구나 쉽고 빠르게 게임을 즐길 수 있도록 설계되었습니다.',
  },
  {
    q: '친구들과 비공개로 게임을 하고 싶어요.',
    a: "친구들끼리만 게임을 즐기고 싶다면 '방 만들기' 메뉴에서 '비공개' 옵션을 선택하세요. 방을 생성한 후 비밀번호를 설정하거나, 생성된 방의 공유 링크(URL)를 복사하여 친구들에게 보내면 해당 링크를 통해 입장할 수 있습니다.",
  },
  {
    q: '정답을 입력했는데 오답으로 처리됩니다.',
    a: '기본적으로 노래 제목의 정확한 표기를 권장하지만, 원활한 플레이를 위해 띄어쓰기(공백)와 대소문자는 구분하지 않고 정답으로 인정합니다. 다만, 특수문자나 오타가 포함된 경우에는 오답으로 처리될 수 있습니다. 영어 제목의 경우 한국어 발음 표기나 공식 한국어 제목도 데이터베이스에 등록되어 있다면 정답으로 인정됩니다.',
  },
  {
    q: '모바일 환경에서도 플레이할 수 있나요?',
    a: '네, 가능합니다. 노래 맞히기 게임은 반응형 웹 디자인(Responsive Web Design) 기술을 적용하여 데스크탑뿐만 아니라 안드로이드(Android), iOS(iPhone, iPad) 등 모바일 환경에서도 최적화된 UI를 제공합니다. 이동 중이거나 PC가 없는 환경에서도 스마트폰을 통해 쾌적하게 퀴즈를 풀 수 있습니다.',
  },
  {
    q: '소리가 들리지 않거나 끊겨서 들립니다.',
    a: "게임 진행 중 소리가 들리지 않는다면 먼저 기기의 볼륨 설정과 음소거 여부를 확인해주세요. 모바일 브라우저(Safari, Chrome 등)의 정책상 '자동 재생'이 차단될 수 있으므로, 게임 시작 전 화면을 한 번 터치하거나 상호작용을 해야 소리가 나올 수 있습니다. 인터넷 연결 상태가 불안정할 경우 오디오 버퍼링이 발생할 수 있으니 와이파이(Wi-Fi)나 안정적인 네트워크 환경에서 접속하는 것을 권장합니다.",
  },
  {
    q: '게임 도중 모르는 노래가 나오면 어떻게 하나요?',
    a: "문제를 풀기 어렵거나 모르는 노래가 나왔을 때는 '스킵(Skip) 투표' 기능을 사용할 수 있습니다. 방에 참여한 인원의 과반수가 스킵에 동의하면 즉시 다음 라운드로 넘어갑니다. 또한, 게임 설정에 따라 노래 중간에 가수 이름 힌트가 제공되기도 합니다.",
  },
  {
    q: '직접 퀴즈를 만들거나 플레이리스트를 추가할 수 있나요?',
    a: "네, 가능합니다. '플레이리스트 만들기' 기능이 정식으로 추가되었습니다. 유튜브(YouTube) 영상의 URL만 있으면 누구나 손쉽게 자신만의 음악 퀴즈 플레이리스트를 생성할 수 있습니다. 내가 좋아하는 노래들로 구성된 퀴즈 방을 만들어 친구들을 초대하거나, 전체 공개하여 다른 사용자들과 함께 즐겨보세요.",
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
      <Link href='/room/new' className='rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-500'>
        게임 생성
      </Link>
    </div>
  );

  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-sm' href='/'>
          홈으로
        </GoBack>
      </nav>

      <div className='mx-auto max-w-3xl px-5 py-10'>
        <header className='text-center'>
          <p className='text-xs tracking-[0.35em] text-white/60'>MUSIC QUIZ ARCADE</p>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>
            노래 맞히기 게임 <span className='text-white/60'>소개</span>
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
            <a
              href='https://open.kakao.com/o/gIXXVHdi'
              target='_blank'
              className='border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold hover:bg-white/15'
            >
              개발자 문의
            </a>
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

        {/* Licenses */}
        <section className='mt-10'>
          <h2 className='text-xl font-bold'>오픈소스 / 글꼴 라이선스</h2>
          <div className='mt-2'>
            <span className='mt-2 text-sm text-white/75'>사용 중인 글꼴 및 오픈소스: </span>

            <Link href='/licenses' className='inline-flex items-center justify-center text-sm font-semibold underline'>
              라이선스 보기
            </Link>
          </div>
        </section>

        {/* Footer CTA */}
        <section className='mt-12 rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-6 text-center'>
          <h2 className='text-lg font-bold'>준비됐으면, 바로 시작!</h2>
          <p className='mt-2 text-sm text-white/75'>방에 들어가서 친구들과 승부해보세요.</p>

          {CTAgroup}
        </section>
      </div>
    </div>
  );
}
