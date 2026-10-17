import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  defaultFilters,
  resetFilters,
  selectCategories,
  selectFilters,
  setFilters,
} from '../features/events/eventsSlice';

const DATE_RANGES = [
  { value: 'any', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'month', label: 'Next 30 days' },
];

const SORTS = [
  { value: 'date,asc', label: 'Soonest first' },
  { value: 'relevance,desc', label: 'Most relevant' },
  { value: 'name,asc', label: 'Name, A to Z' },
  { value: 'date,desc', label: 'Latest first' },
];

const COUNTRIES = [
  { value: '', label: 'All countries' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IE', label: 'Ireland' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'DE', label: 'Germany' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AE', label: 'United Arab Emirates' },
];

function useDebouncedFilter(key, filters, dispatch) {
  const external = filters[key];
  const [value, setValue] = useState(external);

  // Follow outside changes, such as "Clear filters" or a category tile.
  useEffect(() => {
    setValue(external);
  }, [external]);

  // Wait for a pause in typing so we stay inside the API's 2 requests/second.
  useEffect(() => {
    if (value === external) return undefined;
    const timer = setTimeout(() => dispatch(setFilters({ [key]: value })), 500);
    return () => clearTimeout(timer);
  }, [value, external, key, dispatch]);

  return [value, setValue];
}

export default function SearchFilters() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const categories = useSelector(selectCategories);
  const [keyword, setKeyword] = useDebouncedFilter('keyword', filters, dispatch);
  const [city, setCity] = useDebouncedFilter('city', filters, dispatch);

  const dirty = Object.keys(defaultFilters).some(
    (key) => key !== 'page' && filters[key] !== defaultFilters[key]
  );

  const update = (key) => (e) => dispatch(setFilters({ [key]: e.target.value }));

  return (
    <form
      className="filters"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(setFilters({ keyword, city }));
      }}
    >
      <div className="filter filter-wide">
        <label htmlFor="f-keyword">Search</label>
        <input
          id="f-keyword"
          type="search"
          placeholder="Artist, team, show, or venue"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="filter">
        <label htmlFor="f-category">Category</label>
        <select id="f-category" value={filters.category} onChange={update('category')}>
          <option value="">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label htmlFor="f-city">City</label>
        <input
          id="f-city"
          type="text"
          placeholder="Any city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="filter">
        <label htmlFor="f-country">Country</label>
        <select id="f-country" value={filters.country} onChange={update('country')}>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label htmlFor="f-date">When</label>
        <select id="f-date" value={filters.dateRange} onChange={update('dateRange')}>
          {DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label htmlFor="f-sort">Sort by</label>
        <select id="f-sort" value={filters.sort} onChange={update('sort')}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="filter filter-actions">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!dirty}
          onClick={() => dispatch(resetFilters())}
        >
          Clear filters
        </button>
      </div>
    </form>
  );
}
