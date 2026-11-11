'use client';

import { Icon } from '@/components/Icon';
import type { ConfirmOptions } from '@/components/ui/app-ui';

export function ConfirmModal({ options, onClose }: { options: ConfirmOptions | null; onClose: () => void }) {
  if (!options) return null;
  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={15} />
        </button>
        <span className="eyebrow">Confirm action</span>
        <h2 id="confirm-title">{options.title}</h2>
        <p className="modal-subtitle">{options.message}</p>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${options.tone === 'danger' ? 'danger' : 'primary'}`}
            onClick={() => {
              options.onAccept();
              onClose();
            }}
            autoFocus
          >
            {options.label}
          </button>
        </div>
      </div>
    </div>
  );
}
