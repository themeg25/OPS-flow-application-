export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      {description && <div className="text-sm text-ink-400 mt-1 max-w-sm">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
