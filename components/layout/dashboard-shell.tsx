'use client';

import { Sidebar } from './sidebar';
import { AuthGuard } from './auth-guard';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-zinc-950 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.07),transparent_32rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 lg:ml-64">
          <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
