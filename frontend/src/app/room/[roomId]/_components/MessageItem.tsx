import { ChatMessage } from '@/types/game';

interface Props {
  message: ChatMessage;
}

export default function MessageItem({ message }: Props) {
  if (message.type === 'system') {
    const isCorrect = message.systemType === 'correct';
    const color = isCorrect
      ? 'bg-green-900/30 text-green-300'
      : message.systemType === 'timeout'
        ? 'bg-red-900/20 text-rose-500'
        : 'bg-gray-800/40 text-gray-300';

    return (
      <div className={`my-2 flex items-center justify-center gap-2 rounded p-3 text-center ${color}`}>
        {isCorrect && (
          <span className='mt-0.5 inline-block h-4 w-4 rounded-sm' style={{ backgroundColor: message.color }}></span>
        )}

        <span>{message.message}</span>
      </div>
    );
  }

  return (
    <div className='w-full p-1 text-sm'>
      <div style={{ color: message.color }}>{message.from}</div>
      <div className='break-all'>{message.message}</div>
    </div>
  );
}
