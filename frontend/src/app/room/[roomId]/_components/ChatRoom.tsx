import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { playSystemSound } from '@/sounds/systemSound';

import ChatMessageList from '@/app/room/[roomId]/_components/ChatMessageList';
import ChatInput from '@/app/room/[roomId]/_components/ChatInput';

import { ChatMessage } from '@/types/game';

interface Props {
  actions: React.ReactNode;
  roomId: string;
}

const MAX_MESSAGES = 300;

export default function ChatRoom({ actions, roomId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const onSendMessage = (message: string) => {
    const socket = getSocket();
    socket.emit('chat:message', { roomId, message });
  };

  useEffect(() => {
    const socket = getSocket();

    const onChat = (msg: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      });

      if (msg.type === 'system' && msg.systemType !== 'skip') {
        playSystemSound(msg.systemType);
      }
    };

    socket.on('chat:message', onChat);

    return () => {
      socket.off('chat:message', onChat);
    };
  }, [roomId]);

  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-green-900'>
      <ChatMessageList messages={messages} />
      <ChatInput actions={actions} onSendMessage={onSendMessage} />
    </section>
  );
}
