import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { userService } from '../api/userService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { StatusBadge } from '../components/ui/Badge';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  async function load() {
    setLoading(true); setError(null);
    try { setUsers(await userService.list()); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const pending = users.filter(u => u.status === 'PENDING');
  const others = users.filter(u => u.status !== 'PENDING');

  async function toggleActive(u) {
    try { await userService.setActive(u.id, !u.active); toast.success(`${u.name} ${u.active ? 'deactivated' : 'activated'}.`); load(); }
    catch (e) { toast.error(e.message); }
  }
  async function changeRole(u, role) {
    try { await userService.update(u.id, role, role === 'DevOps' ? u.power : false); toast.success(`${u.name}'s role updated.`); load(); }
    catch (e) { toast.error(e.message); }
  }
  async function togglePower(u) {
    try { await userService.update(u.id, u.role, !u.power); toast.success(`${u.name}'s admin power ${!u.power ? 'granted' : 'revoked'}.`); load(); }
    catch (e) { toast.error(e.message); }
  }
  async function doReject(reason) {
    try { await userService.reject(rejectTarget.id, reason); toast.success('Registration rejected.'); setRejectTarget(null); load(); }
    catch (e) { toast.error(e.message); }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-ink-900">User Management</h1>
        <p className="text-sm text-ink-400 mt-0.5">Approve registrations, assign roles, and manage DevOps admin power.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Pending Registrations {pending.length > 0 && <span className="text-warning">({pending.length})</span>}</h2>
        <Card className="divide-y divide-ink-100">
          {loading && Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)}
          {!loading && pending.length === 0 && <EmptyState icon="✅" title="No pending registrations" />}
          {!loading && pending.map(u => (
            <div key={u.id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900">{u.name}</p>
                <p className="text-xs text-ink-400">{u.email}{u.mobile ? ` · ${u.mobile}` : ''}</p>
                {u.requestedRole && <p className="text-[11px] text-brand-600 mt-0.5">Requested role: {u.requestedRole}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setApproveTarget(u)}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => setRejectTarget(u)}>Reject</Button>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Existing Users</h2>
        <Card className="overflow-hidden">
          <div className="hidden md:flex px-4 py-2.5 border-b border-ink-100 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            <span className="flex-1">User</span><span className="w-36">Role</span><span className="w-24">Admin</span><span className="w-28">Status</span><span className="w-24">Action</span>
          </div>
          <div className="divide-y divide-ink-100">
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            {!loading && others.map(u => (
              <div key={u.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{u.name}</p>
                  <p className="text-xs text-ink-400">{u.email}{u.mobile ? ` · ${u.mobile}` : ''}</p>
                </div>
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="md:w-36 border border-ink-200 rounded-lg px-2 py-1.5 text-xs">
                  <option value="Developer">Developer</option><option value="QA">QA</option><option value="DevOps">DevOps</option>
                </select>
                <div className="md:w-24">
                  {u.role === 'DevOps' && (
                    <button onClick={() => togglePower(u)} className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${u.power ? 'bg-brand-50 text-brand-600 border-brand-200' : 'bg-white text-ink-500 border-ink-200'}`}>
                      {u.power ? 'Admin ✓' : 'Grant Admin'}
                    </button>
                  )}
                </div>
                <div className="md:w-28"><StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} /></div>
                <div className="md:w-24">
                  <Button size="sm" variant={u.active ? 'ghost' : 'subtle'} onClick={() => toggleActive(u)}>{u.active ? 'Deactivate' : 'Activate'}</Button>
                </div>
              </div>
            ))}
            {!loading && others.length === 0 && <EmptyState title="No users yet" />}
          </div>
        </Card>
      </section>

      <ApproveModal user={approveTarget} onClose={() => setApproveTarget(null)} onDone={load} />
      <ConfirmDialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={doReject}
        title={`Reject ${rejectTarget?.name}'s registration`} requireReason danger confirmLabel="Reject" />
    </div>
  );
}

function ApproveModal({ user, onClose, onDone }) {
  const toast = useToast();
  const [role, setRole] = useState('Developer');
  const [power, setPower] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill with whatever role the person requested at sign-up, if any.
  useEffect(() => { if (user) setRole(user.requestedRole || 'Developer'); }, [user]);

  async function submit() {
    setLoading(true);
    try { await userService.approve(user.id, role, power); toast.success(`${user.name} approved as ${role}.`); onDone(); onClose(); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open={!!user} onClose={onClose} title={`Approve ${user?.name}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={loading} onClick={submit}>Approve</Button></>}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Assign Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm">
            <option value="Developer">Developer</option><option value="QA">QA</option><option value="DevOps">DevOps</option>
          </select>
        </div>
        {role === 'DevOps' && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={power} onChange={(e) => setPower(e.target.checked)} />
            Grant DevOps Admin power (normally only one user should have this)
          </label>
        )}
      </div>
    </Modal>
  );
}
