import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '../../context/AuthContext';

export default function Header({
  onMenuClick,
  theme = 'blue',
  onThemeChange,
  themes = {},
}) {
  const [mobileSearch, setMobileSearch] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] bg-white border-b border-ink-100 flex items-center">
        <div className="w-full px-4 lg:px-8 flex items-center justify-between gap-4">

          {/* =================================================
              LEFT SIDE
             ================================================= */}
          <div className="flex items-center min-w-0 flex-1">

            {/* Mobile menu */}
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="
                  lg:hidden
                  mr-3
                  w-9
                  h-9
                  rounded-lg
                  border
                  border-ink-200
                  flex
                  items-center
                  justify-center
                  text-ink-600
                  hover:bg-ink-50
                "
                aria-label="Open menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                  />
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                  />
                  <line
                    x1="3"
                    y1="18"
                    x2="21"
                    y2="18"
                  />
                </svg>
              </button>
            )}

            {/* Desktop search */}
            <div className="hidden sm:block w-full max-w-xl">
              <GlobalSearch />
            </div>

            {/* Mobile search button */}
            <button
              type="button"
              onClick={() =>
                setMobileSearch(!mobileSearch)
              }
              className="
                sm:hidden
                w-9
                h-9
                rounded-lg
                border
                border-ink-200
                flex
                items-center
                justify-center
                text-ink-500
                hover:bg-ink-50
              "
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <line
                  x1="16.5"
                  y1="16.5"
                  x2="21"
                  y2="21"
                />
              </svg>
            </button>
          </div>

          {/* =================================================
              TOP RIGHT
             ================================================= */}
          <div className="flex items-center gap-2">

            {/* =================================================
                SETTINGS BUTTON
               ================================================= */}
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setSettingsOpen(!settingsOpen)
                }
                className="
                  w-10
                  h-10
                  rounded-lg
                  border
                  border-ink-200
                  bg-white
                  flex
                  items-center
                  justify-center
                  text-ink-600
                  hover:bg-ink-50
                  hover:border-ink-300
                  transition-all
                  duration-200
                "
                aria-label="Dashboard colour settings"
                title="Dashboard colour settings"
              >
                {/* Real settings / gear icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                  />

                  <path
                    d="
                      M19.4 15a1.65 1.65 0 0 0
                      .33 1.82l.06.06a2 2 0 1 1
                      -2.83 2.83l-.06-.06a1.65 1.65 0 0 0
                      -1.82-.33 1.65 1.65 0 0 0
                      -1 1.51V21a2 2 0 1 1
                      -4 0v-.09a1.65 1.65 0 0 0
                      -1-1.51 1.65 1.65 0 0 0
                      -1.82.33l-.06.06a2 2 0 1 1
                      -2.83-2.83l.06-.06A1.65 1.65 0 0 0
                      4.4 15a1.65 1.65 0 0 0
                      -1.51-1H2.8a2 2 0 1 1
                      0-4h.09a1.65 1.65 0 0 0
                      1.51-1 1.65 1.65 0 0 0
                      -.33-1.82l-.06-.06a2 2 0 1 1
                      2.83-2.83l.06.06A1.65 1.65 0 0 0
                      8.7 4.4a1.65 1.65 0 0 0
                      1-1.51V2.8a2 2 0 1 1
                      4 0v.09a1.65 1.65 0 0 0
                      1 1.51 1.65 1.65 0 0 0
                      1.82-.33l.06-.06a2 2 0 1 1
                      2.83 2.83l-.06.06A1.65 1.65 0 0 0
                      19.6 9c.22.5.72.9 1.51 1h.09a2 2 0 1 1
                      0 4h-.09c-.79.1-1.29.5-1.71 1Z
                    "
                  />
                </svg>
              </button>

              {/* =================================================
                  COLOUR SETTINGS POPUP
                 ================================================= */}
              {settingsOpen && (
                <>
                  {/* Close when clicking outside */}
                  <button
                    type="button"
                    aria-label="Close settings"
                    onClick={() =>
                      setSettingsOpen(false)
                    }
                    className="
                      fixed
                      inset-0
                      z-40
                      cursor-default
                    "
                  />

                  {/* Settings panel */}
                  <div
                    className="
                      absolute
                      right-0
                      top-12
                      z-50
                      w-[280px]
                      rounded-xl
                      border
                      border-ink-200
                      bg-white
                      p-4
                      shadow-xl
                    "
                  >
                    {/* Heading */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            w-8
                            h-8
                            rounded-lg
                            bg-ink-50
                            flex
                            items-center
                            justify-center
                            text-ink-600
                          "
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                            />
                            <path
                              d="
                                M19.4 15a1.7 1.7 0 0 0
                                .34 1.88l.06.06a2 2 0 1 1
                                -2.83 2.83l-.06-.06a1.7 1.7 0 0 0
                                -1.88-.34 1.7 1.7 0 0 0
                                -1.03 1.55V21a2 2 0 1 1
                                -4 0v-.09a1.7 1.7 0 0 0
                                -1.03-1.55 1.7 1.7 0 0 0
                                -1.88.34l-.06.06a2 2 0 1 1
                                -2.83-2.83l.06-.06A1.7 1.7 0 0 0
                                4.6 15a1.7 1.7 0 0 0
                                -1.55-1.03H3a2 2 0 1 1
                                0-4h.09A1.7 1.7 0 0 0
                                4.6 8a1.7 1.7 0 0 0
                                -.34-1.88L4.2 6.06a2 2 0 1 1
                                2.83-2.83l.06.06A1.7 1.7 0 0 0
                                9 3.6a1.7 1.7 0 0 0
                                1.03-1.55V2a2 2 0 1 1
                                4 0v.09A1.7 1.7 0 0 0
                                15 3.6a1.7 1.7 0 0 0
                                1.88-.34l.06-.06a2 2 0 1 1
                                2.83 2.83l-.06.06A1.7 1.7 0 0 0
                                19.4 9c.21.5.71.9 1.03.97H21a2 2 0 1 1
                                0 4h-.09c-.32.07-.82.47-1.51 1.03Z
                              "
                            />
                          </svg>
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            Dashboard Theme
                          </p>

                          <p className="text-xs text-ink-400">
                            Choose your background
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Colour options */}
                    <div className="grid grid-cols-3 gap-2">

                      <ThemeOption
                        name="Blue"
                        color="#f0f7ff"
                        active={theme === 'blue'}
                        onClick={() => {
                          onThemeChange?.('blue');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Lavender"
                        color="#f5f3ff"
                        active={theme === 'lavender'}
                        onClick={() => {
                          onThemeChange?.('lavender');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Mint"
                        color="#f0fdf8"
                        active={theme === 'mint'}
                        onClick={() => {
                          onThemeChange?.('mint');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Peach"
                        color="#fff7ed"
                        active={theme === 'peach'}
                        onClick={() => {
                          onThemeChange?.('peach');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Rose"
                        color="#fff5f7"
                        active={theme === 'rose'}
                        onClick={() => {
                          onThemeChange?.('rose');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Light Black"
                        color="#f1f1f1"
                        active={theme === 'lightBlack'}
                        onClick={() => {
                          onThemeChange?.('lightBlack');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Black"
                        color="#111827"
                        active={theme === 'black'}
                        dark
                        onClick={() => {
                          onThemeChange?.('black');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="White"
                        color="#ffffff"
                        active={theme === 'white'}
                        onClick={() => {
                          onThemeChange?.('white');
                          setSettingsOpen(false);
                        }}
                      />

                      <ThemeOption
                        name="Light Yellow"
                        color="#fffbea"
                        active={theme === 'yellow'}
                        onClick={() => {
                          onThemeChange?.('yellow');
                          setSettingsOpen(false);
                        }}
                      />

                    </div>
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                PROFILE BUTTON
               ================================================= */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="
                flex
                items-center
                gap-2.5
                px-3
                py-2
                rounded-lg
                border
                border-brand-100
                bg-brand-50
                text-ink-700
                hover:bg-brand-100
                hover:border-brand-200
                transition-colors
              "
              aria-label="Profile"
            >

              {/* Profile photo */}
              <span
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-[#2563EB]
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-sm
                  overflow-hidden
                  flex-shrink-0
                "
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={
                      user?.name || 'Profile'
                    }
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                    />

                    <path
                      d="M4 21a8 8 0 0 1 16 0"
                    />
                  </svg>
                )}
              </span>

              {/* Profile text */}
              <span
                className="
                  hidden
                  sm:flex
                  flex-col
                  items-start
                  leading-tight
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                    text-ink-700
                  "
                >
                  Profile
                </span>

                <span
                  className="
                    text-xs
                    text-ink-500
                    mt-0.5
                  "
                >
                  {user?.name || 'User'}
                </span>
              </span>

            </button>

          </div>
        </div>
      </header>

      {/* =================================================
          MOBILE SEARCH
         ================================================= */}
      {mobileSearch && (
        <div
          className="
            sm:hidden
            fixed
            top-[72px]
            left-0
            right-0
            z-30
            bg-white
            border-b
            border-ink-100
            p-3
            shadow-sm
          "
        >
          <GlobalSearch />
        </div>
      )}
    </>
  );
}


/* =========================================================
   THEME OPTION
   ========================================================= */

function ThemeOption({
  name,
  color,
  active,
  dark = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className="
        group
        flex
        flex-col
        items-center
        gap-1.5
        rounded-lg
        p-2
        hover:bg-ink-50
        transition-colors
      "
    >
      <span
        className={`
          relative
          w-11
          h-11
          rounded-full
          border-2
          flex
          items-center
          justify-center
          transition-all
          duration-200
          ${
            active
              ? 'border-brand-500 ring-2 ring-brand-100'
              : 'border-ink-200 group-hover:border-ink-400'
          }
        `}
        style={{
          backgroundColor: color,
        }}
      >
        {active && (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dark ? '#ffffff' : '#2563EB'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>

      <span className="text-[10px] text-ink-500 text-center leading-tight">
        {name}
      </span>
    </button>
  );
}