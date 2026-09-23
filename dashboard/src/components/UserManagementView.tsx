import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { User } from '@safereplay/shared';
import { fetchAdminUsers } from '../services/api';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error('Failed to load users', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Developer Workspace Users & Role Permissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin Management Console • Manage project roles, access permissions, and session scopes
          </p>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
              Admin
            </span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-slate-700 font-bold">Full Workspace Authority</p>
          <ul className="text-[11px] text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> View all sessions & audit logs</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Run AI root-cause analysis</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Execute sandbox fix verification</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Manage user role permissions</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
              Developer
            </span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-slate-700 font-bold">Engineering & Debugging</p>
          <ul className="text-[11px] text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Replay sessions & timelines</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Run AI root-cause analysis</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Execute sandbox fix verification</li>
            <li className="flex items-center gap-1.5 text-slate-400"><Lock className="w-3.5 h-3.5" /> Cannot manage users or global settings</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              Viewer
            </span>
            <ShieldAlert className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-700 font-bold">Read-Only Observation</p>
          <ul className="text-[11px] text-slate-600 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> View sessions and timelines</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> View network and privacy reports</li>
            <li className="flex items-center gap-1.5 text-slate-400"><Lock className="w-3.5 h-3.5" /> AI analysis restricted</li>
            <li className="flex items-center gap-1.5 text-slate-400"><Lock className="w-3.5 h-3.5" /> Fix verification restricted</li>
          </ul>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Workspace Accounts ({users.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Synced from SafeReplay Auth Service</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5 pl-5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Account ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'developer'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right font-mono text-slate-400 text-[11px]">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
