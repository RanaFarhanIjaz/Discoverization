import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'You have been logged out.' }));
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true" />
          Doorlist
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="site-nav" className={open ? 'site-nav open' : 'site-nav'} aria-label="Main">
          <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>

          <div className="nav-account">
            {user ? (
              <>
                <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
