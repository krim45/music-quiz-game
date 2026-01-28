import type { Metadata } from 'next';
import Link from 'next/link';
import GoBack from '@/components/nav/GoBack';
import Section from '@/components/common/Section';

export const metadata: Metadata = {
  title: '이용약관',
  description: '노래 맞추기 게임 이용약관',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <div className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          <span>홈으로</span>
        </GoBack>
      </div>

      <div className='mx-auto max-w-3xl px-5 py-10'>
        <header className='text-center'>
          <p className='text-xs tracking-[0.35em] text-white/60'>TERMS</p>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>이용약관</h1>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            본 약관은 서비스 이용과 관련된 권리·의무 및 책임사항을 규정합니다.
          </p>
        </header>

        <main className='mt-10 space-y-8'>
          <Section title='1. 목적'>
            <p className='text-white/80'>
              본 약관은 노래 맞추기 게임(이하 “서비스”)의 이용과 관련하여 서비스 제공자와 이용자 간의 권리·의무 및
              책임사항, 기타 필요한 사항을 정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title='2. 서비스 개요'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>서비스는 이용자가 방을 생성/참가하여 실시간으로 게임을 진행할 수 있는 웹 기반 게임입니다.</li>
              <li>
                이용자는 노래를 듣고 제한 시간 내 “노래 제목”을 입력하여 정답을 맞히면 점수를 획득합니다(정답 1점).
              </li>
              <li>서비스는 게임 진행을 위해 실시간 통신(예: 소켓)을 사용할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title='3. YouTube API 기반 콘텐츠 안내(중요)'>
            <p className='text-white/80'>
              서비스는 게임 진행을 위해 <b className='text-white/90'>YouTube API Services</b>를 통해 영상/플레이리스트
              정보를 가져오거나 재생 기능을 연동할 수 있습니다. 이 경우 이용자는 YouTube 및 권리자의 권리를 존중해야
              하며, 서비스의 YouTube 연동 기능은 YouTube의 정책 및 약관을 준수합니다.
            </p>

            <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80'>
              <ul className='list-disc space-y-2 pl-5'>
                <li>
                  YouTube 콘텐츠(영상, 음원, 메타데이터 등)의 저작권 및 권리는 각 권리자에게 있으며, 서비스는 해당
                  콘텐츠의 권리를 주장하지 않습니다.
                </li>
                <li>서비스 이용 시 YouTube 이용약관이 적용될 수 있습니다.</li>
                <li>외부 플랫폼(YouTube 등)의 정책/기능 변경으로 일부 기능이 변경 또는 중단될 수 있습니다.</li>
              </ul>
            </div>

            <div className='mt-4 text-sm text-white/70'>
              참고:
              <ul className='mt-2 list-disc space-y-2 pl-5'>
                <li>
                  <a
                    className='underline underline-offset-4 hover:text-white'
                    href='https://www.youtube.com/t/terms'
                    target='_blank'
                    rel='noreferrer'
                  >
                    YouTube 이용약관
                  </a>
                </li>
                <li>
                  <a
                    className='underline underline-offset-4 hover:text-white'
                    href='https://developers.google.com/youtube/terms/api-services-terms-of-service'
                    target='_blank'
                    rel='noreferrer'
                  >
                    YouTube API Services Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    className='underline underline-offset-4 hover:text-white'
                    href='https://developers.google.com/youtube/terms/developer-policies'
                    target='_blank'
                    rel='noreferrer'
                  >
                    YouTube API Services Developer Policies
                  </a>
                </li>
              </ul>
            </div>
          </Section>

          <Section title='4. 이용자의 의무 및 금지행위'>
            <p className='text-white/80'>
              이용자는 서비스 이용 시 관련 법령 및 본 약관을 준수해야 하며, 아래 행위를 해서는 안 됩니다.
            </p>
            <ul className='mt-3 list-disc space-y-2 pl-5 text-white/80'>
              <li>욕설·혐오·차별적 표현, 도배 등 타인에게 불쾌감을 주는 행위</li>
              <li>서비스/서버에 과도한 부하를 유발하는 행위(봇, 스팸 요청, 자동화된 접근 등)</li>
              <li>서비스 기능을 악용한 부정행위(게임 결과 조작, 취약점 공격, 비정상 트래픽 유발 등)</li>
              <li>타인의 권리(저작권, 상표권, 초상권 등) 침해</li>
              <li>기타 서비스 운영을 방해하거나 공공질서/미풍양속에 반하는 행위</li>
            </ul>
            <p className='mt-3 text-sm text-white/70'>
              위반 시 서비스는 이용 제한, 방 강제 종료, 접속 차단 등 필요한 조치를 취할 수 있습니다.
            </p>
          </Section>

          <Section title='5. 서비스 제공 및 변경/중단'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>서비스는 운영상/기술상 필요에 따라 기능을 추가·변경할 수 있습니다.</li>
              <li>점검, 장애, 트래픽 급증, 외부 서비스 정책 변경 등으로 서비스가 일시 중단될 수 있습니다.</li>
              <li>
                서비스는 게임 특성상 일부 데이터(예: 점수, 방 상태)가 일시적일 수 있으며, 영구 보관을 보장하지 않을 수
                있습니다.
              </li>
            </ul>
          </Section>

          <Section title='6. 책임 제한'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>
                서비스는 무료 제공(또는 베타 제공)되는 기능에 대해 법령상 허용되는 범위에서 책임을 제한할 수 있습니다.
              </li>
              <li>이용자의 귀책 사유(부정행위, 네트워크 환경 등)로 인한 손해에 대해 서비스는 책임을 지지 않습니다.</li>
              <li>외부 플랫폼(YouTube 등)의 장애/정책 변경으로 인한 기능 제한에 대해 서비스는 책임을 지지 않습니다.</li>
            </ul>
          </Section>

          <Section title='7. 개인정보 및 쿠키'>
            <p className='text-white/80'>
              개인정보 처리에 관한 사항은{' '}
              <Link className='underline underline-offset-4 hover:text-white' href='/privacy'>
                개인정보처리방침
              </Link>
              에 따릅니다.
            </p>
          </Section>

          <Section title='8. 문의'>
            <p className='text-white/80'>서비스 이용 관련 문의는 아래 이메일로 연락해 주세요.</p>
            <div className='mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75'>
              이메일: <b className='text-white/90'>playmusicgameinfo@gmail.com</b>
            </div>
          </Section>

          <Section title='9. 약관의 효력 및 변경'>
            <p className='text-white/80'>
              본 약관은 <b className='text-white/90'>2026-01-28</b>부터 적용됩니다. 서비스는 필요 시 약관을 변경할 수
              있으며, 중요한 변경이 있는 경우 서비스 내 공지 등을 통해 안내합니다.
            </p>
          </Section>

          <div className='pt-2 text-center text-xs text-white/50'>© {new Date().getFullYear()} 노래 맞추기 게임</div>
        </main>
      </div>
    </div>
  );
}
