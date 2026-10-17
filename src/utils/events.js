// Helpers for working with the normalized event objects used across the app.

export function getEventDate(event) {
  if (event.startISO) return new Date(event.startISO);
  if (event.localDate) return new Date(`${event.localDate}T${event.localTime || '23:59:59'}`);
  return null;
}

export function isCompleted(event) {
  const date = getEventDate(event);
  return Boolean(date) && date.getTime() < Date.now();
}

function format(event, options) {
  // Prefer the venue's own time zone so "7:30 PM" means 7:30 PM at the venue.
  if (event.startISO) {
    const date = new Date(event.startISO);
    try {
      return new Intl.DateTimeFormat('en-US', {
        ...options,
        timeZone: event.timezone || undefined,
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  }
  const date = new Date(`${event.localDate}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date);
}

export function formatDate(event) {
  if (!event.startISO && !event.localDate) return 'Date to be announced';
  return format(event, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(event) {
  if (event.startISO) {
    return format(event, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }
  if (event.localTime) {
    const [h, m] = event.localTime.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
  }
  return 'Time to be announced';
}

export function dateParts(event) {
  if (!event.startISO && !event.localDate) return { month: 'TBA', day: '--', weekday: '' };
  return {
    month: format(event, { month: 'short' }),
    day: format(event, { day: 'numeric' }),
    weekday: format(event, { weekday: 'short' }),
  };
}

export function formatLocation(venue = {}) {
  return [venue.city, venue.state, venue.country].filter(Boolean).join(', ');
}

export function formatPrice(event) {
  if (event.priceMin == null) return '';
  const money = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: event.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  return event.priceMax != null && event.priceMax !== event.priceMin
    ? `${money(event.priceMin)} to ${money(event.priceMax)}`
    : money(event.priceMin);
}

const STATUS_LABELS = {
  onsale: 'On sale',
  offsale: 'Off sale',
  canceled: 'Cancelled',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  rescheduled: 'Rescheduled',
};

export const statusLabel = (code) => STATUS_LABELS[code] || '';
export const isCancelled = (event) => ['canceled', 'cancelled'].includes(event.status);

// Only what My Events needs, so saved registrations stay small.
export function snapshotEvent(event) {
  return {
    id: event.id,
    name: event.name,
    url: event.url,
    image: event.image,
    startISO: event.startISO,
    localDate: event.localDate,
    localTime: event.localTime,
    timezone: event.timezone,
    status: event.status,
    segment: event.segment,
    venue: event.venue,
  };
}
