'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Funil', icon: Kanban },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { fullName, businessName, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-6 border-b border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">LeadFlow CRM</p>
          <p className="text-xs text-zinc-500 truncate max-w-[140px]">{businessName || 'Meu Negócio'}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-600/20'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="mb-3 px-1">
          <p className="text-sm font-medium text-zinc-200 truncate">{fullName || 'Usuário'}</p>
          <p className="text-xs text-zinc-500">Administrador</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-zinc-400 hover:text-red-400"
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
