import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  fetchEvents,
  resetFilters,
  selectCategories,
  selectFilters,
  setFilters,
} from '../features/events/eventsSlice';
import SearchFilters from '../components/SearchFilters';
import EventGrid, { EventGridSkeleton } from '../components/EventGrid';
import Pagination from '../components/Pagination';
import StateMessage from '../components/StateMessage';

export default function EventsPage() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const categories = useSelector(selectCategories);
  const { items, status, error, pageInfo } = useSelector((state) => state.events);
  const headingRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Refetch whenever a filter or the page changes; abort stale requests.
  useEffect(() => {
    const request = dispatch(fetchEvents(filters));
    return () => request.abort();
  }, [dispatch, filters]);

  const changePage = (page) => {
    dispatch(setFilters({ page }));
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loading = status === 'loading' || status === 'idle';

  return (
    <div className="container section">
      <h1 className="page-title" ref={headingRef}>Events</h1>

      <div className="chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={!filters.category ? 'chip active' : 'chip'}
          aria-pressed={!filters.category}
          onClick={() => dispatch(setFilters({ category: '' }))}
        >
          All
        </button>
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            className={filters.category === name ? 'chip active' : 'chip'}
            aria-pressed={filters.category === name}
            onClick={() => dispatch(setFilters({ category: name }))}
          >
            {name}
          </button>
        ))}
      </div>

      <SearchFilters />

      <p className="result-count" aria-live="polite">
        {status === 'succeeded' &&
          `${pageInfo.totalElements.toLocaleString()} ${pageInfo.totalElements === 1 ? 'event' : 'events'} found`}
      </p>

      {status === 'failed' ? (
        <StateMessage
          kind="error"
          title="We couldn't load events"
          action={
            <button type="button" className="btn btn-primary" onClick={() => dispatch(fetchEvents(filters))}>
              Try again
            </button>
          }
        >
          {error}
        </StateMessage>
      ) : loading && items.length === 0 ? (
        <EventGridSkeleton count={8} />
      ) : items.length === 0 ? (
        <StateMessage
          title="No events match these filters"
          action={
            <button type="button" className="btn btn-primary" onClick={() => dispatch(resetFilters())}>
              Clear filters
            </button>
          }
        >
          Try a broader search, another city, or a longer date range.
        </StateMessage>
      ) : (
        <div className={loading ? 'results is-loading' : 'results'} aria-busy={loading}>
          <EventGrid events={items} />
        </div>
      )}

      <Pagination page={filters.page} totalPages={pageInfo.totalPages} onChange={changePage} />
    </div>
  );
}
