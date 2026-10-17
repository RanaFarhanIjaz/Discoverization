import { Link } from 'react-router-dom';
import { dateParts, formatLocation, formatPrice, formatTime } from '../utils/events';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const { month, day, weekday } = dateParts(event);
  const location = formatLocation(event.venue);
  const price = formatPrice(event);

  return (
    <article className="ticket">
      <div className="ticket-media">
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" />
        ) : (
          <div className="ticket-placeholder" aria-hidden="true">
            {event.name.charAt(0)}
          </div>
        )}
        <div className="ticket-badges">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="ticket-body">
        <div className="ticket-stub" aria-hidden="true">
          <span className="stub-month">{month}</span>
          <span className="stub-day">{day}</span>
          <span className="stub-weekday">{weekday}</span>
        </div>
        <div className="ticket-info">
          {event.segment && <p className="ticket-category">{event.segment}{event.genre ? `, ${event.genre}` : ''}</p>}
          <h3 className="ticket-title">
            <Link to={`/events/${event.id}`}>{event.name}</Link>
          </h3>
          <p className="ticket-meta">{event.venue.name || 'Venue to be announced'}</p>
          {location && <p className="ticket-meta">{location}</p>}
          <p className="ticket-meta ticket-time">
            <span className="visually-hidden">Starts </span>
            {formatTime(event)}
            {price && <span className="ticket-price"> from {price.split(' to ')[0]}</span>}
          </p>
        </div>
      </div>
    </article>
  );
}
