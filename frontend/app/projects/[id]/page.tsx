'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const { showToast } = useToast();
  const { user } = useAuth();

  const canManage = user?.role?.name === 'Administrator' || user?.role?.name === 'Project Manager';

  const load = () => {
    setLoading(true);
    api.get('/projects').then((res) => setProjects(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      showToast('Project created');
      setModalOpen(false);
      setForm({ name: '', description: '', start_date: '', end_date: '' });
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition block"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{p.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${statusColor[p.status] || 'bg-slate-100 text-slate-600'}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{p.description || 'No description'}</p>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 mb-1">No projects to show yet.</p>
              <p className="text-sm text-slate-400">
                {canManage
                  ? 'Create your first project using the button above.'
                  : "You haven't been added to any projects yet. Ask your Project Manager to add you."}
              </p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Project name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
            Create project
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}