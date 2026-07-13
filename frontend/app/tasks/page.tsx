'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project: { id: number; name: string };
  assignee: { id: number; name: string } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ project_id: '', title: '', description: '', priority: 'medium', due_date: '' });
  const { showToast } = useToast();
  const { user } = useAuth();

  const canCreate = user?.role?.name === 'Administrator' || user?.role?.name === 'Project Manager';

  const load = () => {
    setLoading(true);
    api.get('/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canCreate) {
      api.get('/projects').then((res) => setProjects(res.data));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...form, project_id: Number(form.project_id) });
      showToast('Task created');
      setModalOpen(false);
      setForm({ project_id: '', title: '', description: '', priority: 'medium', due_date: '' });
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const updateStatus = async (task: Task, status: string) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      showToast('Status updated');
      load();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const priorityColor: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + New Task
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Project</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="p-3">{t.title}</td>
                  <td className="p-3">{t.project?.name}</td>
                  <td className="p-3">{t.assignee?.name || 'Unassigned'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${priorityColor[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">{t.due_date || '—'}</td>
                  <td className="p-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t, e.target.value)}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No tasks yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            required
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            placeholder="Task title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={3}
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
            Create task
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}