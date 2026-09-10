import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { accessService } from '../api/accessService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Timeline from '../components/ui/Timeline';
import { StatusBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { DL } from './DeploymentDetail';

export default function AccessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null);

  async function load() {
    setLoading(true); setError(null);
    try { setData(await accessService.get(id)); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function doAction(newStatus, reason) {
    try { await accessService.updateStatus(id, newStatus, reason); toast.success(`Status updated to ${newStatus.replaceAll('_', ' ')}.`); setDialog(null); load(); }
    catch (e) { toast.error(e.message); }
  }
  async function doDelete() {
    try { await accessService.softDelete(id); toast.success('Access request deleted.'); navigate('/access'); } catch (e) { toast.error(e.message); }
  }

  if (loading) return <div className="grid gap-4 max-w-3xl"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const r = data.record;
  const isDevOps = user.role === 'DevOps';
  const actions = [];
  if (isDevOps) {
    if (r.Status === 'REQUESTED') {
      actions.push({ label: 'Approve', variant: 'primary', onClick: () => doAction('APPROVED') });
      actions.push({ label: 'Reject', variant: 'danger', onClick: () => setDialog({ newStatus: 'REJECTED', title: 'Reject access request', requireReason: true, danger: true, confirmLabel: 'Reject' }) });
    }
    if (r.Status === 'APPROVED') actions.push({ label: 'Start Processing', variant: 'primary', onClick: () => doAction('IN_PROGRESS') });
    if (r.Status === 'IN_PROGRESS') actions.push({ label: 'Mark Access Given', variant: 'primary', onClick: () => doAction('ACCESS_GIVEN') });
  }
  if (isAdmin) actions.push({ label: 'Delete', variant: 'ghost', onClick: doDelete });

  const days = r.ExpiryDate ? Math.ceil((new Date(r.ExpiryDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      <button onClick={() => navigate('/access')} className="text-xs text-ink-400 hover:text-ink-700 font-medium">← Back to access requests</button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-ink-900 font-mono">{r['Record ID']}</h1>
            <StatusBadge status={r.Status} />
          </div>
          <p className="text-sm text-ink-400 mt-1">{r.AccessType} · {r.Project} · {r.Environment}</p>
        </div>
        <div className="flex gap-2 flex-wrap">{actions.map(a => <Button key={a.label} variant={a.variant} size="sm" onClick={a.onClick}>{a.label}</Button>)}</div>
      </div>

      {days !== null && r.Status === 'ACCESS_GIVEN' && (
        <div className={`text-sm rounded-lg px-3 py-2 inline-block ${days <= 3 ? 'bg-danger-bg text-danger-text' : days <= 10 ? 'bg-warning-bg text-warning-text' : 'bg-info-bg text-info-text'}`}>
          {days <= 0 ? 'Access has expired' : `${days} days remaining before expiry`}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Request Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <DL label="User / Resource" value={r.UserResource} />
              <DL label="Permission Needed" value={r.Permission} />
              <DL label="Expiry Date" value={r.ExpiryDate || 'No expiry'} />
              <DL label="Reason" value={r.Reason} span />
              {r.RejectionReason && <DL label="Rejection Reason" value={r.RejectionReason} span />}
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Audit Timeline</h3>
            <Timeline entries={data.audit} />
          </Card>
        </div>
        <div>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Info</h3>
            <dl className="space-y-3 text-sm">
              <DL label="Requester" value={r.RequesterID} />
              <DL label="Created" value={new Date(r.CreatedAt).toLocaleString()} />
              <DL label="Last Updated" value={r.UpdatedAt ? new Date(r.UpdatedAt).toLocaleString() : '—'} />
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={!!dialog} onClose={() => setDialog(null)} onConfirm={(reason) => doAction(dialog.newStatus, reason)}
        title={dialog?.title} requireReason={dialog?.requireReason} danger={dialog?.danger} confirmLabel={dialog?.confirmLabel} />
    </div>
  );
}
