import type { Metadata } from 'next';

import GoBack from '@/components/nav/GoBack';
import Section from '@/components/common/Section';
import SubSection from '@/components/common/SubSection';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '노래 맞히기 게임 개인정보처리방침',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          홈으로
        </GoBack>
      </nav>

      <div className='mx-auto max-w-3xl px-5 py-10'>
        <header className='text-center'>
          <p className='text-xs tracking-[0.35em] text-white/60'>POLICY</p>
          <h1 className='mt-3 text-3xl font-extrabold tracking-tight'>개인정보처리방침</h1>
          <p className='mt-3 text-sm leading-6 text-white/70'>
            본 방침은 서비스 이용 과정에서 처리되는 정보와 그 목적을 안내합니다.
          </p>
        </header>

        <main className='mt-10 space-y-8'>
          <Section title='1. 개인정보의 처리 목적'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>게임 방 생성/참가 및 게임 진행 등 서비스 제공</li>
              <li>서비스 안정성 확보 및 부정 이용 방지</li>
              <li>서비스 이용 통계 분석 및 개선</li>
            </ul>
          </Section>

          <Section title='2. 처리하는 개인정보의 항목 및 수집 방법'>
            <p className='text-white/80'>
              서비스는 회원가입 없이 이용 가능하며, 이용 과정에서 아래 정보가 처리될 수 있습니다.
            </p>

            <SubSection title='1) 이용자가 직접 입력하는 정보'>
              <ul className='list-disc space-y-2 pl-5 text-white/80'>
                <li>
                  <b className='text-white/90'>닉네임(표시 이름)</b>: 게임 화면에서 플레이어를 구분하여 표시하기 위한
                  목적
                </li>
                <li>닉네임은 이용자가 임의로 입력하는 문자열입니다.</li>
                <li>
                  <b className='text-white/90'>
                    닉네임에 실명, 이메일, 전화번호, SNS 계정 등 개인을 식별할 수 있는 정보를 포함하지 않도록
                  </b>{' '}
                  주의해 주세요.
                </li>
                <li>
                  닉네임은 서버/데이터베이스에 영구 저장하지 않으며, 이용자 편의를 위해
                  <b className='text-white/90'> 브라우저</b>에 저장될 수 있습니다.
                </li>
              </ul>
            </SubSection>
          </Section>

          <Section title='3. 서비스 이용 과정에서 자동으로 생성/수집될 수 있는 정보'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>
                <b className='text-white/90'>접속 로그(IP 주소 등)</b>: 서비스 안정성 확보 및 부정 이용 방지를 위해
                일시적으로 처리될 수 있습니다. 해당 정보는
                <b className='text-white/90'> 서버 메모리 상에서만 일시적으로 처리</b>
                되며, 별도의 데이터베이스에 영구 저장하지 않습니다.
              </li>
              <li>
                기기/브라우저 정보, 이용 기록(예: 방 생성/참가/게임 시작/완료 등): 서비스 품질 개선 및 통계 분석을 위해
                처리될 수 있습니다.
              </li>
            </ul>
          </Section>

          <Section title='4. 분석 도구(GA4) 및 광고(AdSense) 관련 안내'>
            <p className='text-white/80'>
              서비스는 이용 통계 분석을 위해 <b className='text-white/90'>Google Analytics 4(GA4)</b>를 사용할 수
              있으며, 이 과정에서 쿠키 및 유사 기술이 사용될 수 있습니다.
            </p>

            <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80'>
              <ul className='list-disc space-y-2 pl-5'>
                <li>
                  서비스는 원칙적으로 개인을 식별할 수 있는 정보(예: 실명, 이메일, 전화번호 등)를 수집하지 않습니다.
                </li>
                <li>
                  <b className='text-white/90'>
                    닉네임은 게임 화면 표시 목적의 정보이며, GA4 등 분석 도구로 전송하지 않습니다.
                  </b>
                </li>
              </ul>
            </div>

            <p className='mt-4 text-white/80'>
              서비스는 추후 광고 제공을 위해 <b className='text-white/90'>Google AdSense</b>를 사용할 수 있습니다.
              AdSense 사용 시 제3자(예: Google)가 쿠키를 사용하여 사용자의 이전 방문 기록 등을 기반으로 광고를 제공할 수
              있으며, 이용자는 맞춤형 광고를 거부할 수 있습니다.
            </p>

            <ul className='mt-3 list-disc space-y-2 pl-5 text-white/80'>
              <li>
                맞춤 광고 설정:{' '}
                <a
                  className='underline underline-offset-4 hover:text-white'
                  href='https://adssettings.google.com'
                  target='_blank'
                  rel='noreferrer'
                >
                  https://adssettings.google.com
                </a>
              </li>
            </ul>

            <p className='mt-4 text-white/80'>
              쿠키는 브라우저 설정을 통해 저장을 거부하거나 삭제할 수 있습니다. 쿠키 저장을 거부할 경우 일부 기능 또는
              광고 노출 방식이 달라질 수 있습니다.
            </p>
          </Section>

          <Section title='5. 개인정보의 보유 및 이용기간'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>
                <b className='text-white/90'>닉네임</b>: 이용자 기기에 저장되며, 이용자가 브라우저 설정을 통해 삭제할 수
                있습니다.
              </li>
              <li>
                <b className='text-white/90'>접속 로그(IP 등)</b>: 서버 메모리에서 일시적으로 처리되며, 서비스
                종료/재시작 또는 목적 달성 시 파기됩니다.
              </li>
              <li>법령에 따라 보관이 필요한 경우 해당 법령에서 정한 기간 동안 보관할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title='6. 개인정보의 제3자 제공'>
            <p className='text-white/80'>
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관의
              적법한 절차에 따른 요청이 있는 경우 제공될 수 있습니다.
            </p>
          </Section>

          <Section title='7. 정보주체의 권리 및 행사 방법'>
            <p className='text-white/80'>
              이용자는 개인정보 관련 문의를 할 수 있으며, 로컬 스토리지에 저장된 닉네임은 이용자 기기에서 직접 삭제할 수
              있습니다.
            </p>
            <div className='mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75'>
              예{')'} 브라우저 설정 → 사이트 데이터/저장공간 → 해당 사이트 데이터 삭제
            </div>
          </Section>

          <Section title='8. 개인정보의 안전성 확보 조치'>
            <ul className='list-disc space-y-2 pl-5 text-white/80'>
              <li>전송 구간 암호화(HTTPS)</li>
              <li>접근 권한 관리 및 최소 권한 원칙 적용</li>
              <li>서비스 안정성 확보를 위한 로그 점검 및 부정 이용 방지</li>
            </ul>
          </Section>

          <Section title='9. 문의처'>
            <p className='text-white/80'>개인정보 관련 문의는 아래로 연락해 주세요.</p>
            <div className='mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75'>
              이메일: <b className='text-white/90'>playmusicgameinfo@gmail.com</b>
            </div>
          </Section>

          <Section title='10. 방침 변경'>
            <p className='text-white/80'>
              본 개인정보처리방침은 <b className='text-white/90'>2026-01-28</b>부터 적용됩니다. 내용이 변경될 경우
              시행일 이전에 서비스 내 공지 등을 통해 안내합니다.
            </p>
          </Section>

          <div className='pt-2 text-center text-xs text-white/50'>© {new Date().getFullYear()} 노래 맞히기 게임</div>
        </main>
      </div>
    </div>
  );
}
