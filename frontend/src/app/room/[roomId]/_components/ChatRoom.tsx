import { useEffect, useRef, useState } from 'react';
import { isTypingElement } from '@/utils/reactUtils';

import MessageItem from '@/app/room/[roomId]/_components/MessageItem';
import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';
import Send from '@/components/icon/Send';
import ChevronDown from '@/components/icon/ChevronDown';

import { ChatMessage } from '@/types/game';

// TODO
// 채팅창 가상 스크롤
// 스크롤 이벤트 스로틀 디바운스

interface Props {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function ChatRoom({ messages, onSendMessage }: Props) {
  const [input, setInput] = useState('');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;

      setIsUserScrolledUp(!isBottom);
    };

    const onEnterFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;

      if (e.isComposing) return;

      console.log(e.target);
      if (isTypingElement(document.activeElement)) return;

      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.focus();
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', onEnterFocus);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', onEnterFocus);
    };
  }, []);

  useEffect(() => {
    if (isUserScrolledUp) return;

    scrollToMessageEnd();
  }, [messages, isUserScrolledUp]);

  const sendMessage = () => {
    const message = input.trim();
    if (!message) return;

    onSendMessage?.(message);
    setInput('');
  };

  const scrollToMessageEnd = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-green-900'>
      <div ref={containerRef} className='scrollbar-custom min-h-0 flex-1 overflow-y-scroll pr-1 pl-2'>
        {messages.map((message, idx) => (
          <MessageItem key={idx} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        className='flex flex-none items-center gap-2 border-t border-green-900 p-2'
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <BaseInput
          ref={inputRef}
          className='flex-1 rounded border border-green-900 p-1 text-sm focus:border-green-600'
          value={input}
          onChange={(v) => setInput(v)}
          placeholder='정답을 입력하세요'
        />

        <Button type='submit' size='sm' color='green'>
          <Send />
        </Button>
      </form>

      {isUserScrolledUp && (
        <ChevronDown
          className='absolute right-4 bottom-14 cursor-pointer rounded-full bg-gray-300 text-gray-700 hover:bg-white'
          size={28}
          onClick={scrollToMessageEnd}
        />
      )}
    </section>
  );
}
