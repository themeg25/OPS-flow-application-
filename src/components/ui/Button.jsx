const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50',
  danger: 'bg-danger text-white hover:bg-danger/90',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-50',
  subtle: 'bg-brand-50 text-brand-600 hover:bg-brand-100'
};
const SIZES = { sm: 'text-xs px-2.5 py-1.5 rounded-lg', md: 'text-sm px-3.5 py-2 rounded-lg', lg: 'text-sm px-5 py-2.5 rounded-xl2' };

export default function Button({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  );
}
