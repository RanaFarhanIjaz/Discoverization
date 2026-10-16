const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateName = (value) => {
  const name = value.trim();
  if (!name) return 'Enter your name.';
  if (name.length < 2) return 'Your name needs at least 2 characters.';
  return '';
};

export const validateEmail = (value) => {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email, like name@example.com.';
  return '';
};

export const validateNewPassword = (value) => {
  if (!value) return 'Create a password.';
  if (value.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Include at least one letter and one number.';
  }
  return '';
};

export const validateExistingPassword = (value) =>
  value ? '' : 'Enter your password.';

export const validateConfirm = (password, confirm) => {
  if (!confirm) return 'Re-enter your password.';
  if (password !== confirm) return 'The passwords do not match.';
  return '';
};
