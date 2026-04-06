import { memo, useEffect, useRef, useState } from 'react';
import ChevronDown from '@/components/icon/ChevronDown';
import MessageItem from '@/app/room/[roomId]/_components/MessageItem';

import type { ChatMessage } from '@/types/game';

type Props = {
  messages: ChatMessage[];
};

function ChatMessageListBase({ messages }: Props) {
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = scrollHeight - scrollTop - clientHeight < 100;

      setIsUserScrolledUp((prev) => {
        const next = !isBottom;
        return prev === next ? prev : next;
      });
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isUserScrolledUp) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUserScrolledUp]);

  const scrollToMessageEnd = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div ref={containerRef} className='scrollbar-custom min-h-0 flex-1 overflow-y-scroll pr-2 pl-2 md:pr-1'>
        {messages.map((message, idx) => (
          <MessageItem key={idx} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isUserScrolledUp && (
        <ChevronDown
          className='absolute right-4 bottom-14 cursor-pointer rounded-full bg-gray-300 text-gray-700 hover:bg-white'
          size={28}
          onClick={scrollToMessageEnd}
        />
      )}
    </>
  );
}

const ChatMessageList = memo(ChatMessageListBase);

export default ChatMessageList;
