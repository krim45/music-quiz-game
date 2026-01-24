import { ChatMessage } from '@/types/game';

interface Props {
  message: ChatMessage;
}

export default function MessageItem({ message }: Props) {
  if (message.type === 'system') {
    return <div className='my-2 rounded bg-green-900/20 p-3 text-center text-green-300'>{message.message}</div>;
  }

  return (
    <div className='w-full p-1 text-sm'>
      <div style={{ color: message.color }}>{message.from}</div>
      <div className='break-all'>{message.message}</div>
    </div>
  );
}
