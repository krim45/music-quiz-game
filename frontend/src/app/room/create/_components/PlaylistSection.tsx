import { useState } from 'react';

import InputField from '@/components/form/input/InputField';
import Table from '@/components/table/Table';
import Button from '@/components/button/Button';

interface Props {
  setPlaylistId: (id: string) => void;
}

export default function PlaylistSection({ setPlaylistId }: Props) {
  const [input, setInput] = useState('');

  const onSearch = () => {};

  // TODO: tanstack 쿼리 쓰는데 만약에 초기 리스트가 존재하면 어떻게 하는지?

  const columns = [];

  return (
    <div className='flex w-full flex-col gap-5'>
      <h2 className='text-2xl font-bold'>플레이리스트 선택</h2>

      <div className='flex h-full flex-col gap-3'>
        <div className='mt-2 flex gap-2'>
          <InputField
            className='flex-1'
            type='search'
            value={input}
            onChange={(v) => setInput(v)}
            placeholder='플레이리스트 검색'
            onClickIcon={onSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
          />
        </div>

        <Table className='mt-3 min-h-120 flex-1' stickyHead columns={[]} data={[]} />

        {/* {hasNextPage ? (
          <div className='flex justify-center'>
            <Button onClick={onLoadMore} disabled={isFetchingNextPage || isLoading}>
              {isFetchingNextPage || isLoading ? '불러오는 중...' : '더보기'}
            </Button>
          </div>
        ) : null} */}
      </div>
    </div>
  );
}
