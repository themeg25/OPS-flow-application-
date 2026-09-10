import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deploymentService } from '../api/deploymentService';
import { accessService } from '../api/accessService';
import { issueService, productionIssueService } from '../api/issueService';
import Card from '../components/ui/Card';
import { StatusBadge, RecordIdBadge } from '../components/ui/Badge';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const TYPE_ROUTE = {
  DEPLOYMENT: 'deployments',
  ACCESS: 'access',
  ISSUE: 'issues',
  PRODUCTION_ISSUE: 'production'
};

const TYPE_LABEL = {
  DEPLOYMENT: 'Deployment',
  ACCESS: 'Access',
  ISSUE: 'Issue',
  PRODUCTION_ISSUE: 'Production Issue'
};

function greeting() {
  const h = new Date().getHours();

  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';

  return 'Good evening';
}

/* =========================================================
   SCROLLABLE DASHBOARD BOX
   ========================================================= */
function ScrollableCard({
  children,
  className = '',
  maxHeight = 'max-h-[300px]'
}) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={`
          ${maxHeight}
          overflow-y-auto
          overflow-x-hidden
          pr-1
          ${className}
        `}
        style={{
          scrollbarWidth: 'thin'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: true,
    error: null,
    deployments: [],
    access: [],
    issues: [],
    prod: []
  });

  async function load() {
    setState(s => ({
      ...s,
      loading: true,
      error: null
    }));

    try {
      const [
        deployments,
        access,
        issues,
        prod
      ] = await Promise.all([
        deploymentService.list(),
        accessService.list(),
        issueService.list(),
        productionIssueService.list()
      ]);

      setState({
        loading: false,
        error: null,
        deployments,
        access,
        issues,
        prod
      });
    } catch (e) {
      setState(s => ({
        ...s,
        loading: false,
        error: e.message
      }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const {
      deployments,
      access,
      issues,
      prod
    } = state;

    return {
      pendingDeployments:
        deployments.filter(
          d => d.Status === 'REQUESTED'
        ).length,

      pendingAccess:
        access.filter(
          a => a.Status === 'REQUESTED'
        ).length,

      inProgress:
        [...deployments, ...access].filter(
          r => r.Status === 'IN_PROGRESS'
        ).length,

      failedDeployments:
        deployments.filter(
          d => d.Status === 'COMPLETED_FAILED'
        ).length,

      successfulDeployments:
        deployments.filter(
          d => d.Status === 'COMPLETED_SUCCESS'
        ).length,

      openIssues:
        [...issues, ...prod].filter(
          i => ['OPEN', 'IN_PROGRESS'].includes(i.Status)
        ).length
    };
  }, [state]);

  /* =========================================================
     DEPLOYMENT REQUESTS
     ========================================================= */
  const deploymentRequests = useMemo(() => {
    return state.deployments
      .filter(
        d => d.Status === 'REQUESTED'
      )
      .sort(
        (a, b) =>
          new Date(b.CreatedAt) -
          new Date(a.CreatedAt)
      )
      .slice(0, 6);
  }, [state]);

  const myRequests = useMemo(() => {
    const all = [
      ...state.deployments,
      ...state.access,
      ...state.issues
    ];

    return all
      .filter(r => r.RequesterID === user?.id)
      .sort(
        (a, b) =>
          new Date(b.CreatedAt) -
          new Date(a.CreatedAt)
      )
      .slice(0, 6);
  }, [state, user]);

  const recentActivity = useMemo(() => {
    const all = [
      ...state.deployments,
      ...state.access,
      ...state.issues,
      ...state.prod
    ];

    return all
      .sort(
        (a, b) =>
          new Date(
            b.UpdatedAt || b.CreatedAt
          ) -
          new Date(
            a.UpdatedAt || a.CreatedAt
          )
      )
      .slice(0, 8);
  }, [state]);

  const openIssuesList = useMemo(() => {
    return [
      ...state.issues,
      ...state.prod
    ]
      .filter(
        i =>
          ['OPEN', 'IN_PROGRESS'].includes(
            i.Status
          )
      )
      .sort(
        (a, b) =>
          new Date(b.CreatedAt) -
          new Date(a.CreatedAt)
      )
      .slice(0, 6);
  }, [state]);

  if (state.error) {
    return (
      <ErrorState
        message={state.error}
        onRetry={load}
      />
    );
  }

  const cards = [
    {
      label: 'Pending Deployments',
      value: stats.pendingDeployments,
      tone: 'warning',
      to: '/deployments?status=REQUESTED'
    },
    {
      label: 'Pending Access',
      value: stats.pendingAccess,
      tone: 'warning',
      to: '/access?status=REQUESTED'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      tone: 'info',
      to: '/deployments?status=IN_PROGRESS'
    },
    {
      label: 'Failed Deployments',
      value: stats.failedDeployments,
      tone: 'danger',
      to: '/deployments?status=COMPLETED_FAILED'
    },
    {
      label: 'Successful Deployments',
      value: stats.successfulDeployments,
      tone: 'success',
      to: '/deployments?status=COMPLETED_SUCCESS'
    },
    {
      label: 'Open Issues',
      value: stats.openIssues,
      tone: 'neutral',
      to: '/issues'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* =================================================
          PAGE HEADER
         ================================================= */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>

        <p className="text-sm text-ink-400 mt-1">
          Here's what needs your attention right now.
        </p>
      </div>

      {/* =================================================
          OPERATIONS OVERVIEW
         ================================================= */}
      <section>
        <h2 className="text-sm font-semibold text-ink-700 mb-3">
          Operations Overview
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">

          {state.loading
            ? Array.from({ length: 6 }).map(
                (_, i) => (
                  <SkeletonCard key={i} />
                )
              )
            : cards.map(c => (
                <button
                  key={c.label}
                  onClick={() =>
                    navigate(c.to)
                  }
                  className="text-left"
                >
                  <Card className="p-4 hover:shadow-raised transition-shadow cursor-pointer">
                    <p className="text-xs font-medium text-ink-400">
                      {c.label}
                    </p>

                    <p
                      className={`
                        text-3xl
                        font-bold
                        mt-1.5
                        ${
                          c.tone === 'danger'
                            ? 'text-danger'
                            : c.tone === 'warning'
                            ? 'text-warning'
                            : c.tone === 'info'
                            ? 'text-info'
                            : c.tone === 'success'
                            ? 'text-success'
                            : 'text-ink-900'
                        }
                      `}
                    >
                      {c.value}
                    </p>
                  </Card>
                </button>
              ))}
        </div>
      </section>

      {/* =================================================
          DASHBOARD LIST BOXES
         ================================================= */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* =================================================
            OPEN ISSUES
           ================================================= */}
        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            Open Issues
          </h2>

          <Card className="overflow-hidden">
            <ScrollableCard maxHeight="max-h-[240px]">
              <div className="divide-y divide-ink-100">

                {state.loading &&
                  Array.from({ length: 3 }).map(
                    (_, i) => (
                      <SkeletonRow key={i} />
                    )
                  )}

                {!state.loading &&
                  openIssuesList.length === 0 && (
                    <EmptyState
                      icon="🎉"
                      title="No open issues"
                    />
                  )}

                {!state.loading &&
                  openIssuesList.map(i => (
                    <button
                      key={i['Record ID']}
                      onClick={() =>
                        navigate(
                          `/${TYPE_ROUTE[i['Record Type']]}/${i['Record ID']}`
                        )
                      }
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        flex
                        items-center
                        gap-3
                        hover:bg-ink-50
                      "
                    >
                      <RecordIdBadge
                        id={i['Record ID']}
                      />

                      <span className="text-sm text-ink-900 flex-1 truncate">
                        {i.ErrorMessage ||
                          i.Project}
                      </span>

                      <StatusBadge
                        status={i.Status}
                      />
                    </button>
                  ))}
              </div>
            </ScrollableCard>
          </Card>
        </section>

        {/* =================================================
            DEPLOYMENT REQUESTS
           ================================================= */}
        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            Deployment Requests
          </h2>

          <Card className="overflow-hidden">
            <ScrollableCard maxHeight="max-h-[240px]">
              <div className="divide-y divide-ink-100">

                {state.loading &&
                  Array.from({ length: 3 }).map(
                    (_, i) => (
                      <SkeletonRow key={i} />
                    )
                  )}

                {!state.loading &&
                  deploymentRequests.length === 0 && (
                    <EmptyState
                      icon="✅"
                      title="No deployment requests"
                    />
                  )}

                {!state.loading &&
                  deploymentRequests.map(d => (
                    <button
                      key={d['Record ID']}
                      onClick={() =>
                        navigate(
                          `/deployments/${d['Record ID']}`
                        )
                      }
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        flex
                        items-center
                        gap-3
                        hover:bg-ink-50
                      "
                    >
                      <RecordIdBadge
                        id={d['Record ID']}
                      />

                      <span className="text-sm text-ink-900 flex-1 truncate">
                        {d.Project ||
                          d.Application ||
                          d.Service ||
                          'Deployment Request'}
                      </span>

                      <StatusBadge
                        status={d.Status}
                      />
                    </button>
                  ))}
              </div>
            </ScrollableCard>
          </Card>
        </section>

        {/* =================================================
            RECENT ACTIVITY
           ================================================= */}
        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            Recent Activity
          </h2>

          <Card className="overflow-hidden">
            {/* ONLY CHANGE:
                Recent Activity now uses the same 240px height
                as the other three dashboard boxes. */}
            <ScrollableCard maxHeight="max-h-[240px]">
              <div className="divide-y divide-ink-100">

                {state.loading &&
                  Array.from({ length: 3 }).map(
                    (_, i) => (
                      <SkeletonRow key={i} />
                    )
                  )}

                {!state.loading &&
                  recentActivity.length === 0 && (
                    <EmptyState
                      title="No activity yet"
                    />
                  )}

                {!state.loading &&
                  recentActivity.map(r => (
                    <button
                      key={r['Record ID']}
                      onClick={() =>
                        navigate(
                          `/${TYPE_ROUTE[r['Record Type']]}/${r['Record ID']}`
                        )
                      }
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        flex
                        items-center
                        gap-3
                        hover:bg-ink-50
                      "
                    >
                      <RecordIdBadge
                        id={r['Record ID']}
                      />

                      <span className="text-xs text-ink-400 w-28 shrink-0">
                        {TYPE_LABEL[
                          r['Record Type']
                        ]}
                      </span>

                      <span className="text-sm text-ink-900 flex-1 truncate">
                        {r.Project ||
                          r.ErrorMessage}
                      </span>

                      <StatusBadge
                        status={r.Status}
                      />
                    </button>
                  ))}
              </div>
            </ScrollableCard>
          </Card>
        </section>

        {/* =================================================
            MY REQUESTS
           ================================================= */}
        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            My Requests
          </h2>

          <Card className="overflow-hidden">
            <ScrollableCard maxHeight="max-h-[240px]">
              <div className="divide-y divide-ink-100">

                {state.loading &&
                  Array.from({ length: 3 }).map(
                    (_, i) => (
                      <SkeletonRow key={i} />
                    )
                  )}

                {!state.loading &&
                  myRequests.length === 0 && (
                    <EmptyState
                      title="No requests found"
                      description="Requests you create will show up here."
                    />
                  )}

                {!state.loading &&
                  myRequests.map(r => (
                    <button
                      key={r['Record ID']}
                      onClick={() =>
                        navigate(
                          `/${TYPE_ROUTE[r['Record Type']]}/${r['Record ID']}`
                        )
                      }
                      className="
                        w-full
                        text-left
                        px-4
                        py-3
                        flex
                        items-center
                        gap-3
                        hover:bg-ink-50
                      "
                    >
                      <RecordIdBadge
                        id={r['Record ID']}
                      />

                      <span className="text-xs text-ink-400 w-28 shrink-0">
                        {TYPE_LABEL[
                          r['Record Type']
                        ]}
                      </span>

                      <span className="text-sm text-ink-900 flex-1 truncate">
                        {r.Project ||
                          r.ErrorMessage}
                      </span>

                      <StatusBadge
                        status={r.Status}
                      />
                    </button>
                  ))}
              </div>
            </ScrollableCard>
          </Card>
        </section>

      </div>
    </div>
  );
}