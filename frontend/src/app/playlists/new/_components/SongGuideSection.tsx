import type { SongAddMode } from '@/app/playlists/new/_components/SongAddSection';

/** 1번 안내만 추가 방식에 따라 다르다. 정답 규칙과 링크 형식은 두 방식이 같다 */
const HOW_TO: Record<SongAddMode, React.ReactNode> = {
  single: (
    <section className='space-y-3 rounded-xl border border-gray-700 bg-gray-900/40 p-5'>
      <h3 className='text-lg'>1. 영상 링크 & 재생 시간 설정</h3>

      <ul className='list-disc space-y-2 pl-5 text-gray-300'>
        <li>
          <span className='text-white'>유튜브 영상 링크</span>: 재생할 노래의 유튜브 링크를 입력하세요.
        </li>

        <li>
          <span className='text-white'>시작 시간(초)</span>: 영상이 시작될 시간을{' '}
          <span className='text-gray-100'>초(sec)</span> 단위로 입력합니다.
        </li>

        <li className='text-gray-300'>
          <span className='text-white'>재생 길이</span>: 입력된 시작 시간부터{' '}
          <span className='text-gray-100'>60초 동안</span> 노래가 재생됩니다.
        </li>
      </ul>
    </section>
  ),
  timestamp: (
    <section className='space-y-3 rounded-xl border border-gray-700 bg-gray-900/40 p-5'>
      <h3 className='text-lg'>1. 타임스탬프로 여러 곡 추가</h3>

      <ul className='list-disc space-y-2 pl-5 text-gray-300'>
        <li>
          <span className='text-white'>유튜브 영상 링크</span>: 여러 곡이 이어서 담긴 영상{' '}
          <span className='text-gray-100'>하나</span>의 링크를 입력하세요. (메들리, 플레이리스트 영상 등)
        </li>

        <li>
          <span className='text-white'>타임스탬프 목록</span>: 설명란이나 댓글의 곡 목록을 붙여넣으면{' '}
          <span className='text-gray-100'>줄마다 한 곡</span>으로 나눠집니다.
        </li>

        <li>
          <span className='text-white'>재생 구간</span>: <span className='text-gray-100'>00:00 - 03:42</span>처럼 구간이
          적혀 있으면 그 구간을, 시작 시간만 있으면 <span className='text-gray-100'>다음 곡이 시작되기 전까지</span>{' '}
          재생됩니다. 끝을 알 수 없는 마지막 곡은 60초 동안 재생됩니다.
        </li>
      </ul>
    </section>
  ),
};

interface Props {
  mode: SongAddMode;
}

export default function SongGuideSection({ mode }: Props) {
  return (
    <div className='space-y-4'>
      {HOW_TO[mode]}

      <section className='space-y-3 rounded-xl border border-gray-700 bg-gray-900/40 p-5'>
        <h3 className='text-lg'>2. 정답 규칙 & 재생 순서</h3>

        <ul className='list-disc space-y-2 pl-5 text-gray-300'>
          <li>
            <span className='text-white'>정답 인정 방식</span>:{' '}
            <span className='text-gray-100'>대소문자·띄어쓰기·특수문자 구분 없이</span> 정답으로 인정되고, 제목 뒤{' '}
            <span className='text-gray-100'>괄호 부분은 빼고</span> 입력해도 됩니다. 괄호 안의 다른 이름으로도 맞히게
            하려면 추가 정답에 넣어 주세요.
          </li>

          <li>
            <span className='text-white'>재생 순서</span>: 노래는 게임 중 <span className='text-gray-100'>랜덤</span>{' '}
            순서로 재생됩니다.
          </li>

          {mode === 'timestamp' && (
            <li>
              <span className='text-white'>추가 정답</span>: 곡을 담은 뒤 아래{' '}
              <span className='text-gray-100'>노래 목록</span>에서 곡마다 넣을 수 있습니다.
            </li>
          )}
        </ul>
      </section>

      <section className='space-y-3 rounded-xl border border-gray-700 bg-gray-900/40 p-5 break-all'>
        <h3 className='text-lg'>3. 지원되는 유튜브 링크 예시</h3>

        <ul className='list-disc space-y-1 pl-5 text-gray-400'>
          <li>https://www.youtube.com/watch?v=9KbsCZUTRbg</li>
          <li>https://youtu.be/9KbsCZUTRbg</li>
          <li>
            https://www.youtube.com/shorts/ELHKbxqNQvc <span className='text-gray-500'>(쇼츠)</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
