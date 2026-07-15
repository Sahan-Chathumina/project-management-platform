'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, UserPlus, X, Calendar } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
}
interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee: Member | null;
}
interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  creator: Member;
  members: Member[];
  tasks: Task[];
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColor: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const taskStatusColor: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const canManage = user?.role?.name === 'Administrator' || user?.role?.name === 'Project Manager';

  const load = () => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  const openAddMember = () => {
    api.get('/team-members').then((res) => setAvailableUsers(res.data));
    setSelectedUserId('');
    setModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { user_id: Number(selectedUserId) });
      showToast('Member added');
      setModalOpen(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      showToast('Member removed');
      load();
    } catch {
      showToast('Failed to remove member', 'error');
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <p className="text-slate-500">Loading project...</p>
      </ProtectedLayout>
    );
  }

  if (!project) {
    return (
      <ProtectedLayout>
        <p className="text-slate-500">Project not found.</p>
      </ProtectedLayout>
    );
  }

  const memberIds = new Set(project.members.map((m) => m.id));
  const selectableUsers = availableUsers.filter((u) => !memberIds.has(u.id) && u.id !== project.creator.id);

  return (
    <ProtectedLayout>
      <button
        onClick={() => router.push('/projects')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[project.status] || 'bg-slate-100 text-slate-600'}`}>
            {project.status}
          </span>
        </div>
        <p className="text-slate-600 mb-4">{project.description || 'No description provided.'}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {project.start_date || '—'} → {project.end_date || '—'}
          </span>
          <span>Created by {project.creator?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Tasks</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Assignee</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="p-3 text-slate-900">{t.title}</td>
                    <td className="p-3 text-slate-700">{t.assignee?.name || 'Unassigned'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColor[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {project.tasks.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-500">No tasks yet for this project.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>
            {canManage && (
              <button onClick={openAddMember} className="text-blue-600 hover:text-blue-800" title="Add member">
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
                {canManage && (
                  <button onClick={() => handleRemoveMember(m.id)} className="text-slate-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {project.members.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No members assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <select
            required
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a user</option>
            {selectableUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Add to project
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}