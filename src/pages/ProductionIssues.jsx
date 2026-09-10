import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productionIssueService } from '../api/issueService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
  StatusBadge,
  RecordIdBadge,
  PriorityBadge
} from '../components/ui/Badge';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { Field, inputCls } from './DeploymentRequests';

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

export default function ProductionIssues() {
  const [params, setParams] = useSearchParams();
  const statusFilter = params.get('status') || 'ALL';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const navigate = useNavigate();
  const { config, user } = useAuth();

  async function load() {
    setLoading(true);
    setError(null);

    try {
      setRecords(await productionIssueService.list());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      statusFilter === 'ALL'
        ? records
        : records.filter((r) => r.Status === statusFilter),
    [records, statusFilter]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Production Issues
          </h1>

          <p className="text-sm text-ink-400 mt-0.5">
            PROD only — managed exclusively by DevOps.
          </p>
        </div>

        {/* Only DevOps users can create Production Issues */}
        {user.role === 'DevOps' && (
          <Button onClick={() => setCreateOpen(true)}>
            + New Production Issue
          </Button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() =>
              setParams(s === 'ALL' ? {} : { status: s })
            }
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
            ${
              statusFilter === s
                ? 'bg-ink-900 text-white border-ink-900'
                : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replaceAll('_', ' ')}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-ink-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}

            {!loading && filtered.length === 0 && (
              <EmptyState
                icon="🚨"
                title="No production issues"
                description="Hopefully it stays that way."
              />
            )}

            {!loading &&
              filtered.map((r) => (
                <button
                  key={r['Record ID']}
                  onClick={() =>
                    navigate(`/production/${r['Record ID']}`)
                  }
                  className="w-full text-left px-4 py-3 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 hover:bg-ink-50"
                >
                  <span className="md:w-32">
                    <RecordIdBadge id={r['Record ID']} />
                  </span>

                  <span className="flex-1 text-sm text-ink-900 font-medium truncate">
                    {r.ErrorMessage}{' '}
                    <span className="text-ink-400 font-normal">
                      · {r.Project}
                    </span>
                  </span>

                  <PriorityBadge priority={r.Priority} />

                  <span className="md:w-32">
                    <StatusBadge status={r.Status} />
                  </span>
                </button>
              ))}
          </div>
        </Card>
      )}

      <CreateProdIssueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
        config={config}
      />
    </div>
  );
}

function CreateProdIssueModal({
  open,
  onClose,
  onCreated,
  config
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    project: '',
    errorMessage: '',
    symptoms: '',
    impact: '',
    priority: 'High',
    linkedDeploymentId: ''
  });

  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((f) => ({
      ...f,
      [k]: v
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await productionIssueService.create(form);

      toast.success(`${res.record['Record ID']} created.`);

      onCreated();
      onClose();

      setForm({
        project: '',
        errorMessage: '',
        symptoms: '',
        impact: '',
        priority: 'High',
        linkedDeploymentId: ''
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Production Issue"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button loading={loading} onClick={submit}>
            Submit Issue
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Project / App" required>
          <select
            required
            value={form.project}
            onChange={(e) => set('project', e.target.value)}
            className={inputCls}
          >
            <option value="">Select…</option>

            {(config?.applications || []).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Error / Message" required>
          <input
            required
            value={form.errorMessage}
            onChange={(e) =>
              set('errorMessage', e.target.value)
            }
            className={inputCls}
          />
        </Field>

        <Field label="Symptoms">
          <textarea
            rows={2}
            value={form.symptoms}
            onChange={(e) =>
              set('symptoms', e.target.value)
            }
            className={inputCls}
          />
        </Field>

        <Field label="Impact">
          <textarea
            rows={2}
            value={form.impact}
            onChange={(e) =>
              set('impact', e.target.value)
            }
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority" required>
            <select
              value={form.priority}
              onChange={(e) =>
                set('priority', e.target.value)
              }
              className={inputCls}
            >
              {(
                config?.priorities || [
                  'Low',
                  'Medium',
                  'High',
                  'Critical'
                ]
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Linked Deployment ID">
            <input
              value={form.linkedDeploymentId}
              onChange={(e) =>
                set('linkedDeploymentId', e.target.value)
              }
              placeholder="DEP-000123 (optional)"
              className={inputCls}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}