interface Props {
  text?: string;
}

export default function LoadingDots({ text = '로딩 중' }: Props) {
  return (
    <div className='flex w-full flex-1 items-center justify-center'>
      <div className='flex items-center gap-2 text-sm text-gray-400'>
        <span>{text}</span>
        <span className='flex gap-1'>
          <span className='h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]' />
          <span className='h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]' />
          <span className='h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]' />
        </span>
      </div>
    </div>
  );
}
