'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Role { id: number; name: string; }
interface User { id: number; name: string; email: string; status: string; role: Role | null; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '', status: 'active' });
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get('/users').then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Roles aren't exposed via a dedicated endpoint yet; hardcode from seeder for now
    setRoles([
      { id: 1, name: 'Administrator' },
      { id: 2, name: 'Project Manager' },
      { id: 3, name: 'Team Member' },
    ]);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role_id: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role ? String(user.role.id) : '',
      status: user.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...form, role_id: Number(form.role_id) };
      if (!payload.password) delete payload.password;

      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
        showToast('User updated');
      } else {
        await api.post('/users', payload);
        showToast('User created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      showToast('User deleted');
      load();
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <ProtectedLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role?.name || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="password"
            placeholder={editing ? 'New password (leave blank to keep)' : 'Password'}
            required={!editing}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            required
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
            {editing ? 'Save changes' : 'Create user'}
          </button>
        </form>
      </Modal>
    </ProtectedLayout>
  );
}