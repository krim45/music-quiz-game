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

  if (message.type === 'summary') {
    const getRankLabel = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `${rank}`;
    };

    return (
      <div className='my-2 rounded border border-gray-700 bg-gray-900/40 p-3 text-gray-200'>
        <div className='mb-2 text-center text-sm font-semibold'>🏁 최종 순위</div>

        <div className='flex flex-col items-center gap-2 overflow-hidden'>
          {message.players.map((p, idx) => (
            <div
              key={`${p.nickname}-${idx}`}
              className='grid w-70 grid-cols-[1fr_auto] items-center gap-5 rounded bg-black/20 px-3 py-1'
            >
              <div className='flex min-w-0 items-center gap-2 overflow-hidden'>
                <span className='w-7 flex-none text-center text-sm'>{getRankLabel(idx + 1)}</span>
                <span className='h-3 w-3 flex-none rounded-sm' style={{ backgroundColor: p.color }} />
                <span className='truncate text-sm font-medium'>{p.nickname}</span>
              </div>

              <div className='text-right text-sm text-gray-100 tabular-nums'>{p.score}점</div>
            </div>
          ))}
        </div>
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
