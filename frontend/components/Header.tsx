'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title =
    titles[pathname] ||
    (pathname.startsWith('/projects/') ? 'Project Details' : 'Project Management Platform');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm text-slate-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}