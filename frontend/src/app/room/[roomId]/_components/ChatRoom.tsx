import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types/game';

import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';

// TODO: enter input 포커스
// ? 스크롤 이벤트 스로틀 디바운스

interface Props {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function ChatRoom({ messages, onSendMessage }: Props) {
  const [input, setInput] = useState('');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 유저 스크롤 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100; // "거의 바닥"인지 체크 (여유 100px)

      setIsUserScrolledUp(!isBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 메시지 추가될 때 자동 스크롤
  useEffect(() => {
    if (isUserScrolledUp) return; // 유저가 위로 스크롤 중이면 자동 스크롤 금지

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUserScrolledUp]);

  // 메시지 전송
  // onSendMessage로
  const sendMessage = () => {
    const message = input.trim();
    onSendMessage?.(message);
    setInput('');
  };

  return (
    <section className='flex flex-1 flex-col overflow-hidden rounded border border-green-900'>
      {/* TODO: 가상 스크롤 적용 */}
      {/* isUserScrolledUp이 true면 채팅창 가장 아래로 보내는 아이콘 적용 */}
      {/* 디자인 수정 */}
      <div className='scrollbar-custom flex-1 overflow-y-auto px-2' ref={containerRef}>
        {messages.map(({ color, from, message }, idx) => (
          <div key={idx} className='w-full rounded p-1 text-sm'>
            <div style={{ color }}>{from}</div>
            <div className='break-all'>{message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* enter로 input 포커스 => 이거를 위해서 좀 복잡해짐, 케이스 잘 생각해서 고려 */}
      <form
        className='flex items-center gap-2 border-t border-green-900 p-2'
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <BaseInput
          className='flex-1 rounded border border-green-900 p-1 text-sm focus:border-green-600'
          value={input}
          onChange={(v) => setInput(v)}
          placeholder='정답을 입력하세요'
        />

        {/* TODO: 아이콘으로 대체 */}
        <Button type='submit' size='sm' color='green'>
          보내기
        </Button>
      </form>
    </section>
  );
}
