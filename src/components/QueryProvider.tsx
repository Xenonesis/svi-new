'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 min stale time — marketing + project data doesn't change often
            staleTime: 1000 * 60 * 5,
            // Keep in cache 30 min for session continuity (admin panel, portal)
            gcTime: 1000 * 60 * 30,
            retry: 1,
            // Disable window-focus refetch for marketing pages to reduce unnecessary fetches
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
