import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadJSON } from '../../utils/storage';
import { snapshotEvent } from '../../utils/events';

export const REGISTRATIONS_STORAGE_KEY = 'doorlist_registrations';

const persisted = loadJSON(REGISTRATIONS_STORAGE_KEY, {});

// Registrations are grouped by user id, so each account only ever sees its own.
const initialState = {
  byUser:
    persisted.byUser && typeof persisted.byUser === 'object' ? persisted.byUser : {},
};

const EMPTY = [];

export const registerForEvent = createAsyncThunk(
  'registrations/register',
  async (event, { getState, rejectWithValue }) => {
    const user = getState().auth.currentUser;
    if (!user) return rejectWithValue('Log in to register for events.');

    const existing = getState().registrations.byUser[user.id] ?? EMPTY;
    if (existing.some((r) => r.eventId === event.id)) {
      return rejectWithValue('You are already registered for this event.');
    }

    return {
      userId: user.id,
      registration: {
        eventId: event.id,
        registeredAt: new Date().toISOString(),
        event: snapshotEvent(event),
      },
    };
  }
);

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    cancelRegistration(state, action) {
      const { userId, eventId } = action.payload;
      state.byUser[userId] = (state.byUser[userId] ?? EMPTY).filter(
        (r) => r.eventId !== eventId
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerForEvent.fulfilled, (state, action) => {
      const { userId, registration } = action.payload;
      const list = state.byUser[userId] ?? [];
      // Second line of defence against duplicates.
      if (!list.some((r) => r.eventId === registration.eventId)) {
        state.byUser[userId] = [...list, registration];
      }
    });
  },
});

export const { cancelRegistration } = registrationsSlice.actions;

export const selectMyRegistrations = (state) => {
  const user = state.auth.currentUser;
  return user ? state.registrations.byUser[user.id] ?? EMPTY : EMPTY;
};

export const selectRegistrationFor = (eventId) => (state) =>
  selectMyRegistrations(state).find((r) => r.eventId === eventId);

export default registrationsSlice.reducer;
