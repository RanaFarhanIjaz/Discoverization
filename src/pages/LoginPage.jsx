import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthLoading,
} from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import TextField from '../components/TextField';
import { validateEmail, validateExistingPassword } from '../utils/validators';

export default function LoginPage() {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const errors = {
    email: validateEmail(values.email),
    password: validateExistingPassword(values.password),
  };
  const shown = (field) => (touched[field] ? errors[field] : '');

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;

    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Welcome back, ${result.payload.name}.` }));
    }
  };

  return (
    <div className="auth-page container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-title">Log in</h1>
        <p className="auth-lead">Pick up where you left off.</p>

        {authError && <div className="form-alert" role="alert">{authError}</div>}

        <TextField
          id="login-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={shown('email')}
        />
        <TextField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={shown('password')}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in' : 'Log in'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
