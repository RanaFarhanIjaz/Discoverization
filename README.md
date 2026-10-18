# Doorlist: Event Management System

A React app for exploring live events, registering for them, and managing your registrations. Built for Web Programming Assignment 2 with **React**, **Redux Toolkit**, **React Router**, and the **Ticketmaster Discovery API**.

## Features

- **Authentication (frontend simulation):** register, log in, and log out. Passwords are hashed before they are stored. The session survives a page refresh through `localStorage`.
- **Event exploration:** search by keyword, filter by category, city, country, and date range, sort results, and page through them. The home page shows upcoming events and category tiles.
- **Event details:** name, date and time in the venue's time zone, venue and address, location with a map link, category and genre, image, price range, performers, notes, and seat map when the API provides them.
- **Registration:** logged-in users can register, cannot register twice, get a toast confirming the result, and can cancel. Registrations are stored per user.
- **My events:** registrations split into **Upcoming** and **Completed**. Only upcoming events can be cancelled.
- **Protected routes:** `/my-events` requires login. Login and register redirect away when already signed in. Logging in returns you to the page you were trying to reach.
- **Loading, error, and empty states** on every screen that talks to the API, plus form validation with inline messages.
- **Responsive and accessible:** works down to phone widths, keyboard focus is visible, a skip link is provided, and reduced motion is respected.

## Tech stack

React 18, Redux Toolkit, React Redux, React Router 6, Vite.

## Setup

1. **Get an API key.** Create a free account at <https://developer.ticketmaster.com/> and copy the **Consumer Key** of your app.
2. **Install dependencies.**
   ```bash
   npm install
   ```
3. **Add your key.** Copy the example file and paste your key into it.
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_TM_API_KEY=your_consumer_key_here
   ```
   `.env` is git-ignored. Never commit it.
4. **Run the app.**
   ```bash
   npm run dev
   ```
   Open the URL Vite prints (usually <http://localhost:5173>).

Other scripts: `npm run build` creates a production build in `dist/`, and `npm run preview` serves it locally.

> Restart the dev server after changing `.env`. Vite only reads it at startup.

## Project structure

```
src/
  app/store.js                      configureStore + localStorage persistence
  features/
    auth/authSlice.js               users, current user, register/login thunks
    events/eventsSlice.js           filters, event list, details, categories
    registrations/registrationsSlice.js   registrations grouped by user id
    ui/uiSlice.js                   toast notifications
  services/ticketmaster.js          API calls and response normalization
  utils/                            date formatting, validators, hashing, storage
  hooks/useCancelRegistration.jsx   shared cancel-with-confirmation flow
  components/                       Navbar, EventCard, SearchFilters, route guards, ...
  pages/                            Home, Events, EventDetails, MyEvents, Login, Register
  styles/index.css                  design tokens and all styles
```

## Redux design

| Slice | State | Notes |
| --- | --- | --- |
| `auth` | `users`, `currentUser`, `status`, `error` | `registerUser` and `loginUser` are `createAsyncThunk`s. State is saved to `localStorage`. |
| `events` | `filters`, `items`, `pageInfo`, `status`, `upcoming`, `selected`, `categories` | Thunks fetch from the API. Stale requests are aborted when filters change. |
| `registrations` | `byUser: { [userId]: Registration[] }` | `registerForEvent` rejects duplicates. Each registration keeps a snapshot of the event so My Events works offline. |
| `ui` | `toasts` | Feedback after registering, cancelling, and logging in or out. |

Components use `useSelector` to read state and `useDispatch` to trigger actions.

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | public |
| `/events` | Event list with search and filters | public |
| `/events/:id` | Event details and registration | public |
| `/login`, `/register` | Authentication | guests only |
| `/my-events` | Your registrations | logged in only |

## API notes

- Endpoints used: `/events.json` (search, filters, upcoming), `/events/{id}.json` (details), `/classifications.json` (categories).
- The free tier allows 5,000 requests per day and 2 per second. Search input is debounced, outdated requests are cancelled, and a rate-limited request is retried once.
- The API does not allow deep paging, so results are capped at 83 pages of 12.

## Git workflow

Work in small steps and commit as you go. One branch per feature, merged through a Pull Request, works well:

| Branch | Example commits |
| --- | --- |
| `main` | Initial React project setup, Add README and .gitignore |
| `feature/auth` | Add authentication pages, Implement Redux authentication, Add protected routes |
| `feature/api` | Add Ticketmaster API integration, Add event listing |
| `feature/search` | Implement event search, Add category and date filters |
| `feature/registration` | Add event details page, Add event registration, Prevent duplicate registration |
| `feature/my-events` | Add My Events, Add cancel registration |
| `feature/polish` | Improve responsive UI, Add loading and error states |

```bash
git init
git add .
git commit -m "Initial React project setup"
git branch -M main
git remote add origin https://github.com/<your-username>/event-management-system.git
git push -u origin main
```

Before pushing, run `git status` and confirm `.env` does not appear.
