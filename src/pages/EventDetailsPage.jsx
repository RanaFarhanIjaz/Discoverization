import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelected, fetchEventById } from '../features/events/eventsSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  registerForEvent,
  selectRegistrationFor,
} from '../features/registrations/registrationsSlice';
import { addToast } from '../features/ui/uiSlice';
import useCancelRegistration from '../hooks/useCancelRegistration';
import StateMessage from '../components/StateMessage';
import StatusBadge from '../components/StatusBadge';
import {
  formatDate,
  formatLocation,
  formatPrice,
  formatTime,
  isCancelled,
  isCompleted,
} from '../utils/events';

function RegistrationPanel({ event }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const registration = useSelector(selectRegistrationFor(event.id));
  const { requestCancel, dialog } = useCancelRegistration();

  const ended = isCompleted(event);
  const cancelled = isCancelled(event);

  const handleRegister = async () => {
    const result = await dispatch(registerForEvent(event));
    if (registerForEvent.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `You're registered for ${event.name}.` }));
    } else {
      dispatch(addToast({ type: 'error', message: result.payload || 'We could not register you.' }));
    }
  };

  let content;
  if (registration) {
    content = (
      <>
        <p className="panel-status panel-status-ok">You're registered</p>
        <p className="panel-note">
          Registered on {new Date(registration.registeredAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.
          Find it any time in <Link to="/my-events">My events</Link>.
        </p>
        {!ended && (
          <button type="button" className="btn btn-danger-outline btn-block" onClick={() => requestCancel(event)}>
            Cancel registration
          </button>
        )}
      </>
    );
  } else if (cancelled) {
    content = <p className="panel-status">This event was cancelled, so registration is closed.</p>;
  } else if (ended) {
    content = <p className="panel-status">This event has ended, so registration is closed.</p>;
  } else if (!user) {
    content = (
      <>
        <p className="panel-note">Log in to register for this event.</p>
        <Link to="/login" state={{ from: location }} className="btn btn-primary btn-block">
          Log in to register
        </Link>
        <p className="panel-note">
          New here? <Link to="/register" state={{ from: location }}>Create an account</Link>
        </p>
      </>
    );
  } else {
    content = (
      <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>
        Register for this event
      </button>
    );
  }

  return (
    <aside className="panel" aria-label="Registration">
      <h2 className="panel-title">Registration</h2>
      {content}
      {event.url && (
        <a className="btn btn-ghost btn-block" href={event.url} target="_blank" rel="noopener noreferrer">
          Buy tickets on Ticketmaster
        </a>
      )}
      {dialog}
    </aside>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: event, selectedStatus, selectedError } = useSelector((state) => state.events);

  useEffect(() => {
    const request = dispatch(fetchEventById(id));
    return () => {
      request.abort();
      dispatch(clearSelected());
    };
  }, [dispatch, id]);

  if (selectedStatus === 'failed') {
    return (
      <div className="container section">
        <StateMessage
          kind="error"
          title="We couldn't load this event"
          action={
            <div className="state-actions">
              <button type="button" className="btn btn-primary" onClick={() => dispatch(fetchEventById(id))}>
                Try again
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/events')}>
                Back to events
              </button>
            </div>
          }
        >
          {selectedError}
        </StateMessage>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container section">
        <StateMessage kind="loading" title="Loading event" />
      </div>
    );
  }

  const location = formatLocation(event.venue);
  const price = formatPrice(event);
  const tags = [event.segment, event.genre, event.subGenre].filter(Boolean);
  const mapQuery = encodeURIComponent(
    [event.venue.name, event.venue.address, event.venue.city].filter(Boolean).join(', ')
  );

  return (
    <article className="container section">
      <p className="breadcrumb">
        <Link to="/events">All events</Link>
      </p>

      <header className="detail-header">
        {event.imageLarge && <img className="detail-image" src={event.imageLarge} alt="" />}
        <div className="detail-heading">
          {tags.length > 0 && (
            <ul className="tag-list" aria-label="Category">
              {tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
            </ul>
          )}
          <h1 className="detail-title">{event.name}</h1>
          <StatusBadge status={event.status} />
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <dl className="facts">
            <div className="fact">
              <dt>Date</dt>
              <dd>{formatDate(event)}</dd>
            </div>
            <div className="fact">
              <dt>Time</dt>
              <dd>{formatTime(event)}</dd>
            </div>
            <div className="fact">
              <dt>Venue</dt>
              <dd>
                {event.venue.name || 'To be announced'}
                {event.venue.address && <><br />{event.venue.address}</>}
                {event.venue.postalCode && <> {event.venue.postalCode}</>}
              </dd>
            </div>
            <div className="fact">
              <dt>Location</dt>
              <dd>
                {location || 'To be announced'}
                {event.venue.name && (
                  <>
                    <br />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on map
                    </a>
                  </>
                )}
              </dd>
            </div>
            <div className="fact">
              <dt>Category</dt>
              <dd>{tags.length ? tags.join(', ') : 'Not listed'}</dd>
            </div>
            {price && (
              <div className="fact">
                <dt>Price</dt>
                <dd>{price}</dd>
              </div>
            )}
          </dl>

          {event.attractions.length > 0 && (
            <section className="detail-section">
              <h2>Featuring</h2>
              <ul className="attractions">
                {event.attractions.map((a) => (
                  <li key={a.id} className="attraction">
                    {a.image && <img src={a.image} alt="" loading="lazy" />}
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a>
                    ) : (
                      <span>{a.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(event.info || event.pleaseNote || event.ticketLimit || event.ageRestriction || event.promoter) && (
            <section className="detail-section">
              <h2>Good to know</h2>
              {event.info && <p>{event.info}</p>}
              {event.pleaseNote && <p>{event.pleaseNote}</p>}
              {event.ticketLimit && <p>{event.ticketLimit}</p>}
              {event.ageRestriction && <p>{event.ageRestriction}.</p>}
              {event.promoter && <p className="muted">Presented by {event.promoter}.</p>}
            </section>
          )}

          {event.seatmap && (
            <section className="detail-section">
              <h2>Seat map</h2>
              <img className="seatmap" src={event.seatmap} alt={`Seat map for ${event.venue.name || 'the venue'}`} loading="lazy" />
            </section>
          )}
        </div>

        <RegistrationPanel event={event} />
      </div>
    </article>
  );
}
