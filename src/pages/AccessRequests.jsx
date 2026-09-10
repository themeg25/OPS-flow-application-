import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { accessService } from '../api/accessService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusBadge, RecordIdBadge } from '../components/ui/Badge';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { Field, inputCls } from './DeploymentRequests';

const STATUS_FILTERS = [
  'ALL',
  'REQUESTED',
  'APPROVED',
  'IN_PROGRESS',
  'ACCESS_GIVEN',
  'REJECTED'
];

function getCurrentDateTime() {
  const now = new Date();

  return now.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
}

export default function AccessRequests() {
  const [params, setParams] = useSearchParams();
  const statusFilter = params.get('status') || 'ALL';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const { config } = useAuth();

  async function load() {
    setLoading(true);
    setError(null);

    try {
      setRecords(await accessService.list());
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
        : records.filter(r => r.Status === statusFilter),
    [records, statusFilter]
  );

  function expiryLabel(r) {
    if (r.Status !== 'ACCESS_GIVEN' || !r.ExpiryDate) return null;

    const days = Math.ceil(
      (new Date(r.ExpiryDate).getTime() - Date.now()) / 86400000
    );

    if (days <= 0) {
      return (
        <span className="text-xs font-semibold text-danger">
          Expired
        </span>
      );
    }

    return (
      <span
        className={`text-xs font-semibold ${
          days <= 10 ? 'text-warning' : 'text-ink-400'
        }`}
      >
        {days} days remaining
      </span>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Access Requests
          </h1>

          <p className="text-sm text-ink-400 mt-0.5">
            RDS, IAM, Jenkins and other access grants.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          + New Access Request
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(s => (
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
                icon="🔑"
                title="No access requests"
              />
            )}

            {!loading &&
              filtered.map(r => (
                <button
                  key={r['Record ID']}
                  onClick={() =>
                    navigate(`/access/${r['Record ID']}`)
                  }
                  className="w-full text-left px-4 py-3 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 hover:bg-ink-50"
                >
                  <span className="md:w-32">
                    <RecordIdBadge id={r['Record ID']} />
                  </span>

                  <span className="flex-1 text-sm text-ink-900 font-medium">
                    {r.AccessType}{' '}
                    <span className="text-ink-400 font-normal">
                      · {r.Project} · {r.Environment}
                    </span>
                  </span>

                  {expiryLabel(r)}

                  <span className="md:w-32">
                    <StatusBadge status={r.Status} />
                  </span>
                </button>
              ))}
          </div>
        </Card>
      )}

      <CreateAccessModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
        config={config}
      />
    </div>
  );
}

function CreateAccessModal({
  open,
  onClose,
  onCreated,
  config
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    accessType: '',
    project: '',
    environment: 'DEV',
    requestedDateTime: getCurrentDateTime(),
    userResource: '',
    permission: '',
    reason: '',
    expiryDate: getCurrentDateTimeLocal()
  });

  const [loading, setLoading] = useState(false);

  // Update current date/time whenever the modal is opened
  useEffect(() => {
    if (open) {
      const currentDisplayDateTime = getCurrentDateTime();
      const currentLocalDateTime = getCurrentDateTimeLocal();

      setForm(f => ({
        ...f,
        requestedDateTime: currentDisplayDateTime,
        expiryDate: currentLocalDateTime
      }));
    }
  }, [open]);

  function set(k, v) {
    setForm(f => ({
      ...f,
      [k]: v
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await accessService.create(form);

      toast.success(`${res.record['Record ID']} created.`);

      onCreated();
      onClose();

      const currentDisplayDateTime = getCurrentDateTime();
      const currentLocalDateTime = getCurrentDateTimeLocal();

      setForm({
        accessType: '',
        project: '',
        environment: 'DEV',
        requestedDateTime: currentDisplayDateTime,
        userResource: '',
        permission: '',
        reason: '',
        expiryDate: currentLocalDateTime
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
      title="New Access Request"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            onClick={submit}
          >
            Submit Request
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={submit}
      >
        {/* First row */}
        <div className="grid grid-cols-3 gap-3">

          {/* Access Type */}
          <Field
            label="Access Type"
            required
          >
            <select
              required
              value={form.accessType}
              onChange={(e) =>
                set('accessType', e.target.value)
              }
              className={inputCls}
            >
              <option value="">
                Select…
              </option>

              {(config?.accessTypes || []).map(a => (
                <option
                  key={a}
                  value={a}
                >
                  {a}
                </option>
              ))}
            </select>
          </Field>

          {/* Project / App */}
          <Field
            label="Project / App"
            required
          >
            <select
              required
              value={form.project}
              onChange={(e) =>
                set('project', e.target.value)
              }
              className={inputCls}
            >
              <option value="">
                Select…
              </option>

              {(config?.applications || []).map(a => (
                <option
                  key={a}
                  value={a}
                >
                  {a}
                </option>
              ))}
            </select>
          </Field>

          {/* Environment */}
          <Field
            label="Environment"
            required
          >
            <select
              value={form.environment}
              onChange={(e) =>
                set('environment', e.target.value)
              }
              className={inputCls}
            >
              {(config?.environments || []).map(e => (
                <option
                  key={e}
                  value={e}
                >
                  {e}
                </option>
              ))}
            </select>
          </Field>

        </div>

        {/* Date and Time row */}
        <div className="grid grid-cols-2 gap-3">

          {/* Current Date & Time - NO CALENDAR */}
          <Field label="Current Date & Time">
            <input
              type="text"
              value={form.requestedDateTime}
              readOnly
              className={`${inputCls} bg-ink-50 cursor-not-allowed`}
            />
          </Field>

          {/* Expiry Date & Time - CALENDAR */}
          <Field label="Expiry Date & Time">
            <input
              type="datetime-local"
              value={form.expiryDate}
              min={getCurrentDateTimeLocal()}
              onChange={(e) =>
                set('expiryDate', e.target.value)
              }
              className={inputCls}
            />
          </Field>

        </div>

        {/* User / Resource */}
        <Field
          label="User / Resource needing access"
          required
        >
          <input
            required
            value={form.userResource}
            onChange={(e) =>
              set('userResource', e.target.value)
            }
            className={inputCls}
          />
        </Field>

        {/* Permission */}
        <Field
          label="Permission Needed"
          required
        >
          <input
            required
            value={form.permission}
            onChange={(e) =>
              set('permission', e.target.value)
            }
            className={inputCls}
          />
        </Field>

        {/* Reason */}
        <Field
          label="Reason"
          required
        >
          <textarea
            required
            rows={3}
            value={form.reason}
            onChange={(e) =>
              set('reason', e.target.value)
            }
            className={inputCls}
          />
        </Field>

      </form>
    </Modal>
  );
}