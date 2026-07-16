'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Pencil, Send, Trash2 } from 'lucide-react';

interface TeamMember { id: number; name: string; email: string; }
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project: { id: number; name: string };
  assignee: TeamMember | null;
}
interface Comment {
  id: number;
  comment: string;
  user: { id: number; name: string };
}
interface TaskDetail extends Task {
  comments: Comment[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ project_id: '', title: '', description: '', priority: 'medium', due_date: '' });

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewTask, setViewTask] = useState<TaskDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { showToast } = useToast();
  const { user } = useAuth();

  const canManage = user?.role?.name === 'Administrator' || user?.role?.name === 'Project Manager';

  const load = () => {
    setLoading(true);
    api.get('/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canManage) {
      api.get('/projects').then((res) => setProjects(res.data));
      api.get('/team-members').then((res) => setTeamMembers(res.data));
    }
  }, []);

  const priorityColor: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };
  const statusColor: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  // ---- Create ----
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...form, project_id: Number(form.project_id) });
      showToast('Task created');
      setCreateOpen(false);
      setForm({ project_id: '', title: '', description: '', priority: 'medium', due_date: '' });
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  // ---- Status (Team Member + everyone) ----
  const updateStatus = async (task: Task, status: string) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      showToast('Status updated');
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // ---- Edit (PM/Admin only) ----
  const openEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assignee ? String(task.assignee.id) : '',
      priority: task.priority,
      due_date: task.due_date || '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/tasks/${editingId}`, {
        title: editForm.title,
        description: editForm.description,
        assigned_to: editForm.assigned_to ? Number(editForm.assigned_to) : null,
        priority: editForm.priority,
        due_date: editForm.due_date || null,
      });
      showToast('Task updated');
      setEditOpen(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update task', 'error');
    }
  };

  // ---- View + Comments (everyone) ----
  const openView = (task: Task) => {
    setViewOpen(true);
    setViewLoading(true);
    setCommentText('');
    api.get(`/tasks/${task.id}`).then((res) => setViewTask(res.data)).finally(() => setViewLoading(false));
  };

  const refreshView = () => {
    if (!viewTask) return;
    api.get(`/tasks/${viewTask.id}`).then((res) => setViewTask(res.data));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewTask || !commentText.trim()) return;
    try {
      await api.post(`/tasks/${viewTask.id}/comments`, { comment: commentText });
      setCommentText('');
      refreshView();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      refreshView();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        {canManage && (
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + New Task
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Project</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Due</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <button onClick={() => openView(t)} className="text-slate-900 font-medium hover:text-blue-600 text-left">
                      {t.title}
                    </button>
                  </td>
                  <td className="p-3 text-slate-700">{t.project?.name}</td>
                  <td className="p-3 text-slate-700">{t.assignee?.name || 'Unassigned'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="p-3 text-slate-700">{t.due_date || '—'}</td>
                  <td className="p-3">
                    {t.status === 'completed' ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.completed}`}>Completed</span>
                    ) : (
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${statusColor[t.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {canManage && (
                      <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-blue-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">No tasks yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Task">
        <form onSubmit={handleCreate} className="space-y-3">
          <select
            required
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
            rows={3}
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
            Create task
          </button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <input
            placeholder="Task title"
            required
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          />
          <textarea
            placeholder="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
            rows={3}
          />
          <select
            value={editForm.assigned_to}
            onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
          <select
            value={editForm.priority}
            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={editForm.due_date}
            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
            Save changes
          </button>
        </form>
      </Modal>

      {/* View + comments modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={viewTask?.title || 'Task'}>
        {viewLoading || !viewTask ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[viewTask.priority]}`}>
                {viewTask.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[viewTask.status]}`}>
                {viewTask.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-600">{viewTask.description || 'No description.'}</p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Project: {viewTask.project?.name}</p>
              <p>Assignee: {viewTask.assignee?.name || 'Unassigned'}</p>
              <p>Due: {viewTask.due_date || '—'}</p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-sm font-medium text-slate-700 mb-2">Comments</p>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {viewTask.comments.length === 0 && (
                  <p className="text-xs text-slate-400">No comments yet.</p>
                )}
                {viewTask.comments.map((c) => (
                  <div key={c.id} className="flex items-start justify-between bg-slate-50 rounded-lg p-2">
                    <div>
                      <p className="text-xs font-medium text-slate-700">{c.user.name}</p>
                      <p className="text-sm text-slate-600">{c.comment}</p>
                    </div>
                    {(user?.id === c.user.id || user?.role?.name === 'Administrator') && (
                      <button onClick={() => handleDeleteComment(c.id)} className="text-slate-400 hover:text-red-600 shrink-0 ml-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
                <button type="submit" className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </ProtectedLayout>
  );
}