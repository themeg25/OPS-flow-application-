import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { deploymentService } from '../api/deploymentService';
import { userService } from '../api/userService';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { StatusBadge, RecordIdBadge } from '../components/ui/Badge';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const STATUS_FILTERS = [
  'ALL',
  'REQUESTED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED_SUCCESS',
  'COMPLETED_FAILED',
  'REJECTED',
  'ROLLED_BACK',
];

export default function DeploymentRequests() {
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
      const data = await deploymentService.list();
      setRecords(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') {
      return records;
    }

    return records.filter(
      (r) => r.Status === statusFilter
    );
  }, [records, statusFilter]);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Deployment Requests
          </h1>

          <p className="text-sm text-ink-400 mt-0.5">
            Track deployments from request through rollout.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          + New Deployment
        </Button>
      </div>


      {/* =====================================================
          STATUS FILTERS
      ====================================================== */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() =>
              setParams(
                s === 'ALL'
                  ? {}
                  : { status: s }
              )
            }
            className={`
              shrink-0
              px-3
              py-1.5
              rounded-lg
              text-xs
              font-semibold
              border
              transition-colors

              ${
                statusFilter === s
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'
              }
            `}
          >
            {s === 'ALL'
              ? 'All'
              : s.replaceAll('_', ' ')}
          </button>
        ))}
      </div>


      {/* =====================================================
          REQUEST LIST
      ====================================================== */}
      {error ? (
        <ErrorState
          message={error}
          onRetry={load}
        />
      ) : (
        <Card className="overflow-hidden">

          {/* TABLE HEADER */}
          <div
            className="
              hidden
              md:flex
              px-4
              py-2.5
              border-b
              border-ink-100
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-ink-400
            "
          >
            <span className="w-32">
              ID
            </span>

            <span className="flex-1">
              Project / Env
            </span>

            <span className="w-40">
              Requested
            </span>

            <span className="w-32">
              Status
            </span>
          </div>


          {/* TABLE BODY */}
          <div className="divide-y divide-ink-100">

            {/* LOADING */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}


            {/* EMPTY */}
            {!loading &&
              filtered.length === 0 && (
                <EmptyState
                  icon="🚀"
                  title="No deployment requests"
                  description="Create one to get started."
                />
              )}


            {/* DATA */}
            {!loading &&
              filtered.map((r) => (
                <button
                  key={r['Record ID']}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/deployments/${r['Record ID']}`
                    )
                  }
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    gap-1.5
                    md:gap-3
                    hover:bg-ink-50
                  "
                >

                  <span className="md:w-32">
                    <RecordIdBadge
                      id={r['Record ID']}
                    />
                  </span>


                  <span
                    className="
                      flex-1
                      text-sm
                      text-ink-900
                      font-medium
                    "
                  >
                    {r.Project}

                    <span
                      className="
                        text-ink-400
                        font-normal
                      "
                    >
                      {' '}
                      · {r.Environment}
                    </span>
                  </span>


                  <span
                    className="
                      md:w-40
                      text-xs
                      text-ink-400
                      font-mono
                    "
                  >
                    {r.DateTime
                      ? new Date(
                          r.DateTime
                        ).toLocaleString()
                      : '—'}
                  </span>


                  <span className="md:w-32">
                    <StatusBadge
                      status={r.Status}
                    />
                  </span>

                </button>
              ))}
          </div>
        </Card>
      )}


      {/* =====================================================
          CREATE DEPLOYMENT MODAL
      ====================================================== */}
      <CreateDeploymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
        config={config}
      />

    </div>
  );
}


/* ============================================================
   CREATE DEPLOYMENT MODAL
============================================================ */

function CreateDeploymentModal({
  open,
  onClose,
  onCreated,
  config,
}) {
  const toast = useToast();

  const [form, setForm] = useState({
    project: '',
    component: 'Frontend',
    environment: 'DEV',
    dateTime: '',
    githubUrl: '',

    dbChange: false,
    dbChangeDetails: '',

    envVarChange: false,
    envVarDetails: '',

    additionalInfo: '',
    assignedDevOpsId: '',
  });

  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);

  const [devOpsUsers, setDevOpsUsers] = useState([]);
  const [devOpsLoading, setDevOpsLoading] = useState(false);


  /* ==========================================================
     LOAD DEVOPS USERS
  ========================================================== */

  useEffect(() => {
    if (!open) return;

    let active = true;

    setDevOpsLoading(true);

    userService
      .listDevOps()
      .then((users) => {
        if (active) {
          setDevOpsUsers(users || []);
        }
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        if (active) {
          setDevOpsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open]);


  /* ==========================================================
     FORM SETTER
  ========================================================== */

  function set(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }


  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function submit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res =
        await deploymentService.create(form);

      if (res.conflict) {
        setConflict(
          res.conflict.message
        );
      }

      toast.success(
        `${res.record['Record ID']} created.`
      );

      onCreated();
      onClose();

      setForm({
        project: '',
        component: 'Frontend',
        environment: 'DEV',
        dateTime: '',
        githubUrl: '',

        dbChange: false,
        dbChangeDetails: '',

        envVarChange: false,
        envVarDetails: '',

        additionalInfo: '',
        assignedDevOpsId: '',
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
      title="New Deployment Request"
      width="max-w-xl"
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

      {/* =====================================================
          CONFLICT MESSAGE
      ====================================================== */}

      {conflict && (
        <div
          className="
            mb-3
            text-xs
            bg-warning-bg
            text-warning-text
            rounded-lg
            px-3
            py-2
          "
        >
          ⚠️ Potential deployment conflict —{' '}
          {conflict}
        </div>
      )}


      {/* =====================================================
          FORM
      ====================================================== */}

      <form
        className="space-y-4"
        onSubmit={submit}
      >

        {/* PROJECT + COMPONENT + ENVIRONMENT + DATE */}
        <div className="grid grid-cols-2 gap-3">

          {/* PROJECT */}
          <Field
            label="Project / App"
            required
          >
            <select
              required
              value={form.project}
              onChange={(e) =>
                set(
                  'project',
                  e.target.value
                )
              }
              className={inputCls}
            >
              <option value="">
                Select…
              </option>

              {(config?.applications || []).map(
                (application) => (
                  <option
                    key={application}
                    value={application}
                  >
                    {application}
                  </option>
                )
              )}
            </select>
          </Field>


          {/* FRONTEND / BACKEND */}
          <Field
            label="Frontend / Backend"
            required
          >
            <select
              value={form.component}
              onChange={(e) =>
                set(
                  'component',
                  e.target.value
                )
              }
              className={inputCls}
            >
              <option>
                Frontend
              </option>

              <option>
                Backend
              </option>
            </select>
          </Field>


          {/* ENVIRONMENT */}
          <Field
            label="Environment"
            required
          >
            <select
              value={form.environment}
              onChange={(e) =>
                set(
                  'environment',
                  e.target.value
                )
              }
              className={inputCls}
            >
              {(config?.environments || []).map(
                (environment) => (
                  <option
                    key={environment}
                    value={environment}
                  >
                    {environment}
                  </option>
                )
              )}
            </select>
          </Field>


          {/* DATE & TIME */}
          <Field
            label="Date & Time"
            required
          >
            <input
              required
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) =>
                set(
                  'dateTime',
                  e.target.value
                )
              }
              className={inputCls}
            />
          </Field>

        </div>


        {/* ===================================================
            GITHUB URL
        ==================================================== */}

        <Field label="GitHub URL">
          <input
            value={form.githubUrl}
            onChange={(e) =>
              set(
                'githubUrl',
                e.target.value
              )
            }
            placeholder="Reference only"
            className={inputCls}
          />
        </Field>


        {/* ===================================================
            YES / NO TOGGLES
        ==================================================== */}

        <div className="grid grid-cols-2 gap-3">

          <ToggleField
            label="DB / Schema Change"
            value={form.dbChange}
            onChange={(value) =>
              set(
                'dbChange',
                value
              )
            }
          />

          <ToggleField
            label="Environment Variable Change"
            value={form.envVarChange}
            onChange={(value) =>
              set(
                'envVarChange',
                value
              )
            }
          />

        </div>


        {/* ===================================================
            DB DETAILS
        ==================================================== */}

        {form.dbChange && (
          <Field label="DB / Schema Details">

            <textarea
              rows={2}
              value={form.dbChangeDetails}
              onChange={(e) =>
                set(
                  'dbChangeDetails',
                  e.target.value
                )
              }
              className={inputCls}
            />

          </Field>
        )}


        {/* ===================================================
            ENV VARIABLE DETAILS
        ==================================================== */}

        {form.envVarChange && (
          <Field
            label="Environment Variable Details"
          >

            <textarea
              rows={2}
              value={form.envVarDetails}
              onChange={(e) =>
                set(
                  'envVarDetails',
                  e.target.value
                )
              }
              className={inputCls}
            />

          </Field>
        )}


        {/* ===================================================
            DEVOPS PICKER
        ==================================================== */}

        <DevOpsPicker
          users={devOpsUsers}
          loading={devOpsLoading}
          value={form.assignedDevOpsId}
          onChange={(value) =>
            set(
              'assignedDevOpsId',
              value
            )
          }
        />


        {/* ===================================================
            ADDITIONAL INFORMATION
        ==================================================== */}

        <Field label="Additional Information">

          <textarea
            rows={2}
            value={form.additionalInfo}
            onChange={(e) =>
              set(
                'additionalInfo',
                e.target.value
              )
            }
            className={inputCls}
          />

        </Field>

      </form>
    </Modal>
  );
}


/* ============================================================
   DEVOPS PICKER
============================================================ */

function DevOpsPicker({
  users,
  loading,
  value,
  onChange,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected =
    users.find(
      (user) => user.id === value
    );

  const filtered =
    users.filter((user) =>
      [
        user.name,
        user.email,
        user.mobile,
      ].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
      )
    );


  return (
    <Field label="Assigned DevOps">

      <div className="relative">

        {/* SELECT BUTTON */}
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          className={`
            ${inputCls}
            text-left
            flex
            items-center
            justify-between
            gap-2
            bg-white
          `}
        >

          <span
            className={
              selected
                ? 'text-ink-900'
                : 'text-ink-400'
            }
          >
            {selected
              ? selected.name
              : 'Select a DevOps person…'}
          </span>

          <span className="text-ink-400">
            ⌄
          </span>

        </button>


        {/* DROPDOWN */}
        {open && (
          <div
            className="
              absolute
              z-40
              mt-1
              w-full
              bg-white
              border
              border-ink-200
              rounded-xl2
              shadow-popover
              overflow-hidden
            "
          >

            {/* SEARCH */}
            <div
              className="
                p-2
                border-b
                border-ink-100
              "
            >
              <input
                autoFocus
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                placeholder="Search name, email or mobile…"
                className={inputCls}
              />
            </div>


            {/* USERS */}
            <div
              className="
                max-h-52
                overflow-y-auto
              "
            >

              {/* UNASSIGNED */}
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="
                  w-full
                  text-left
                  px-3
                  py-2.5
                  text-xs
                  text-ink-500
                  hover:bg-ink-50
                "
              >
                Unassigned
              </button>


              {/* LOADING */}
              {loading && (
                <div
                  className="
                    px-3
                    py-3
                    text-xs
                    text-ink-400
                  "
                >
                  Loading DevOps users…
                </div>
              )}


              {/* EMPTY */}
              {!loading &&
                filtered.length === 0 && (
                  <div
                    className="
                      px-3
                      py-3
                      text-xs
                      text-ink-400
                    "
                  >
                    No matching active
                    DevOps users.
                  </div>
                )}


              {/* USERS */}
              {!loading &&
                filtered.map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => {
                      onChange(user.id);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="
                      w-full
                      text-left
                      px-3
                      py-2.5
                      hover:bg-brand-50
                      border-t
                      border-ink-100
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-medium
                        text-ink-900
                      "
                    >
                      {user.name}
                    </p>

                    <p
                      className="
                        text-[11px]
                        text-ink-400
                      "
                    >
                      {user.email}

                      {user.mobile
                        ? ` · ${user.mobile}`
                        : ''}
                    </p>

                  </button>
                ))}
            </div>

          </div>
        )}

      </div>
    </Field>
  );
}


/* ============================================================
   INPUT CLASS
============================================================ */

export const inputCls = `
  w-full
  border
  border-ink-200
  rounded-lg
  px-3
  py-2
  text-sm
  focus:border-brand-500
  focus:ring-1
  focus:ring-brand-500
  outline-none
`;


/* ============================================================
   FIELD
============================================================ */

export function Field({
  label,
  required,
  children,
}) {
  return (
    <div>

      <label
        className="
          block
          text-xs
          font-medium
          text-ink-600
          mb-1.5
        "
      >
        {label}{' '}

        {required && (
          <span className="text-danger">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


/* ============================================================
   YES / NO TOGGLE
============================================================ */

export function ToggleField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      {/* LABEL */}
      <label
        className="
          block
          text-xs
          font-medium
          text-ink-600
          mb-1.5
        "
      >
        {label}
      </label>


      <div className="flex gap-1.5">

        {/* ==================================================
            YES BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() => onChange(true)}
          className={`
            flex-1
            py-2
            rounded-lg
            text-xs
            font-semibold
            border
            transition-all
            duration-150
            focus:outline-none

            ${
              value
                ? `
                  bg-blue-600
                  text-white
                  border-blue-600
                  shadow-sm
                `
                : `
                  bg-blue-50
                  text-blue-700
                  border-blue-200
                  hover:bg-blue-100
                  hover:border-blue-300
                `
            }
          `}
        >
          Yes
        </button>


        {/* ==================================================
            NO BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`
            flex-1
            py-2
            rounded-lg
            text-xs
            font-semibold
            border
            transition-all
            duration-150
            focus:outline-none

            ${
              !value
                ? `
                  bg-red-100
                  text-red-700
                  border-red-300
                  shadow-sm
                  hover:bg-red-600
                  hover:text-white
                  hover:border-red-600
                `
                : `
                  bg-white
                  text-ink-500
                  border-ink-200
                  hover:bg-red-50
                  hover:text-red-600
                  hover:border-red-300
                `
            }
          `}
        >
          No
        </button>

      </div>
    </div>
  );
}