'use client';

import { Sidebar } from './sidebar';
import { AuthGuard } from './auth-guard';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}