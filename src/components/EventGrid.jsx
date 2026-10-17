import EventCard from './EventCard';

export default function EventGrid({ events }) {
  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }) {
  return (
    <div className="event-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="ticket skeleton-card" key={i}>
          <div className="skeleton skeleton-media" />
          <div className="skeleton-lines">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}
