'use client';

import { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { UserCircle, Mail, Shield, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      const res = await api.put('/profile', payload);
      updateUser(res.data);
      setPassword('');
      setPasswordConfirmation('');
      showToast('Profile updated');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>

      <div className="max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              {user?.role?.name || 'No role assigned'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <div className="relative">
              <UserCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-700 mb-3 mt-4">Change password</p>
            <div className="space-y-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" placeholder="New password (leave blank to keep current)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              {password && (
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" placeholder="Confirm new password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </ProtectedLayout>
  );
}