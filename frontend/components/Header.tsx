'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const title =
    titles[pathname] ||
    (pathname.startsWith('/projects/') ? 'Project Details' : 'Project Management Platform');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative text-slate-400 hover:text-slate-600"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>
          {notifOpen && (
            <>
              <div onClick={() => setNotifOpen(false)} className="fixed inset-0 z-10" />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-20">
                <p className="px-4 py-2 text-sm font-medium text-slate-700 border-b border-slate-100">Notifications</p>
                <p className="px-4 py-6 text-sm text-slate-400 text-center">No new notifications</p>
              </div>
            </>
          )}
        </div>
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm text-slate-700 hidden sm:block">{user?.name}</span>
        </Link>
      </div>
    </header>
  );
}