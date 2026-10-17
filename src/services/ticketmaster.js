const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = import.meta.env.VITE_TM_API_KEY;

export const PAGE_SIZE = 12;
// The Discovery API refuses deep paging: size * page must stay under 1000.
export const MAX_PAGES = Math.floor(1000 / PAGE_SIZE);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toApiDate = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

async function request(path, params = {}, signal, attempt = 0) {
  if (!API_KEY) {
    throw new Error(
      'The Ticketmaster API key is missing. Add VITE_TM_API_KEY to your .env file and restart the dev server.'
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apikey', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, { signal });

  // The free quota is 2 requests/second, so retry once after a short pause.
  if (response.status === 429 && attempt < 1) {
    await sleep(1200);
    return request(path, params, signal, attempt + 1);
  }
  if (response.status === 429) {
    throw new Error('Too many requests to Ticketmaster. Wait a moment and try again.');
  }
  if (response.status === 401) {
    throw new Error('Ticketmaster rejected the API key. Check VITE_TM_API_KEY in your .env file.');
  }
  if (response.status === 404) {
    throw new Error('We could not find that event. It may have been removed.');
  }
  if (!response.ok) {
    throw new Error(`Ticketmaster returned an error (${response.status}). Try again shortly.`);
  }
  return response.json();
}

function bestImage(images = [], minWidth = 0) {
  const wide = images.filter((img) => img.ratio === '16_9' && !img.fallback);
  const pool = (wide.length ? wide : images).slice().sort((a, b) => a.width - b.width);
  return (pool.find((img) => img.width >= minWidth) || pool[pool.length - 1])?.url || '';
}

const clean = (name) => (name && name !== 'Undefined' ? name : '');

export function normalizeEvent(raw) {
  const venue = raw._embedded?.venues?.[0];
  const classification =
    raw.classifications?.find((c) => c.primary) || raw.classifications?.[0];
  const price = raw.priceRanges?.[0];

  return {
    id: raw.id,
    name: raw.name,
    url: raw.url || '',
    image: bestImage(raw.images, 500),
    imageLarge: bestImage(raw.images, 1000),
    startISO: raw.dates?.start?.dateTime || '',
    localDate: raw.dates?.start?.localDate || '',
    localTime: raw.dates?.start?.localTime || '',
    timezone: raw.dates?.timezone || venue?.timezone || '',
    status: raw.dates?.status?.code || '',
    segment: clean(classification?.segment?.name),
    genre: clean(classification?.genre?.name),
    subGenre: clean(classification?.subGenre?.name),
    venue: {
      name: venue?.name || '',
      address: venue?.address?.line1 || '',
      city: venue?.city?.name || '',
      state: venue?.state?.name || venue?.state?.stateCode || '',
      country: venue?.country?.name || '',
      postalCode: venue?.postalCode || '',
      url: venue?.url || '',
    },
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency || '',
    info: raw.info || '',
    pleaseNote: raw.pleaseNote || '',
    seatmap: raw.seatmap?.staticUrl || '',
    promoter: raw.promoter?.name || '',
    ticketLimit: raw.ticketLimit?.info || '',
    ageRestriction: raw.ageRestrictions?.legalAgeEnforced ? 'Age restrictions apply' : '',
    attractions: (raw._embedded?.attractions || []).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url || '',
      image: bestImage(a.images, 300),
    })),
  };
}

// Turns the "When" filter into startDateTime / endDateTime parameters.
export function dateRangeToParams(range) {
  const now = new Date();
  const params = { startDateTime: toApiDate(now) };
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 0);
    return d;
  };

  if (range === 'today') {
    params.endDateTime = toApiDate(endOfDay(now));
  } else if (range === 'week') {
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    params.endDateTime = toApiDate(end);
  } else if (range === 'month') {
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    params.endDateTime = toApiDate(end);
  } else if (range === 'weekend') {
    const day = now.getDay(); // 0 Sunday ... 6 Saturday
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + ((6 - day + 7) % 7));
    saturday.setHours(0, 0, 0, 0);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    // If it's already the weekend, start from now instead of the past.
    params.startDateTime = toApiDate(day === 0 || day === 6 ? now : saturday);
    params.endDateTime = toApiDate(endOfDay(day === 0 ? now : sunday));
  }
  return params;
}

export async function getEvents(filters, { signal, size = PAGE_SIZE } = {}) {
  const data = await request(
    '/events.json',
    {
      keyword: filters.keyword?.trim(),
      classificationName: filters.category,
      city: filters.city?.trim(),
      countryCode: filters.country,
      sort: filters.sort,
      page: filters.page,
      size,
      ...dateRangeToParams(filters.dateRange),
    },
    signal
  );

  const events = (data._embedded?.events || []).map(normalizeEvent);
  const page = data.page || {};
  return {
    events,
    pageInfo: {
      totalElements: page.totalElements || 0,
      totalPages: Math.min(page.totalPages || 0, MAX_PAGES),
      number: page.number || 0,
    },
  };
}

export async function getEventById(id, signal) {
  const raw = await request(`/events/${encodeURIComponent(id)}.json`, {}, signal);
  return normalizeEvent(raw);
}

export async function getCategories(signal) {
  const data = await request('/classifications.json', { size: 50 }, signal);
  const names = (data._embedded?.classifications || [])
    .map((c) => c.segment?.name)
    .filter((name) => name && name !== 'Undefined');
  return [...new Set(names)].sort();
}
