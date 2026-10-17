import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

// Login and register are pointless once signed in, so redirect away from them.
export default function GuestRoute() {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (user) {
    const destination = location.state?.from?.pathname || '/events';
    return <Navigate to={destination} replace />;
  }
  return <Outlet />;
}
