import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types/game';

import MessageItem from '@/app/room/[roomId]/_components/MessageItem';
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
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;

      setIsUserScrolledUp(!isBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 메시지 추가될 때 자동 스크롤
  useEffect(() => {
    if (isUserScrolledUp) return;

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUserScrolledUp]);

  // 메시지 전송
  const sendMessage = () => {
    const message = input.trim();
    onSendMessage?.(message);
    setInput('');
  };

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-green-900'>
      {/* TODO: 가상 스크롤 적용 */}
      {/* isUserScrolledUp이 true면 채팅창 가장 아래로 보내는 아이콘 적용 */}
      <div className='scrollbar-custom min-h-0 flex-1 overflow-y-auto px-2' ref={containerRef}>
        {messages.map((message, idx) => (
          <MessageItem key={idx} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* enter로 input 포커스 => 이거를 위해서 좀 복잡해짐, 케이스 잘 생각해서 고려 */}
      <form
        className='flex flex-none items-center gap-2 border-t border-green-900 p-2'
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
