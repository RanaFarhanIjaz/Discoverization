import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AUTH_STORAGE_KEY } from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import registrationsReducer, {
  REGISTRATIONS_STORAGE_KEY,
} from '../features/registrations/registrationsSlice';
import uiReducer from '../features/ui/uiSlice';
import { saveJSON } from '../utils/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    registrations: registrationsReducer,
    ui: uiReducer,
  },
});

// Persist only the slices that must survive a refresh, and only when they change.
let lastAuth;
let lastRegistrations;

store.subscribe(() => {
  const { auth, registrations } = store.getState();

  if (auth.users !== lastAuth?.users || auth.currentUser !== lastAuth?.currentUser) {
    saveJSON(AUTH_STORAGE_KEY, { users: auth.users, currentUser: auth.currentUser });
  }
  if (registrations.byUser !== lastRegistrations?.byUser) {
    saveJSON(REGISTRATIONS_STORAGE_KEY, { byUser: registrations.byUser });
  }

  lastAuth = auth;
  lastRegistrations = registrations;
});
