import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FALLBACK_CATEGORIES,
  fetchCategories,
  fetchUpcoming,
  resetFilters,
  selectCategories,
  setFilters,
} from '../features/events/eventsSlice';
import EventGrid, { EventGridSkeleton } from '../components/EventGrid';
import StateMessage from '../components/StateMessage';

const CATEGORY_NOTES = {
  Music: 'Concerts, festivals, and tours',
  Sports: 'Games, matches, and meets',
  'Arts & Theatre': 'Plays, comedy, and dance',
  Film: 'Screenings and premieres',
  Miscellaneous: 'Everything else worth leaving the house for',
};

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);
  const upcoming = useSelector((state) => state.events.upcoming);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    const request = dispatch(fetchUpcoming());
    return () => request.abort();
  }, [dispatch]);

  const browse = (changes) => {
    dispatch(resetFilters());
    dispatch(setFilters(changes));
    navigate('/events');
  };

  const shownCategories = categories.length ? categories : FALLBACK_CATEGORIES;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">Find something to go to.</h1>
          <p className="hero-text">
            Browse live events near you or anywhere else, register in one click, and keep every
            plan in one list.
          </p>
          <form
            className="hero-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              browse({ keyword: keyword.trim() });
            }}
          >
            <label htmlFor="hero-keyword" className="visually-hidden">Search events</label>
            <input
              id="hero-keyword"
              type="search"
              placeholder="Search an artist, team, or show"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search events</button>
          </form>
        </div>
      </section>

      <section className="container section" aria-labelledby="cat-title">
        <h2 id="cat-title" className="section-title">Browse by category</h2>
        <ul className="category-list">
          {shownCategories.map((name) => (
            <li key={name}>
              <button type="button" className="category-tile" onClick={() => browse({ category: name })}>
                <span className="category-name">{name}</span>
                <span className="category-note">
                  {CATEGORY_NOTES[name] || `Upcoming ${name.toLowerCase()} events`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="container section" aria-labelledby="up-title">
        <div className="section-head">
          <h2 id="up-title" className="section-title">Coming up next</h2>
          <Link to="/events" className="text-link">See all events</Link>
        </div>

        {upcoming.status === 'failed' ? (
          <StateMessage
            kind="error"
            title="We couldn't load upcoming events"
            action={
              <button type="button" className="btn btn-primary" onClick={() => dispatch(fetchUpcoming())}>
                Try again
              </button>
            }
          >
            {upcoming.error}
          </StateMessage>
        ) : upcoming.status === 'succeeded' ? (
          upcoming.items.length ? (
            <EventGrid events={upcoming.items} />
          ) : (
            <StateMessage title="No upcoming events found">Try browsing all events instead.</StateMessage>
          )
        ) : (
          <EventGridSkeleton count={6} />
        )}
      </section>
    </>
  );
}
