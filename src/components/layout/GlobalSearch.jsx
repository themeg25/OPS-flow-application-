import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../api/searchService';
import { RecordIdBadge, StatusBadge } from '../ui/Badge';

const TYPE_LABEL = {
  DEPLOYMENT: 'Deployment',
  ACCESS: 'Access Request',
  ISSUE: 'Issue',
  PRODUCTION_ISSUE: 'Production Issue'
};

const TYPE_ROUTE = {
  DEPLOYMENT: 'deployments',
  ACCESS: 'access',
  ISSUE: 'issues',
  PRODUCTION_ISSUE: 'production'
};

function highlight(text, query) {
  if (!text || !query) return text;

  const i = text.toLowerCase().indexOf(query.toLowerCase());

  if (i === -1) return text;

  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-warning/25 text-ink-900 rounded-sm">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function GlobalSearch({ mobileExpanded, onCollapse }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (mobileExpanded) {
      inputRef.current?.focus();
    }
  }, [mobileExpanded]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onClickOutside);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);

      try {
        const r = await searchService.search(q.trim());

        setResults(r);
        setOpen(true);
        setActiveIdx(-1);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q]);

  function goTo(rec) {
    navigate(
      `/${TYPE_ROUTE[rec['Record Type']]}/${rec['Record ID']}`
    );

    setOpen(false);
    setQ('');

    onCollapse?.();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      setActiveIdx((i) =>
        Math.min(i + 1, results.length - 1)
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      setActiveIdx((i) =>
        Math.max(i - 1, 0)
      );
    }

    if (e.key === 'Enter' && activeIdx >= 0) {
      goTo(results[activeIdx]);
    }

    if (e.key === 'Escape') {
      setOpen(false);
      onCollapse?.();
    }
  }

  return (
    <div
      ref={boxRef}
      className={`relative ${
        mobileExpanded
          ? 'fixed inset-x-0 top-0 z-50 bg-white p-3 shadow-popover'
          : 'w-full max-w-md'
      }`}
    >
      <div className="relative">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
          🔍
        </span>

        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search requests, issues, projects, errors…"
          className="
            w-full
            bg-ink-50
            border
            border-ink-200
            focus:bg-white
            focus:border-brand-500
            rounded-lg
            pl-9
            pr-3
            py-2
            text-sm
            outline-none
            transition-colors
          "
        />

        {mobileExpanded && (
          <button
            onClick={onCollapse}
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              text-ink-400
              text-sm
              px-2
            "
          >
            Cancel
          </button>
        )}
      </div>

      {open && (
        <div className="absolute mt-1.5 w-full bg-white border border-ink-200 rounded-xl2 shadow-popover max-h-96 overflow-y-auto z-50">

          {loading && (
            <div className="px-4 py-3 text-sm text-ink-400">
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-ink-400">
              No matches for "{q}"
            </div>
          )}

          {!loading &&
            results.map((r, i) => (
              <button
                key={r['Record ID']}
                onClick={() => goTo(r)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-b border-ink-100 last:border-0 ${
                  activeIdx === i
                    ? 'bg-brand-50'
                    : 'hover:bg-ink-50'
                }`}
              >
                <RecordIdBadge id={r['Record ID']} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {highlight(
                      r['ErrorMessage'] ||
                        r['Project'] ||
                        r['Reason'] ||
                        TYPE_LABEL[r['Record Type']],
                      q
                    )}
                  </p>

                  <p className="text-xs text-ink-400 truncate">
                    {TYPE_LABEL[r['Record Type']]} · {r['Project']}{' '}
                    {r['Environment']
                      ? `· ${r['Environment']}`
                      : ''}
                  </p>
                </div>

                <StatusBadge status={r['Status']} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}