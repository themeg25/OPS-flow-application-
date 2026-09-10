import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, requireReason, confirmLabel = 'Confirm', danger }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (requireReason && !reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={handleConfirm} disabled={requireReason && !reason.trim()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-ink-600 mb-3">{description}</p>}
      {requireReason && (
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1.5">Reason <span className="text-danger">*</span></label>
          <textarea
            className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why…"
          />
        </div>
      )}
    </Modal>
  );
}
