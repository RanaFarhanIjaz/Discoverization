import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  registerUser,
  selectAuthError,
  selectAuthLoading,
} from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import TextField from '../components/TextField';
import {
  validateConfirm,
  validateEmail,
  validateName,
  validateNewPassword,
} from '../utils/validators';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const authError = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const errors = {
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
  };
  const shown = (field) => (touched[field] ? errors[field] : '');

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (Object.values(errors).some(Boolean)) return;

    const result = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Welcome to Doorlist, ${result.payload.name}.` }));
    }
  };

  return (
    <div className="auth-page container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-lead">Sign up to register for events and track them in one place.</p>

        {authError && <div className="form-alert" role="alert">{authError}</div>}

        <TextField
          id="reg-name"
          name="name"
          label="Name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={shown('name')}
        />
        <TextField
          id="reg-email"
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
          id="reg-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={shown('password')}
          hint="At least 8 characters, with a letter and a number."
        />
        <TextField
          id="reg-confirm"
          name="confirm"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={shown('confirm')}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
