'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@/lib/store/useToastStore';

export default function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            const msg = error instanceof Error ? error.message : (error ?? '서버 에러');
            toast.error(msg);
          },
        }),
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
