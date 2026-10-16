import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadJSON } from '../../utils/storage';
import { hashPassword, makeId } from '../../utils/hash';

export const AUTH_STORAGE_KEY = 'doorlist_auth';

// Restore users and the active session so login survives a page refresh.
const persisted = loadJSON(AUTH_STORAGE_KEY, {});

const initialState = {
  users: Array.isArray(persisted.users) ? persisted.users : [],
  currentUser: persisted.currentUser ?? null,
  status: 'idle',
  error: null,
};

const toPublicUser = ({ id, name, email }) => ({ id, name, email });

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { getState, rejectWithValue }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const taken = getState().auth.users.some((u) => u.email === normalizedEmail);
    if (taken) {
      return rejectWithValue('An account with this email already exists. Log in instead.');
    }
    return {
      id: makeId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password, normalizedEmail),
      createdAt: new Date().toISOString(),
    };
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { getState, rejectWithValue }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = getState().auth.users.find((u) => u.email === normalizedEmail);
    const hash = await hashPassword(password, normalizedEmail);
    if (!user || user.passwordHash !== hash) {
      return rejectWithValue('The email or password is incorrect.');
    }
    return toPublicUser(user);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.users.push(action.payload);
        state.currentUser = toPublicUser(action.payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.currentUser = action.payload;
      })
      .addMatcher(
        (action) => [registerUser.rejected.type, loginUser.rejected.type].includes(action.type),
        (state, action) => {
          state.status = 'idle';
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.status === 'loading';

export default authSlice.reducer;
