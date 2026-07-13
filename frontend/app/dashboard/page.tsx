'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {user?.name}
      </h1>

      {loading && <p className="text-gray-500">Loading dashboard...</p>}

      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([key, value]) => {
            if (Array.isArray(value)) return null;
            return (
              <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !stats && (
        <p className="text-red-500">Could not load dashboard stats.</p>
      )}
    </ProtectedLayout>
  );
}