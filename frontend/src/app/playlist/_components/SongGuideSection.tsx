export default function SongGuideSection() {
  return (
    <div className='space-y-4'>
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

      <section className='space-y-3 rounded-xl border border-gray-700 bg-gray-900/40 p-5'>
        <h3 className='text-lg'>2. 정답 규칙 & 재생 순서</h3>

        <ul className='list-disc space-y-2 pl-5 text-gray-300'>
          <li>
            <span className='text-white'>정답 인정 방식</span>:{' '}
            <span className='text-gray-100'>대소문자, 띄어쓰기 구분 없이</span> 정답으로 인정됩니다.
          </li>

          <li>
            <span className='text-white'>재생 순서</span>: 노래는 게임 중 <span className='text-gray-100'>랜덤</span>{' '}
            순서로 재생됩니다.
          </li>
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
