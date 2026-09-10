/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6F8',
        ink: {
          900: '#10131A',
          700: '#2B3040',
          600: '#5B6472',
          400: '#8A93A3',
          200: '#D7DBE2'
        },
        brand: {
          50: '#EEF1FE',
          100: '#DCE2FD',
          400: '#5A6FE0',
          500: '#2E4CDB',
          600: '#233CB8',
          700: '#1F35A8'
        },
        success: { DEFAULT: '#16A34A', bg: '#EAF7EE', text: '#0F7A38' },
        danger: { DEFAULT: '#DC2626', bg: '#FDEAEA', text: '#B91C1C' },
        warning: { DEFAULT: '#D97706', bg: '#FEF3E2', text: '#B45309' },
        info: { DEFAULT: '#2563EB', bg: '#EAF1FE', text: '#1D4ED8' },
        neutral: { DEFAULT: '#6B7280', bg: '#F1F2F4', text: '#4B5563' }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,19,26,0.04), 0 1px 3px rgba(16,19,26,0.06)',
        raised: '0 4px 16px rgba(16,19,26,0.08)',
        popover: '0 8px 30px rgba(16,19,26,0.12)'
      },
      borderRadius: { xl2: '14px' }
    }
  },
  plugins: []
}
