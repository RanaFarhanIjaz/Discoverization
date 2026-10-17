import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCategories,
  getEventById,
  getEvents,
} from '../../services/ticketmaster';

export const defaultFilters = {
  keyword: '',
  category: '',
  city: '',
  country: '',
  dateRange: 'any',
  sort: 'date,asc',
  page: 0,
};

export const FALLBACK_CATEGORIES = ['Arts & Theatre', 'Film', 'Miscellaneous', 'Music', 'Sports'];

const messageOf = (error) => error?.message || 'Something went wrong. Try again.';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters, { signal, rejectWithValue }) => {
    try {
      return await getEvents(filters, { signal });
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const fetchUpcoming = createAsyncThunk(
  'events/fetchUpcoming',
  async (_, { signal, rejectWithValue }) => {
    try {
      const { events } = await getEvents(
        { ...defaultFilters, sort: 'date,asc' },
        { signal, size: 6 }
      );
      return events;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id, { signal, rejectWithValue }) => {
    try {
      return await getEventById(id, signal);
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'events/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const names = await getCategories();
      return names.length ? names : FALLBACK_CATEGORIES;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  },
  // Categories rarely change, so load them once per visit.
  { condition: (_, { getState }) => getState().events.categoriesStatus === 'idle' }
);

const initialState = {
  filters: { ...defaultFilters },
  items: [],
  pageInfo: { totalElements: 0, totalPages: 0, number: 0 },
  status: 'idle',
  error: null,
  upcoming: { items: [], status: 'idle', error: null },
  selected: null,
  selectedStatus: 'idle',
  selectedError: null,
  categories: [],
  categoriesStatus: 'idle',
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Changing any filter returns to page 1 unless a page is given explicitly.
    setFilters(state, action) {
      const next = { page: 0, ...action.payload };
      state.filters = { ...state.filters, ...next };
    },
    resetFilters(state) {
      state.filters = { ...defaultFilters };
    },
    clearSelected(state) {
      state.selected = null;
      state.selectedStatus = 'idle';
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Event list
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.events;
        state.pageInfo = action.payload.pageInfo;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.aborted) return; // superseded by a newer search
        state.status = 'failed';
        state.error = action.payload || messageOf(action.error);
      })
      // Upcoming strip on the home page
      .addCase(fetchUpcoming.pending, (state) => {
        state.upcoming.status = 'loading';
        state.upcoming.error = null;
      })
      .addCase(fetchUpcoming.fulfilled, (state, action) => {
        state.upcoming.status = 'succeeded';
        state.upcoming.items = action.payload;
      })
      .addCase(fetchUpcoming.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.upcoming.status = 'failed';
        state.upcoming.error = action.payload || messageOf(action.error);
      })
      // Single event
      .addCase(fetchEventById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedError = null;
        state.selected = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.selectedStatus = 'failed';
        state.selectedError = action.payload || messageOf(action.error);
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        // The filter still works with the common segments if the lookup fails.
        state.categoriesStatus = 'succeeded';
        state.categories = FALLBACK_CATEGORIES;
      });
  },
});

export const { setFilters, resetFilters, clearSelected } = eventsSlice.actions;

export const selectFilters = (state) => state.events.filters;
export const selectCategories = (state) => state.events.categories;

export default eventsSlice.reducer;
