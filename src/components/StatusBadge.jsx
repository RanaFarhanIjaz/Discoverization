import { statusLabel } from '../utils/events';

// Only shows notable states; a normal "on sale" event needs no badge.
export default function StatusBadge({ status }) {
  if (!status || status === 'onsale') return null;
  const label = statusLabel(status);
  if (!label) return null;
  const tone = ['canceled', 'cancelled'].includes(status) ? 'danger' : 'warn';
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
