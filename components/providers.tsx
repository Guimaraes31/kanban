'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { StoreProvider } from '@/hooks/use-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider><StoreProvider>{children}</StoreProvider></AuthProvider>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #3f3f46',
            color: '#fafafa',
          },
        }}
      />
    </>
  );
}
