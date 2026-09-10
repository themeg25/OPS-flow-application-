import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
        />

        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
        />
      </svg>
    ),
  },

  {
    to: '/deployments',
    label: 'Deployments',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 2l4 8-4 12-4-12 4-8z" />
        <path d="M8 10H4" />
        <path d="M20 10h-4" />
        <path d="M9 14l-3 3" />
        <path d="M15 14l3 3" />
      </svg>
    ),
  },

  {
    to: '/access',
    label: 'Access Requests',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect
          x="3"
          y="11"
          width="18"
          height="10"
          rx="2"
        />

        <path d="M7 11V8a5 5 0 0110 0v3" />

        <circle
          cx="12"
          cy="16"
          r="1"
        />
      </svg>
    ),
  },

  {
    to: '/issues',
    label: 'Issue Tracker',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="17"
          rx="2"
        />

        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
        <path d="M8 14h3" />
        <path d="M8 17h6" />
      </svg>
    ),
  },

  {
    to: '/production',
    label: 'Production Issues',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 3L2.5 20h19L12 3z" />
        <path d="M12 9v5" />
        <circle
          cx="12"
          cy="17"
          r="1"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  function confirmLogout() {
    setConfirmOpen(false);

    logout();

    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="
            fixed
            inset-0
            bg-slate-950/50
            backdrop-blur-sm
            z-30
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================== */}
      <aside
        className={`
          fixed
          lg:sticky
          top-0
          h-screen
          w-64
          bg-[#0B1F3A]
          border-r
          border-[#193B66]
          z-40
          flex
          flex-col
          shadow-xl
          shadow-[#07172B]/20
          transition-transform
          duration-200
          ${open
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'}
        `}
      >

        {/* =========================
            LOGO / BRAND
        ========================== */}
        <div
          className="
            h-16
            flex
            items-center
            gap-3
            px-5
            border-b
            border-[#193B66]
          "
        >

          {/* Logo */}
          <div
            className="
              h-9
              w-9
              rounded-lg
              bg-[#2563EB]
              flex
              items-center
              justify-center
              text-white
              font-bold
              text-sm
              shadow-md
              shadow-blue-900/30
            "
          >
            OF
          </div>

          {/* Brand name */}
          <span
            className="
              font-bold
              text-white
              tracking-tight
              text-base
            "
          >
            OPSFlow
          </span>

        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav
          className="
            flex-1
            overflow-y-auto
            py-5
            px-3
            space-y-1
          "
        >

          {NAV
            .filter(
              (item) =>
                item.to !== '/production' ||
                user?.role === 'DevOps'
            )
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  transition-all
                  duration-150
                  border
                  border-transparent

                  ${
                    isActive
                      ? `
                        bg-[#2563EB]
                        text-white
                        border-[#3B82F6]
                        shadow-md
                        shadow-blue-950/30
                      `
                      : `
                        text-[#C7D7F2]
                        hover:bg-[#163A63]
                        hover:text-white
                        hover:border-[#234B78]
                      `
                  }
                  `
                }
              >

                {/* Icon */}
                <span
                  className="
                    w-5
                    h-5
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="truncate">
                  {item.label}
                </span>

              </NavLink>
            ))}

          {/* =========================
              ADMIN SECTION
          ========================== */}
          {isAdmin && (
            <>
              <div
                className="
                  pt-6
                  pb-2
                  px-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#60A5FA]
                "
              >
                Admin
              </div>

              {/* User Management */}
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  font-medium
                  transition-all
                  duration-150
                  border
                  border-transparent

                  ${
                    isActive
                      ? `
                        bg-[#2563EB]
                        text-white
                        border-[#3B82F6]
                        shadow-md
                        shadow-blue-950/30
                      `
                      : `
                        text-[#C7D7F2]
                        hover:bg-[#163A63]
                        hover:text-white
                        hover:border-[#234B78]
                      `
                  }
                  `
                }
              >

                {/* User Management Icon */}
                <span
                  className="
                    w-5
                    h-5
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                    />

                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                  </svg>
                </span>

                <span>
                  User Management
                </span>

              </NavLink>
            </>
          )}

        </nav>

        {/* =================================================
            SIGN OUT - BOTTOM OF SIDEBAR
           ================================================= */}
        <div
          className="
            p-3
            border-t
            border-[#193B66]
          "
        >

          <button
            type="button"
            onClick={() =>
              setConfirmOpen(true)
            }
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-lg
              text-sm
              font-medium
              text-[#C7D7F2]
              bg-[#102B4C]
              border
              border-[#234B78]
              hover:bg-[#163A63]
              hover:text-white
              hover:border-[#32689F]
              transition-all
              duration-150
            "
          >

            {/* Sign out icon */}
            <span
              className="
                w-5
                h-5
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

                <polyline points="16 17 21 12 16 7" />

                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                />
              </svg>
            </span>

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>

      {/* =================================================
          SIGN OUT CONFIRMATION MODAL
         ================================================= */}
      <Modal
        open={confirmOpen}
        onClose={() =>
          setConfirmOpen(false)
        }
        title="Sign out"
      >
        <div className="space-y-4">

          <p className="text-sm text-ink-600">
            Are you sure you want to sign out?
          </p>

          <div className="flex justify-end gap-2">

            <Button
              variant="ghost"
              onClick={() =>
                setConfirmOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={confirmLogout}
            >
              Sign out
            </Button>

          </div>

        </div>
      </Modal>
    </>
  );
}