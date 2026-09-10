import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { deploymentService } from '../api/deploymentService';
import { userService } from '../api/userService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Timeline from '../components/ui/Timeline';
import { StatusBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { inputCls } from './DeploymentRequests';

export default function DeploymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // { newStatus, title, requireReason, danger }
  const [devOpsUsers, setDevOpsUsers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try { setData(await deploymentService.get(id)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (user?.role === 'DevOps') userService.listDevOps().then(setDevOpsUsers).catch(() => {}); }, [user?.role]);

  async function doAction(newStatus, reason) {
    try {
      await deploymentService.updateStatus(id, newStatus, reason);
      toast.success(`Status updated to ${newStatus.replaceAll('_', ' ')}.`);
      setDialog(null);
      load();
    } catch (e) { toast.error(e.message); }
  }

  async function doDelete() {
    try { await deploymentService.softDelete(id); toast.success('Deployment deleted.'); navigate('/deployments'); }
    catch (e) { toast.error(e.message); }
  }

  if (loading) return <div className="grid gap-4 max-w-3xl"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const r = data.record;
  const isDevOps = user.role === 'DevOps';
  const actions = [];
  if (isDevOps) {
    if (r.Status === 'REQUESTED') {
      actions.push({ label: 'Approve', variant: 'primary', onClick: () => doAction('APPROVED') });
      actions.push({ label: 'Reject', variant: 'danger', onClick: () => setDialog({ newStatus: 'REJECTED', title: 'Reject deployment', requireReason: true, danger: true, confirmLabel: 'Reject' }) });
    }
    if (r.Status === 'APPROVED') actions.push({ label: 'Start Deployment', variant: 'primary', onClick: () => doAction('IN_PROGRESS') });
    if (r.Status === 'IN_PROGRESS') {
      actions.push({ label: 'Mark Success', variant: 'primary', onClick: () => doAction('COMPLETED_SUCCESS') });
      actions.push({ label: 'Mark Failed', variant: 'danger', onClick: () => setDialog({ newStatus: 'COMPLETED_FAILED', title: 'Mark deployment failed', requireReason: true, danger: true, confirmLabel: 'Mark Failed' }) });
      actions.push({ label: 'Rollback', variant: 'secondary', onClick: () => setDialog({ newStatus: 'ROLLED_BACK', title: 'Roll back deployment', requireReason: true, confirmLabel: 'Roll Back' }) });
    }
  }
  if (isAdmin) actions.push({ label: 'Delete', variant: 'ghost', onClick: doDelete });

  return (
    <div className="space-y-5 max-w-6xl animate-fade-in">
      <button onClick={() => navigate('/deployments')} className="text-xs text-ink-400 hover:text-ink-700 font-medium">← Back to deployments</button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-ink-900 font-mono">{r['Record ID']}</h1>
            <StatusBadge status={r.Status} />
          </div>
          <p className="text-sm text-ink-400 mt-1">{r.Project} · {r.Environment} · {r.Component}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {actions.map(a => <Button key={a.label} variant={a.variant} size="sm" onClick={a.onClick}>{a.label}</Button>)}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Request Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <DL label="Scheduled" value={r.DateTime ? new Date(r.DateTime).toLocaleString() : '—'} />
              <DL label="GitHub URL" value={r.GitHubURL ? <a href={r.GitHubURL} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline break-all">{r.GitHubURL}</a> : '—'} />
              <DL label="DB / Schema Change" value={String(r.DBChange) === 'true' ? 'Yes' : 'No'} />
              {String(r.DBChange) === 'true' && <DL label="Details" value={r.DBChangeDetails || '—'} span />}
              <DL label="Env Var Change" value={String(r.EnvVarChange) === 'true' ? 'Yes' : 'No'} />
              {String(r.EnvVarChange) === 'true' && <DL label="Details" value={r.EnvVarDetails || '—'} span />}
              {r.AdditionalInfo && <DL label="Additional Info" value={r.AdditionalInfo} span />}
              {r.RejectionReason && <DL label="Rejection Reason" value={r.RejectionReason} span />}
              {r.FailureReason && <DL label="Failure Reason" value={r.FailureReason} span />}
              {r.RollbackReason && <DL label="Rollback Reason" value={r.RollbackReason} span />}
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Audit Timeline</h3>
            <Timeline entries={data.audit} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Assignment</h3>
            <dl className="space-y-3 text-sm">
              <DL label="Requester" value={r.RequesterID} />
              <DL label="Assigned DevOps" value={devOpsUsers.find(u => u.id === r.AssignedDevOpsID)?.name || r.AssignedDevOpsID || 'Unassigned'} />
              <DL label="Created" value={new Date(r.CreatedAt).toLocaleString()} />
              <DL label="Last Updated" value={r.UpdatedAt ? new Date(r.UpdatedAt).toLocaleString() : '—'} />
            </dl>
            {isDevOps && devOpsUsers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ink-100">
                <label className="block text-xs font-medium text-ink-600 mb-1.5">Reassign deployment</label>
                <select disabled={assigning} value={r.AssignedDevOpsID || ''} onChange={async e => {
                  const next = e.target.value;
                  if (!next) return;
                  setAssigning(true);
                  try { await deploymentService.reassign(id, next); toast.success('Deployment reassigned.'); await load(); } catch (err) { toast.error(err.message); } finally { setAssigning(false); }
                }} className={inputCls}>
                  <option value="">Select DevOps user…</option>
                  {devOpsUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                </select>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => doAction(dialog.newStatus, reason)}
        title={dialog?.title}
        requireReason={dialog?.requireReason}
        danger={dialog?.danger}
        confirmLabel={dialog?.confirmLabel}
      />
    </div>
  );
}

export function DL({ label, value, span }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-xs text-ink-400 mb-0.5">{label}</dt>
      <dd className="text-ink-900 font-medium break-words">{value}</dd>
    </div>
  );
}
