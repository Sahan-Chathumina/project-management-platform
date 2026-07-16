'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users as UsersIcon,
  FolderKanban,
  ListTodo,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/users', label: 'Users', icon: UsersIcon, roles: ['Administrator'] },
  { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/tasks', label: 'Tasks', icon: ListTodo, roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['Administrator', 'Project Manager', 'Team Member'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const roleName = user?.role?.name;

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" />}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-slate-900 text-white flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
              PM Platform
            </h2>
            {user && (
              <p className="text-sm text-slate-400 mt-2">
                {user.name} · {roleName || 'No role'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !roleName || item.roles.includes(roleName))
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}