'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { formatShortDate } from '@/lib/utils.js';
import {
  UserCheck,
  Plus,
  Shield,
  Instagram,
  BarChart2,
  CheckCircle2,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';

export default function TeamPage() {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [outreachRecords, setOutreachRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Invite Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [assignedAccountIds, setAssignedAccountIds] = useState([]);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    loadData();
  }, []);

  const loadData = async () => {
    const [emps, accs, asgs, outs] = await Promise.all([
      db.getEmployees(),
      db.getAccounts(),
      db.getAssignments(),
      db.getOutreachRecords(),
    ]);
    setEmployees(emps);
    setAccounts(accs);
    setAssignments(asgs);
    setOutreachRecords(outs);
  };

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    try {
      const newEmp = await db.createEmployee({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
        assigned_account_ids: assignedAccountIds,
      });

      addToast({
        title: 'Staff Member Added',
        message: `${newEmp.full_name} has been added with ${assignedAccountIds.length} assigned accounts.`,
        type: 'success',
      });

      setIsInviteOpen(false);
      setFullName('');
      setEmail('');
      setRole('staff');
      setAssignedAccountIds([]);
      loadData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSaveAssignments = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      await db.updateAssignments(editingEmployee.id, assignedAccountIds);
      await db.updateEmployeeRole(editingEmployee.id, editingEmployee.role);

      addToast({
        title: 'Assignments Updated',
        message: `Updated accounts for ${editingEmployee.full_name}.`,
        type: 'success',
      });

      setEditingEmployee(null);
      loadData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee({ ...emp });
    const empAssigned = assignments
      .filter((asg) => asg.employee_id === emp.id)
      .map((asg) => asg.account_id);
    setAssignedAccountIds(empAssigned);
  };

  const toggleAccountSelection = (accId) => {
    if (assignedAccountIds.includes(accId)) {
      setAssignedAccountIds(assignedAccountIds.filter((id) => id !== accId));
    } else {
      setAssignedAccountIds([...assignedAccountIds, accId]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <Users className="h-3.5 w-3.5 text-tox-orange" />
            <span>Staff Permissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Team Roster & Account Access Control
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Manage staff credentials, multi-account permissions, roles (Admin / Manager / Staff), and individual outreach volume.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => {
              setFullName('');
              setEmail('');
              setRole('staff');
              setAssignedAccountIds([]);
              setIsInviteOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black font-semibold text-xs shadow-tox-orange transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tox-orange cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Team Roster Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dense-table">
            <thead>
              <tr className="border-b border-white/[0.08] bg-obsidian-950/60 font-mono text-xs text-zinc-400 font-medium">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Accounts</th>
                <th className="py-3.5 px-4">Total Outreach</th>
                <th className="py-3.5 px-4">Unique Influencers</th>
                <th className="py-3.5 px-4">Repeat Outreach</th>
                <th className="py-3.5 px-4">Estimated Active Days</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {employees.map((emp) => {
                const empOutreach = outreachRecords.filter((o) => o.employee_id === emp.id);
                const uniqueInfs = new Set(empOutreach.map((o) => o.influencer_id));
                const repeats = empOutreach.filter((o) => o.is_repeat_same_account);

                // Assigned accounts
                const assignedAccs = assignments
                  .filter((asg) => asg.employee_id === emp.id)
                  .map((asg) => accountMap.get(asg.account_id))
                  .filter(Boolean);

                return (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{emp.full_name}</span>
                          {emp.id === currentUser?.id && (
                            <Badge variant="primary" size="xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{emp.email}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          emp.role === 'admin'
                            ? 'danger'
                            : emp.role === 'manager'
                            ? 'warning'
                            : 'info'
                        }
                        size="xs"
                        className="uppercase font-mono font-medium"
                      >
                        {emp.role}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {emp.role === 'admin' || emp.role === 'manager' ? (
                        <span className="text-zinc-300 font-medium text-xs font-mono">
                          All Accounts ({accounts.length})
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {assignedAccs.length > 0 ? (
                            assignedAccs.map((acc) => (
                              <Badge key={acc.id} variant="default" size="xs">
                                {acc.account_name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-rose-400 font-medium text-xs font-mono">No accounts assigned</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-white">
                      {empOutreach.length}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-400">
                      {uniqueInfs.size}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      {repeats.length > 0 ? (
                        <Badge variant="repeat" size="xs">
                          <RotateCcw className="h-2.5 w-2.5" /> {repeats.length}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600 font-mono">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {empOutreach.length > 0 ? Math.ceil(empOutreach.length / 5) : 0} days
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => openEditModal(emp)}
                          className="text-xs text-tox-orange hover:text-tox-orange-hover font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          Edit Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee & Assignments Modal */}
      {editingEmployee && (
        <Modal
          isOpen={true}
          onClose={() => setEditingEmployee(null)}
          title={`Manage Access: ${editingEmployee.full_name}`}
          description="Configure role authorization level and assigned marketing accounts."
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveAssignments} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Authorization Role
              </label>
              <select
                value={editingEmployee.role}
                onChange={(e) =>
                  setEditingEmployee({ ...editingEmployee, role: e.target.value })
                }
                className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-tox-orange"
              >
                <option value="staff" className="bg-obsidian-950 text-white">Staff (Outreach logger, assigned accounts only)</option>
                <option value="manager" className="bg-obsidian-950 text-white">Manager (All accounts, analytics, staff assignments)</option>
                <option value="admin" className="bg-obsidian-950 text-white">Admin (Full system authority & configuration)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Assigned Marketing Accounts</span>
                <span className="text-[11px] font-normal text-zinc-500 font-mono">
                  {editingEmployee.role !== 'staff'
                    ? 'Admins & Managers automatically have access to all accounts'
                    : `${assignedAccountIds.length} accounts selected`}
                </span>
              </label>

              <div className="max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-obsidian-900/60 divide-y divide-white/[0.04] p-2 space-y-1">
                {accounts.map((acc) => {
                  const isChecked = assignedAccountIds.includes(acc.id);
                  return (
                    <label
                      key={acc.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAccountSelection(acc.id)}
                          className="rounded border-white/20 bg-obsidian-950 text-tox-orange focus:ring-tox-orange accent-tox-orange cursor-pointer"
                        />
                        <span className="font-semibold text-white">{acc.account_name}</span>
                        <span className="font-mono text-zinc-500 text-[11px]">@{acc.instagram_handle}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Team Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Team Member"
        description="Register an employee profile with initial account permissions."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rachel Green"
              className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rachel@thetoxtechnique.com"
              className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-tox-orange"
            >
              <option value="staff" className="bg-obsidian-950 text-white">Staff (Outreach logger)</option>
              <option value="manager" className="bg-obsidian-950 text-white">Manager (Team oversight & analytics)</option>
              <option value="admin" className="bg-obsidian-950 text-white">Admin (Full administrative control)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Assign Marketing Accounts (~10 recommended)
            </label>
            <div className="max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-obsidian-900/60 p-2 space-y-1">
              {accounts.map((acc) => {
                const isChecked = assignedAccountIds.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer text-xs transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAccountSelection(acc.id)}
                      className="rounded border-white/20 bg-obsidian-950 text-tox-orange focus:ring-tox-orange accent-tox-orange cursor-pointer"
                    />
                    <span className="font-semibold text-white">{acc.account_name}</span>
                    <span className="font-mono text-zinc-500 text-[10px]">@{acc.instagram_handle}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black text-xs font-semibold shadow-tox-orange transition-all cursor-pointer"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
