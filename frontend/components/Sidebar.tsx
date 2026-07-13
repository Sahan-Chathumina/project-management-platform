'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/users', label: 'Users', roles: ['Administrator'] },
  { href: '/projects', label: 'Projects', roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/tasks', label: 'Tasks', roles: ['Administrator', 'Project Manager', 'Team Member'] },
  { href: '/profile', label: 'Profile', roles: ['Administrator', 'Project Manager', 'Team Member'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const roleName = user?.role?.name;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-bold">PM Platform</h2>
        {user && (
          <p className="text-sm text-gray-400 mt-1">
            {user.name} · {roleName || 'No role'}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !roleName || item.roles.includes(roleName))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm transition ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition text-left"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}