'use client';

import { Icon } from '@/components/Icon';
import { useTracker, type ToastType } from '@/lib/store';
import type { IconName } from '@/lib/types';

const ICONS: Record<ToastType, IconName> = {
  info: 'spark',
  success: 'check',
  error: 'close',
  achievement: 'star',
  level: 'crown'
};

export function ToastStack() {
  const { toasts, actions } = useTracker();
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon" aria-hidden="true">
            <Icon name={ICONS[toast.type]} size={13} />
          </span>
          <span className="toast-message">{toast.message}</span>
          {toast.action ? (
            <button type="button" className="toast-action" onClick={toast.action.onClick}>
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            className="toast-close"
            onClick={() => actions.dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
