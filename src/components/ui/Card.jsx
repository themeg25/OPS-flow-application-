export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white border border-ink-200/70 rounded-xl2 shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
