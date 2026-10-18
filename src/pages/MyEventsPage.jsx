import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectMyRegistrations } from '../features/registrations/registrationsSlice';
import useCancelRegistration from '../hooks/useCancelRegistration';
import StateMessage from '../components/StateMessage';
import StatusBadge from '../components/StatusBadge';
import {
  dateParts,
  formatDate,
  formatLocation,
  formatTime,
  getEventDate,
  isCompleted,
} from '../utils/events';

function RegistrationItem({ registration, onCancel }) {
  const { event } = registration;
  const completed = isCompleted(event);
  const { month, day } = dateParts(event);
  const location = formatLocation(event.venue);

  return (
    <li className={completed ? 'reg-item is-completed' : 'reg-item'}>
      <div className="reg-stub" aria-hidden="true">
        <span className="stub-month">{month}</span>
        <span className="stub-day">{day}</span>
      </div>
      {event.image && <img className="reg-image" src={event.image} alt="" loading="lazy" />}
      <div className="reg-info">
        <h3 className="reg-title">
          <Link to={`/events/${event.id}`}>{event.name}</Link>
        </h3>
        <p className="reg-meta">{formatDate(event)} at {formatTime(event)}</p>
        <p className="reg-meta">
          {event.venue.name || 'Venue to be announced'}{location ? `, ${location}` : ''}
        </p>
        <p className="reg-badges">
          <span className={completed ? 'badge badge-muted' : 'badge badge-ok'}>
            {completed ? 'Completed' : 'Upcoming'}
          </span>
          <StatusBadge status={event.status} />
        </p>
      </div>
      <div className="reg-actions">
        <Link to={`/events/${event.id}`} className="btn btn-ghost btn-sm">View event</Link>
        {!completed && (
          <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => onCancel(event)}>
            Cancel registration
          </button>
        )}
      </div>
    </li>
  );
}

function Section({ title, items, emptyText, onCancel }) {
  return (
    <section className="detail-section" aria-label={title}>
      <h2 className="section-title">
        {title} <span className="count-text">({items.length})</span>
      </h2>
      {items.length ? (
        <ul className="reg-list">
          {items.map((r) => (
            <RegistrationItem key={r.eventId} registration={r} onCancel={onCancel} />
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </section>
  );
}

export default function MyEventsPage() {
  const registrations = useSelector(selectMyRegistrations);
  const { requestCancel, dialog } = useCancelRegistration();

  const time = (r) => getEventDate(r.event)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const upcoming = registrations.filter((r) => !isCompleted(r.event)).sort((a, b) => time(a) - time(b));
  const completed = registrations.filter((r) => isCompleted(r.event)).sort((a, b) => time(b) - time(a));

  return (
    <div className="container section">
      <h1 className="page-title">My events</h1>

      {registrations.length === 0 ? (
        <StateMessage
          title="You haven't registered for anything yet"
          action={<Link to="/events" className="btn btn-primary">Browse events</Link>}
        >
          Events you register for will show up here, sorted by date.
        </StateMessage>
      ) : (
        <>
          <Section
            title="Upcoming"
            items={upcoming}
            emptyText="Nothing coming up. Browse events to find your next one."
            onCancel={requestCancel}
          />
          <Section
            title="Completed"
            items={completed}
            emptyText="Events you've attended will move here after they take place."
            onCancel={requestCancel}
          />
        </>
      )}
      {dialog}
    </div>
  );
}
