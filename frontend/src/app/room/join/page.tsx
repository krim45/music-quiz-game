import JoinClient from '@/app/room/join/JoinClient';

export default function JoinPage() {
  return (
    <div className='flex h-full w-full flex-col items-center pt-10'>
      <div className='flex h-full w-full max-w-xl flex-col items-center px-4 pb-6'>
        <h1 className='mb-6 text-3xl font-bold'>게임 찾기</h1>

        <JoinClient />
      </div>
    </div>
  );
}
