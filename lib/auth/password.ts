const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "123456789",
  "qwerty123",
  "letmein",
  "admin123",
  "welcome123",
  "iloveyou",
  "abc123",
  "monkey123"
]);

export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
    commonBlocked: boolean;
  };
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  // An empty field is not a weak password, it is no password. Without this
  // guard the `commonBlocked` check passes vacuously ("" is not in the
  // common list) and an untouched box scored 15%, which both reads as
  // nonsense and makes the meter look like blank input has some strength.
  if (password.length === 0) {
    return {
      valid: false,
      score: 0,
      checks: {
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
        commonBlocked: false
      },
      message: "Password must be at least 10 characters."
    };
  }

  const checks = {
    minLength: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    commonBlocked: !COMMON_PASSWORDS.has(password.toLowerCase())
  };

  const categories = [checks.uppercase, checks.lowercase, checks.number, checks.symbol].filter(Boolean).length;
  const valid = checks.minLength && checks.commonBlocked && categories >= 3;

  let message: string | undefined;
  if (!checks.minLength) {
    message = "Password must be at least 10 characters.";
  } else if (!checks.commonBlocked) {
    message = "This password is too common. Please choose a stronger one.";
  } else if (categories < 3) {
    message = "Use at least 3 of these: uppercase, lowercase, number, symbol.";
  }

  const score =
    (checks.minLength ? 25 : 0) +
    (checks.uppercase ? 15 : 0) +
    (checks.lowercase ? 15 : 0) +
    (checks.number ? 15 : 0) +
    (checks.symbol ? 15 : 0) +
    (checks.commonBlocked ? 15 : 0);

  return {
    valid,
    score,
    checks,
    message
  };
}
