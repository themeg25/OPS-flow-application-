import Button from './Button';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="text-sm font-semibold text-ink-900">Unable to load this data</div>
      <div className="text-sm text-ink-400 mt-1 max-w-sm">{message}</div>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
