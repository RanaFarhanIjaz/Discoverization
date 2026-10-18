import { useEffect, useRef } from 'react';

// Built on the native <dialog>, which handles focus trapping and Escape for us.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  keepLabel = 'Keep it',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
    >
      <h2 className="dialog-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {keepLabel}
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
