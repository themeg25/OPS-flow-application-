import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DASHBOARD_THEMES = {
  blue: {
    name: 'Ocean Blue',
    background: '#f0f7ff',
  },

  lavender: {
    name: 'Lavender',
    background: '#f5f3ff',
  },

  mint: {
    name: 'Mint',
    background: '#f0fdf8',
  },

  peach: {
    name: 'Peach',
    background: '#fff7ed',
  },

  rose: {
    name: 'Rose',
    background: '#fff5f7',
  },

  lightBlack: {
    name: 'Light Black',
    background: '#f1f1f1',
  },

  // Black 40% - light black / gray appearance
  black: {
    name: 'Black 40%',
    background: '#999999',
  },

  white: {
    name: 'White',
    background: '#ffffff',
  },

  yellow: {
    name: 'Light Yellow',
    background: '#fffbea',
  },
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('opsflow-dashboard-theme') ||
      'blue'
    );
  });

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    localStorage.setItem(
      'opsflow-dashboard-theme',
      newTheme
    );
  }

  const currentTheme =
    DASHBOARD_THEMES[theme] ||
    DASHBOARD_THEMES.blue;

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: currentTheme.background,
      }}
    >
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main application area */}
      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
        "
        style={{
          backgroundColor: currentTheme.background,
        }}
      >
        {/* Header */}
        <Header
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          theme={theme}
          onThemeChange={handleThemeChange}
          themes={DASHBOARD_THEMES}
        />

        {/* Page content */}
        <main
          className="
            flex-1
            p-4
            lg:p-8
            max-w-[1400px]
            w-full
            mx-auto
          "
          style={{
            backgroundColor: currentTheme.background,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}